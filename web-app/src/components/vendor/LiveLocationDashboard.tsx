import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  Users,
  Clock,
  Truck,
  AlertCircle,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  Activity,
  Target,
  Zap,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import {
  useVendorLocationStatus,
  useDeliveryOpportunities,
} from "@/hooks/useVendorConsumerSales";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useVendorRealTime } from "@/hooks/useRealTime";
import { getCardStyles } from "@/utils/styles";
import ApiClient from "@/services/api";

interface LocationAnalytics {
  totalOnlineTime: number;
  averageSessionTime: number;
  ordersReceived: number;
  proximityNotificationsSent: number;
  uniqueConsumersReached: number;
  peakHours: string[];
  conversionRate: number;
}

// DeliveryOpportunity interface is imported from useVendorConsumerSales hook

export function LiveLocationDashboard() {
  const { location, requestLocation, locationError } = useLocation();
  const { socket, isConnected } = useWebSocket();
  const {
    status: vendorStatus,
    loading: statusLoading,
    error: statusError,
    goOnline,
    goOffline,
    updateLocation: updateVendorLocation,
    refetch: refetchStatus,
  } = useVendorLocationStatus();
  const {
    opportunities,
    loading: opportunitiesLoading,
    refetch: refetchOpportunities,
  } = useDeliveryOpportunities(location);
  const { vendorEvents, clearEvents } = useVendorRealTime();

  const [analytics, setAnalytics] = useState<LocationAnalytics>({
    totalOnlineTime: 0,
    averageSessionTime: 0,
    ordersReceived: 0,
    proximityNotificationsSent: 0,
    uniqueConsumersReached: 0,
    peakHours: [],
    conversionRate: 0,
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [autoNotifications, setAutoNotifications] = useState(true);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(
    null
  );

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await ApiClient.get("/analytics/vendor-location");
        if (response.data?.success && response.data.data?.analytics) {
          setAnalytics(response.data.data.analytics);
        }
      } catch (error) {
        console.error("Failed to fetch location analytics:", error);
        // Keep default analytics on error
      }
    };

    if (vendorStatus.isOnline) {
      fetchAnalytics();
    }
  }, [vendorStatus.isOnline]);

  // Real-time location updates
  useEffect(() => {
    if (!vendorStatus.isOnline || !socket || !isConnected) return;

    let watchId: number | null = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Update backend
          updateVendorLocation(newLocation).catch(console.error);
          setLastLocationUpdate(new Date());

          // Broadcast via Socket.io
          socket.emit("vendor-location-update", {
            longitude: newLocation.longitude,
            latitude: newLocation.latitude,
            isActive: vendorStatus.acceptingOrders,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          console.warn("Location watch error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000, // 30 seconds
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [
    vendorStatus.isOnline,
    socket,
    isConnected,
    updateVendorLocation,
    vendorStatus.acceptingOrders,
  ]);

  // Auto-send proximity notifications
  useEffect(() => {
    if (!autoNotifications || !vendorStatus.isOnline || !location) return;

    const interval = setInterval(async () => {
      try {
        await ApiClient.post("/location/notify-proximity", {
          latitude: location.latitude,
          longitude: location.longitude,
          message: "Fresh products available for delivery!",
        });
      } catch (error) {
        console.error("Failed to send auto proximity notification:", error);
      }
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [autoNotifications, vendorStatus.isOnline, location]);

  const handleGoOnline = async () => {
    try {
      let coords = vendorStatus.currentLocation;

      if (!coords) {
        if (navigator.geolocation) {
          coords = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) =>
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                }),
              reject,
              { enableHighAccuracy: true, timeout: 10000 }
            );
          });
        }
      }

      await goOnline(coords);

      if (socket && isConnected && coords) {
        socket.emit("vendor-online", {
          longitude: coords.longitude,
          latitude: coords.latitude,
        });
      }
    } catch (error) {
      console.error("Failed to go online:", error);
      alert(
        "Failed to go online. Please check your location permissions and try again."
      );
    }
  };

  const handleGoOffline = async () => {
    try {
      await goOffline();

      if (socket && isConnected) {
        socket.emit("vendor-offline");
      }
    } catch (error) {
      console.error("Failed to go offline:", error);
      alert("Failed to go offline. Please try again.");
    }
  };

  const handleSendProximityNotification = async () => {
    const currentLocation = vendorStatus.currentLocation || location;

    if (!currentLocation) {
      alert("Location is required to send proximity notifications");
      return;
    }

    try {
      await ApiClient.post("/location/notify-proximity", {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        message: "Fresh products available for delivery!",
      });
      alert("Proximity notification sent to nearby consumers!");
    } catch (error) {
      console.error("Failed to send proximity notification:", error);
      alert("Failed to send notification. Please try again.");
    }
  };

  const formatUptime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatLastUpdate = () => {
    if (!lastLocationUpdate) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - lastLocationUpdate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  const priorityOpportunities = useMemo(() => {
    return (opportunities || [])
      .filter((opp) => opp.priority === "high")
      .slice(0, 5);
  }, [opportunities]);

  const getStatusColor = () => {
    if (!vendorStatus.isOnline) return "text-gray-600";
    if (!vendorStatus.acceptingOrders) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusBadge = () => {
    if (!vendorStatus.isOnline)
      return {
        variant: "outline" as const,
        text: "Offline",
        color: "border-gray-300",
      };
    if (!vendorStatus.acceptingOrders)
      return {
        variant: "outline" as const,
        text: "Online (Not Accepting)",
        color: "border-yellow-300 text-yellow-700",
      };
    return {
      variant: "default" as const,
      text: "Online & Available",
      color: "bg-green-500",
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard/vendor">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Live Location Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time location sharing and delivery management
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>Live Location Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={statusBadge.variant}
                className={statusBadge.color}
              >
                {statusBadge.text}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Real-time location sharing and delivery opportunity management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`p-2 rounded-full ${
                    vendorStatus.currentLocation
                      ? "bg-green-100"
                      : "bg-yellow-100"
                  }`}
                >
                  <Navigation
                    className={`h-4 w-4 ${
                      vendorStatus.currentLocation
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {vendorStatus.currentLocation
                      ? "Location Active"
                      : "Location Not Set"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {formatLastUpdate()}
                  </p>
                </div>
              </div>
              {vendorStatus.currentLocation && (
                <div className="text-xs text-muted-foreground">
                  <p>Lat: {vendorStatus.currentLocation.latitude.toFixed(4)}</p>
                  <p>
                    Lng: {vendorStatus.currentLocation.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>

            {/* Online Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`p-2 rounded-full ${
                    vendorStatus.isOnline ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Truck className={`h-4 w-4 ${getStatusColor()}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {vendorStatus.isOnline ? "Online" : "Offline"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vendorStatus.onlineSince
                      ? `Since ${new Date(
                          vendorStatus.onlineSince
                        ).toLocaleTimeString()}`
                      : "Not online"}
                  </p>
                </div>
              </div>
              {vendorStatus.isOnline && (
                <div className="text-xs text-muted-foreground">
                  <p>
                    Uptime: {formatUptime(vendorStatus.totalOnlineTime || 0)}
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Settings */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-full bg-purple-100">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Delivery Radius</p>
                  <p className="text-xs text-muted-foreground">
                    {(vendorStatus.deliveryRadius / 1000).toFixed(1)} km
                    coverage
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>
                  Orders:{" "}
                  {vendorStatus.acceptingOrders ? "Accepting" : "Not accepting"}
                </p>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              {vendorStatus.isOnline ? (
                <Button
                  variant="outline"
                  onClick={handleGoOffline}
                  disabled={statusLoading}
                >
                  {statusLoading && (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Go Offline
                </Button>
              ) : (
                <Button onClick={handleGoOnline} disabled={statusLoading}>
                  {statusLoading && (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Go Online
                </Button>
              )}

              <Button
                variant="outline"
                onClick={requestLocation}
                disabled={statusLoading}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Update Location
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleSendProximityNotification}
                disabled={
                  !vendorStatus.isOnline ||
                  (!vendorStatus.currentLocation && !location)
                }
              >
                <Bell className="h-4 w-4 mr-2" />
                Notify Nearby
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showAnalytics ? "Hide" : "Show"} Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error States */}
      {(statusError || locationError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Location Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {statusError?.message ||
                locationError ||
                "Unable to access location services"}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                refetchStatus();
                requestLocation();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analytics */}
      {showAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Location Analytics</span>
            </CardTitle>
            <CardDescription>
              Performance metrics for your location-based services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">
                  {analytics.ordersReceived}
                </p>
                <p className="text-xs text-blue-700">Orders Received</p>
              </div>
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-2xl font-bold text-green-900">
                  {analytics.uniqueConsumersReached}
                </p>
                <p className="text-xs text-green-700">Consumers Reached</p>
              </div>
              <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-2xl font-bold text-purple-900">
                  {analytics.proximityNotificationsSent}
                </p>
                <p className="text-xs text-purple-700">Notifications Sent</p>
              </div>
              <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-2xl font-bold text-orange-900">
                  {(analytics.conversionRate * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-orange-700">Conversion Rate</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Peak Hours:</p>
              <div className="flex flex-wrap gap-2">
                {analytics.peakHours.map((hour, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {hour}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <span>Nearby Opportunities</span>
              <Badge variant="outline" className="ml-2">
                {opportunities?.length || 0} available
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={refetchOpportunities}
              disabled={opportunitiesLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  opportunitiesLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            High-priority delivery opportunities in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          {opportunitiesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : priorityOpportunities.length === 0 ? (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No high-priority opportunities nearby
              </p>
              <p className="text-xs text-muted-foreground">
                {vendorStatus.isOnline
                  ? "Keep your location active to receive opportunities"
                  : "Go online to see delivery opportunities"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {priorityOpportunities.map((opportunity, index) => (
                <div
                  key={opportunity.id || index}
                  className={`${getCardStyles("hover")} p-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-orange-100">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-sm">
                            {opportunity.consumerName}
                          </p>
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {opportunity.distance}m away
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {opportunity.type === "pending_order" ? (
                            <>
                              Estimated Value: ₹{opportunity.estimatedValue} •{" "}
                              {opportunity.products?.join(", ")}
                            </>
                          ) : (
                            <>
                              Potential Customer • Interested in fresh produce
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(opportunity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {opportunity.type === "pending_order"
                        ? "View Order"
                        : "Contact"}
                    </Button>
                  </div>
                </div>
              ))}

              {opportunities &&
                opportunities.length > priorityOpportunities.length && (
                  <Button size="sm" variant="outline" className="w-full">
                    View All Opportunities ({opportunities.length})
                  </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      {vendorEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Recent Activity</span>
              </div>
              <Button size="sm" variant="outline" onClick={clearEvents}>
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vendorEvents.slice(0, 5).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                >
                  <div className="p-1 rounded-full bg-yellow-100">
                    <Activity className="h-3 w-3 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{event.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <span>Location Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  Auto Proximity Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Automatically notify nearby consumers every 5 minutes
                </p>
              </div>
              <Button
                size="sm"
                variant={autoNotifications ? "default" : "outline"}
                onClick={() => setAutoNotifications(!autoNotifications)}
              >
                {autoNotifications ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">High Accuracy Location</p>
                <p className="text-xs text-muted-foreground">
                  Use GPS for more precise location tracking
                </p>
              </div>
              <Button size="sm" variant="outline">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
