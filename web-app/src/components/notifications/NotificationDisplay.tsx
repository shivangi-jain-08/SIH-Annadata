import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  MapPin, 
  Package, 
  Eye, 
  X, 
  Phone,
  ShoppingCart,
  Clock,
  Users,
  Star,
  Navigation
} from 'lucide-react';
import { getCardStyles } from '@/utils/styles';

interface ProximityNotification {
  id: string;
  type: 'vendor_nearby' | 'vendor_departed' | 'vendor_updated';
  vendorId: string;
  vendorName: string;
  distance: number;
  estimatedArrival?: string;
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
  }>;
  productCount: number;
  hasProducts: boolean;
  vendorLocation: {
    longitude: number;
    latitude: number;
  };
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
  rating?: number;
}

interface NotificationDisplayProps {
  notifications: ProximityNotification[];
  onDismiss: (notificationId: string) => void;
  onViewProducts: (vendorId: string) => void;
  onContactVendor: (vendorId: string, phone?: string) => void;
  onClearAll: () => void;
  maxVisible?: number;
}

export function NotificationDisplay({
  notifications,
  onDismiss,
  onViewProducts,
  onContactVendor,
  onClearAll,
  maxVisible = 3
}: NotificationDisplayProps) {
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  // Auto-dismiss notifications after 30 seconds
  useEffect(() => {
    const timers = notifications.map(notification => {
      const notificationAge = Date.now() - new Date(notification.timestamp).getTime();
      const remainingTime = Math.max(0, 30000 - notificationAge); // 30 seconds

      return setTimeout(() => {
        onDismiss(notification.id);
      }, remainingTime);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, onDismiss]);

  const toggleExpanded = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50';
      case 'low':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-blue-300 bg-blue-50';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const notificationTime = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  const visibleNotifications = notifications.slice(0, maxVisible);
  const hiddenCount = Math.max(0, notifications.length - maxVisible);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">
            Vendors Nearby ({notifications.length})
          </h3>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onClearAll}
          className="text-xs"
        >
          Clear All
        </Button>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {visibleNotifications.map((notification) => {
          const isExpanded = expandedNotifications.has(notification.id);
          const priorityColor = getPriorityColor(notification.priority);
          const priorityIcon = getPriorityIcon(notification.priority);

          return (
            <Card 
              key={notification.id} 
              className={`${priorityColor} border-l-4 transition-all duration-300 ${
                isExpanded ? 'shadow-md' : 'shadow-sm'
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Main notification content */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full bg-white shadow-sm`}>
                        <Users className={`h-4 w-4 ${priorityIcon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {notification.vendorName}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {formatDistance(notification.distance)} away
                          </Badge>
                          {notification.priority && (
                            <Badge 
                              variant={notification.priority === 'high' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeAgo(notification.timestamp)}</span>
                          </div>
                          {notification.estimatedArrival && (
                            <div className="flex items-center space-x-1">
                              <Navigation className="h-3 w-3" />
                              <span>ETA: {notification.estimatedArrival}</span>
                            </div>
                          )}
                          {notification.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span>{notification.rating}</span>
                            </div>
                          )}
                        </div>

                        {/* Products preview */}
                        {notification.hasProducts && notification.products.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              Available products:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {notification.products.slice(0, isExpanded ? undefined : 3).map((product) => (
                                <Badge 
                                  key={product.id} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {product.name} (₹{product.price}/{product.unit})
                                </Badge>
                              ))}
                              {!isExpanded && notification.products.length > 3 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs cursor-pointer"
                                  onClick={() => toggleExpanded(notification.id)}
                                >
                                  +{notification.products.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="space-y-2 pt-2 border-t">
                            {notification.products.length > 3 && (
                              <div className="grid grid-cols-1 gap-1">
                                {notification.products.slice(3).map((product) => (
                                  <div key={product.id} className="flex items-center justify-between text-xs">
                                    <span>{product.name}</span>
                                    <span className="text-muted-foreground">
                                      ₹{product.price}/{product.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dismiss button */}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onDismiss(notification.id)}
                      className="flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onViewProducts(notification.vendorId)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Products
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onContactVendor(notification.vendorId)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    {notification.hasProducts && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewProducts(notification.vendorId)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Shop
                      </Button>
                    )}
                  </div>

                  {/* Expand/Collapse toggle */}
                  {notification.products.length > 3 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => toggleExpanded(notification.id)}
                      className="w-full text-xs"
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Hidden notifications indicator */}
        {hiddenCount > 0 && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">
                +{hiddenCount} more vendor{hiddenCount > 1 ? 's' : ''} nearby
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => {
                  // This could expand to show all notifications or navigate to a full list
                  alert('View all notifications feature coming soon!');
                }}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Auto-dismiss indicator */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Notifications auto-dismiss after 30 seconds
        </p>
      </div>
    </div>
  );
}

// Floating notification component for mobile/overlay display
export function FloatingNotificationDisplay({
  notifications,
  onDismiss,
  onViewProducts,
  onContactVendor,
  position = 'top-right'
}: NotificationDisplayProps & { position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' }) {
  if (notifications.length === 0) {
    return null;
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-sm space-y-2`}>
      {notifications.slice(0, 2).map((notification) => (
        <Card 
          key={notification.id}
          className="shadow-lg border-l-4 border-l-blue-500 bg-white animate-in slide-in-from-right duration-300"
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {notification.vendorName} is nearby
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {notification.distance < 1000 ? `${notification.distance}m` : `${(notification.distance / 1000).toFixed(1)}km`} away • {notification.productCount} products
                  </p>
                  <div className="flex space-x-1 mt-2">
                    <Button 
                      size="sm" 
                      className="text-xs px-2 py-1 h-6"
                      onClick={() => onViewProducts(notification.vendorId)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs px-2 py-1 h-6"
                      onClick={() => onDismiss(notification.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {notifications.length > 2 && (
        <Card className="shadow-lg bg-white">
          <CardContent className="p-2 text-center">
            <p className="text-xs text-muted-foreground">
              +{notifications.length - 2} more notifications
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}