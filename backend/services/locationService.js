const redisClient = require('../config/redis');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Update vendor location in Redis
 */
const updateVendorLocation = async (vendorId, longitude, latitude) => {
  try {
    // For now, just update the user's location in the database
    // Redis geo-spatial features can be added later when needed
    const user = await User.findById(vendorId);
    if (!user) {
      throw new Error('Vendor not found');
    }

    // Update user location in database
    user.location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    await user.save();

    // Try to update Redis if available
    if (redisClient.isReady()) {
      try {
        const client = redisClient.getClient();
        const key = 'vendors:active';

        // Add vendor location to Redis geo-spatial index
        await client.geoAdd(key, {
          longitude,
          latitude,
          member: vendorId.toString()
        });

        // Store additional vendor info with TTL
        const ttl = parseInt(process.env.CACHE_TTL_VENDOR_LOCATION) || 300;
        const vendorInfo = {
          vendorId: vendorId.toString(),
          longitude,
          latitude,
          lastUpdate: new Date().toISOString(),
          isActive: true
        };

        await client.setEx(
          `vendor:location:${vendorId}`,
          ttl,
          JSON.stringify(vendorInfo)
        );

        logger.info('Vendor location updated in Redis', {
          vendorId,
          coordinates: [longitude, latitude]
        });
      } catch (redisError) {
        logger.warn('Redis update failed, but database updated successfully', {
          vendorId,
          error: redisError.message
        });
      }
    }

    logger.info('Vendor location updated', {
      vendorId,
      coordinates: [longitude, latitude]
    });

    return { success: true, coordinates: [longitude, latitude] };
  } catch (error) {
    logger.error('Update vendor location failed:', error);
    throw new Error('Failed to update vendor location');
  }
};

/**
 * Get nearby vendors for a consumer
 */
const getNearbyVendors = async (longitude, latitude, radius = 5000) => {
  try {
    if (!redisClient.isReady()) {
      // Fallback to database query if Redis is not available
      return await getNearbyVendorsFromDB(longitude, latitude, radius);
    }

    const client = redisClient.getClient();
    const key = 'vendors:active';

    // Get vendors within radius using Redis GEORADIUS
    const nearbyVendors = await client.geoRadius(key, {
      longitude,
      latitude
    }, radius, 'M', {
      WITHCOORD: true,
      WITHDIST: true
    });

    // Get detailed vendor information
    const vendorDetails = [];
    for (const vendor of nearbyVendors) {
      const vendorId = vendor.member;
      const distance = parseFloat(vendor.distance);
      const coordinates = vendor.coordinates;

      try {
        // Get vendor info from cache
        const vendorInfoStr = await client.get(`vendor:location:${vendorId}`);
        let vendorInfo = vendorInfoStr ? JSON.parse(vendorInfoStr) : null;

        // If not in cache, get from database
        if (!vendorInfo) {
          const user = await User.findById(vendorId).select('name phone location isActive');
          if (user && user.isActive) {
            vendorInfo = {
              vendorId: user._id,
              name: user.name,
              phone: user.phone,
              longitude: coordinates.longitude,
              latitude: coordinates.latitude,
              isActive: true
            };
          }
        }

        if (vendorInfo && vendorInfo.isActive) {
          vendorDetails.push({
            ...vendorInfo,
            distance: Math.round(distance * 1000), // Convert to meters
            coordinates: [coordinates.longitude, coordinates.latitude]
          });
        }
      } catch (err) {
        logger.warn('Failed to get vendor details', { vendorId, error: err.message });
      }
    }

    logger.info('Nearby vendors retrieved', {
      searchLocation: [longitude, latitude],
      radius,
      vendorsFound: vendorDetails.length
    });

    return vendorDetails;
  } catch (error) {
    logger.error('Get nearby vendors failed:', error);
    // Fallback to database query
    return await getNearbyVendorsFromDB(longitude, latitude, radius);
  }
};

/**
 * Fallback method to get nearby vendors from database
 */
const getNearbyVendorsFromDB = async (longitude, latitude, radius) => {
  try {
    const vendors = await User.findNearby(longitude, latitude, radius)
      .where('role').equals('vendor')
      .select('name phone location isActive');

    const vendorDetails = vendors.map(vendor => ({
      vendorId: vendor._id,
      name: vendor.name,
      phone: vendor.phone,
      coordinates: vendor.location.coordinates,
      isActive: vendor.isActive,
      distance: null // Distance calculation would need to be done separately
    }));

    logger.info('Nearby vendors retrieved from database fallback', {
      searchLocation: [longitude, latitude],
      radius,
      vendorsFound: vendorDetails.length
    });

    return vendorDetails;
  } catch (error) {
    logger.error('Database fallback for nearby vendors failed:', error);
    throw new Error('Failed to retrieve nearby vendors');
  }
};

/**
 * Get nearby consumers for a vendor
 */
const getNearbyConsumers = async (longitude, latitude, radius = 5000) => {
  try {
    // For consumers, we'll use database query since they don't update location as frequently
    const consumers = await User.findNearby(longitude, latitude, radius)
      .where('role').equals('consumer')
      .select('name phone location isActive');

    const consumerDetails = consumers.map(consumer => ({
      consumerId: consumer._id,
      name: consumer.name,
      phone: consumer.phone,
      coordinates: consumer.location.coordinates,
      isActive: consumer.isActive
    }));

    logger.info('Nearby consumers retrieved', {
      searchLocation: [longitude, latitude],
      radius,
      consumersFound: consumerDetails.length
    });

    return consumerDetails;
  } catch (error) {
    logger.error('Get nearby consumers failed:', error);
    throw new Error('Failed to retrieve nearby consumers');
  }
};

/**
 * Remove vendor from active locations
 */
const removeVendorLocation = async (vendorId) => {
  try {
    if (!redisClient.isReady()) {
      logger.warn('Redis not available for removing vendor location');
      return { success: false, message: 'Redis not available' };
    }

    const client = redisClient.getClient();
    const key = 'vendors:active';

    // Remove vendor from geo-spatial index
    await client.zRem(key, vendorId);

    // Remove vendor location info
    await client.del(`vendor:location:${vendorId}`);

    logger.info('Vendor location removed', { vendorId });

    return { success: true };
  } catch (error) {
    logger.error('Remove vendor location failed:', error);
    throw new Error('Failed to remove vendor location');
  }
};

/**
 * Get all active vendor locations
 */
const getActiveVendorLocations = async () => {
  try {
    if (!redisClient.isReady()) {
      throw new Error('Redis connection not available');
    }

    const client = redisClient.getClient();
    const key = 'vendors:active';

    // Get all vendors with their coordinates
    const vendors = await client.geoPos(key, await client.zRange(key, 0, -1));

    const activeVendors = [];
    for (let i = 0; i < vendors.length; i++) {
      const vendorId = (await client.zRange(key, i, i))[0];
      const coordinates = vendors[i];

      if (coordinates) {
        try {
          const vendorInfoStr = await client.get(`vendor:location:${vendorId}`);
          const vendorInfo = vendorInfoStr ? JSON.parse(vendorInfoStr) : null;

          if (vendorInfo && vendorInfo.isActive) {
            activeVendors.push({
              vendorId,
              coordinates: [coordinates.longitude, coordinates.latitude],
              lastUpdate: vendorInfo.lastUpdate
            });
          }
        } catch (err) {
          logger.warn('Failed to parse vendor info', { vendorId, error: err.message });
        }
      }
    }

    logger.info('Active vendor locations retrieved', {
      activeVendors: activeVendors.length
    });

    return activeVendors;
  } catch (error) {
    logger.error('Get active vendor locations failed:', error);
    throw new Error('Failed to retrieve active vendor locations');
  }
};

/**
 * Calculate distance between two points
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Get location statistics
 */
const getLocationStats = async () => {
  try {
    const stats = {
      activeVendors: 0,
      redisAvailable: redisClient.isReady()
    };

    if (redisClient.isReady()) {
      const client = redisClient.getClient();
      const key = 'vendors:active';
      stats.activeVendors = await client.zCard(key);
    }

    // Get total users by role from database
    const userStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    stats.totalUsers = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return stats;
  } catch (error) {
    logger.error('Get location stats failed:', error);
    throw new Error('Failed to retrieve location statistics');
  }
};

module.exports = {
  updateVendorLocation,
  getNearbyVendors,
  getNearbyConsumers,
  removeVendorLocation,
  getActiveVendorLocations,
  calculateDistance,
  getLocationStats
};