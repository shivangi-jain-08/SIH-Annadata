import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Package, 
  Phone, 
  Star,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLocationProvider } from '@/components/location/LocationProvider';
import { useNearbyVendors } from '@/hooks/useLocation';
import { useWebSocket } from '@/contexts/WebSocketContext';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const vendorIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981" width="32" height="32">
      <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V7H5v10h14v-1.586l2-2V18a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
      <path d="M7 9h10v2H7V9zm0 4h6v2H7v-2z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface VendorMapVendor {
  _id: string;
  name: string;
  phone: string;
  distance?: number;
  location: [number, number];
  products?: string[];
  rating?: number;
  isOnline?: boolean;
}

interface VendorMapProps {
  className?: string;
}

// Component to update map view when location changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export function VendorMap({ className }: VendorMapProps) {
  const { location, permission, error, requestPermission } = useLocationProvider();
  const { vendors, loading: vendorsLoading, refetch } = useNearbyVendors(location);
  const { isConnected } = useWebSocket();
  const [selectedVendor, setSelectedVendor] = useState<VendorMapVendor | null>(null);

  const defaultCenter: [number, number] = [28.6139, 77.2090]; // Delhi coordinates
  const mapCenter: [number, number] = location 
    ? [location.latitude, location.longitude] 
    : defaultCenter;

  const handleVendorSelect = useCallback((vendor: VendorMapVendor) => {
    setSelectedVendor(vendor);
  }, []);

  const handleContactVendor = useCallback((vendor: VendorMapVendor) => {
    if (vendor.phone) {
      window.open(`tel:${vendor.phone}`, '_self');
    }
  }, []);

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Distance unknown';
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    }
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  if (permission === 'denied') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-500" />
            <span>Location Access Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Location access is required to show nearby vendors on the map.
          </p>
          <Button onClick={requestPermission}>
            <Navigation className="h-4 w-4 mr-2" />
            Enable Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-yellow-500" />
            <span>Map Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>Nearby Vendors</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
              <Button size="sm" variant="outline" onClick={refetch}>
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {location 
              ? `Showing vendors near your location (${vendors?.length || 0} found)`
              : 'Getting your location...'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full relative">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapUpdater center={mapCenter} />

              {/* User Location Marker */}
              {location && (
                <Marker 
                  position={[location.latitude, location.longitude]} 
                  icon={userIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Your Location</p>
                      <p className="text-xs text-gray-600">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Vendor Markers */}
              {vendors?.map((vendor) => (
                <Marker
                  key={vendor._id}
                  position={[vendor.location[1], vendor.location[0]]}
                  icon={vendorIcon}
                  eventHandlers={{
                    click: () => handleVendorSelect(vendor),
                  }}
                >
                  <Popup>
                    <div className="min-w-48">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{vendor.name}</h3>
                        {vendor.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{vendor.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        {formatDistance(vendor.distance)}
                      </p>

                      {vendor.products && vendor.products.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium mb-1">Available:</p>
                          <div className="flex flex-wrap gap-1">
                            {vendor.products.slice(0, 3).map((product: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                            {vendor.products.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{vendor.products.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleVendorSelect(vendor)}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          View Products
                        </Button>
                        {vendor.phone && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleContactVendor(vendor)}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Loading Overlay */}
            {vendorsLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading vendors...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Your Location</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active Vendors</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Updates every 30 seconds</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Vendor Details */}
      {selectedVendor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedVendor.name}</span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedVendor(null)}
              >
                Close
              </Button>
            </CardTitle>
            <CardDescription>
              {formatDistance(selectedVendor.distance)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedVendor.products && selectedVendor.products.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Available Products:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVendor.products.map((product, index) => (
                      <Badge key={index} variant="outline">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Package className="h-4 w-4 mr-2" />
                  View All Products
                </Button>
                {selectedVendor.phone && (
                  <Button 
                    variant="outline"
                    onClick={() => handleContactVendor(selectedVendor)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}