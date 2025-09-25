import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  X,
  Eye,
  Phone
} from 'lucide-react';

interface ProximityNotificationProps {
  notification: {
    type: 'vendor-nearby' | 'vendor-departed' | 'vendor-updated';
    vendorId: string;
    vendorName: string;
    distance: number;
    coordinates: [number, number];
    products: string[];
    estimatedArrival: string;
    timestamp: Date;
    notificationId: string;
  };
  onDismiss: (notificationId: string) => void;
  onViewDetails: (vendorId: string) => void;
  onContact?: (vendorId: string) => void;
}

export function ProximityNotification({ 
  notification, 
  onDismiss, 
  onViewDetails, 
  onContact 
}: ProximityNotificationProps) {
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'vendor-nearby':
        return 'border-green-200 bg-green-50';
      case 'vendor-departed':
        return 'border-yellow-200 bg-yellow-50';
      case 'vendor-updated':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vendor-nearby':
        return <Truck className="h-5 w-5 text-green-600" />;
      case 'vendor-departed':
        return <MapPin className="h-5 w-5 text-yellow-600" />;
      case 'vendor-updated':
        return <Package className="h-5 w-5 text-blue-600" />;
      default:
        return <Truck className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'vendor-nearby':
        return 'Vendor Nearby!';
      case 'vendor-departed':
        return 'Vendor Left Area';
      case 'vendor-updated':
        return 'Vendor Updated';
      default:
        return 'Vendor Notification';
    }
  };

  return (
    <Card className={`fixed top-4 right-4 w-80 shadow-lg border-2 ${getNotificationColor(notification.type)} animate-slide-in-right z-50`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getNotificationIcon(notification.type)}
            <h3 className="font-semibold text-sm">
              {getNotificationTitle(notification.type)}
            </h3>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-gray-400 hover:text-gray-600"
            onClick={() => onDismiss(notification.notificationId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-900">{notification.vendorName}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{formatDistance(notification.distance)} away</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{notification.estimatedArrival}</span>
              </div>
            </div>
          </div>

          {notification.products && notification.products.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Available Products:</p>
              <div className="flex flex-wrap gap-1">
                {notification.products.slice(0, 3).map((product, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {product}
                  </Badge>
                ))}
                {notification.products.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{notification.products.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              onClick={() => onViewDetails(notification.vendorId)}
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            {onContact && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onContact(notification.vendorId)}
              >
                <Phone className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}