import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ConsumerMap.css';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface VendorLocation {
  vendorId: string;
  vendorName: string;
  coordinates: [number, number]; // [longitude, latitude]
  distance?: number;
  isActive: boolean;
  products?: string[];
  timestamp: string;
  estimatedArrival?: string;
}

interface ConsumerMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  nearbyVendors: VendorLocation[];
  onVendorClick?: (vendor: VendorLocation) => void;
}

const ConsumerMap: React.FC<ConsumerMapProps> = ({
  userLocation,
  nearbyVendors = [],
  onVendorClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const map = mapInstanceRef.current;
    const { latitude, longitude } = userLocation;

    // Remove existing user marker
    if (markersRef.current.user) {
      map.removeLayer(markersRef.current.user);
    }

    // Create user marker with custom icon
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div class="user-marker-inner">📍</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const userMarker = L.marker([latitude, longitude], { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div class="user-popup">
          <h4>Your Location</h4>
          <p>Lat: ${latitude.toFixed(6)}</p>
          <p>Lng: ${longitude.toFixed(6)}</p>
          ${userLocation.accuracy ? `<p>Accuracy: ${Math.round(userLocation.accuracy)}m</p>` : ''}
        </div>
      `);

    markersRef.current.user = userMarker;

    // Center map on user location
    map.setView([latitude, longitude], 15);

  }, [userLocation]);

  // Update vendor markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing vendor markers
    Object.keys(markersRef.current).forEach(key => {
      if (key.startsWith('vendor-')) {
        map.removeLayer(markersRef.current[key]);
        delete markersRef.current[key];
      }
    });

    // Add new vendor markers
    nearbyVendors.forEach(vendor => {
      if (!vendor.coordinates || vendor.coordinates.length !== 2) return;

      const [longitude, latitude] = vendor.coordinates;
      const vendorKey = `vendor-${vendor.vendorId}`;

      // Create vendor marker with custom icon
      const vendorIcon = L.divIcon({
        className: `vendor-marker ${vendor.isActive ? 'active' : 'inactive'}`,
        html: `<div class="vendor-marker-inner">🚚</div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });

      const vendorMarker = L.marker([latitude, longitude], { icon: vendorIcon })
        .addTo(map)
        .bindPopup(`
          <div class="vendor-popup">
            <h4>${vendor.vendorName}</h4>
            <p>Status: ${vendor.isActive ? 'Active' : 'Inactive'}</p>
            ${vendor.distance ? `<p>Distance: ${vendor.distance}m</p>` : ''}
            <p>Last seen: ${new Date(vendor.timestamp).toLocaleTimeString()}</p>
            <button onclick="window.handleVendorClick('${vendor.vendorId}')">
              View Details
            </button>
          </div>
        `);

      markersRef.current[vendorKey] = vendorMarker;

      // Add click handler
      vendorMarker.on('click', () => {
        if (onVendorClick) {
          onVendorClick(vendor);
        }
      });
    });

    // Expose vendor click handler to global scope for popup buttons
    (window as any).handleVendorClick = (vendorId: string) => {
      const vendor = nearbyVendors.find(v => v.vendorId === vendorId);
      if (vendor && onVendorClick) {
        onVendorClick(vendor);
      }
    };

  }, [nearbyVendors, onVendorClick]);

  return (
    <div className="vendor-map-container">
      <div 
        ref={mapRef} 
        className="vendor-map"
        style={{ height: '400px', width: '100%' }}
      />
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon user">📍</span>
          <span>Your Location</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon vendor active">🚚</span>
          <span>Active Vendor</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon vendor inactive">🚚</span>
          <span>Inactive Vendor</span>
        </div>
      </div>
      
      {nearbyVendors.length === 0 && (
        <div className="no-vendors-message">
          <p>No vendors nearby. Vendors will appear here when they're in your area.</p>
        </div>
      )}
    </div>
  );
};

export default ConsumerMap;