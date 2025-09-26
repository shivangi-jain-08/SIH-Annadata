import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Truck,
  Bell,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import ConsumerMap from "@/components/maps/ConsumerMap";
import { useLocation } from "@/hooks/useLocation";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { vendorSimulationService } from "@/services/vendorSimulationService";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  timestamp: Date;
  read: boolean;
}

const ConsumerMapDemo: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nearbyVendors, setNearbyVendors] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [manualLocation, setManualLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showManualLocationInput, setShowManualLocationInput] = useState(false);
  const connectAttempted = useRef(false);

  const { location, locationError, requestLocation } = useLocation();
  const { socket, isConnected, connect, updateLocation } = useWebSocket();

  // Use manual location if available, otherwise use detected location
  const currentLocation = manualLocation || location;

  // Auto-connect socket when component mounts
  useEffect(() => {
    if (!isConnected && !connectAttempted.current) {
      connectAttempted.current = true;
      connect();
    }
  }, [isConnected, connect]);

  // Request location only once when component mounts
  useEffect(() => {
    if (!location && !manualLocation && !locationError) {
      requestLocation();
    }
  }, []); // Empty dependency array to run only once on mount

  // Send location updates to server when location changes
  useEffect(() => {
    if (currentLocation && isConnected) {
      updateLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    }
  }, [currentLocation, isConnected, updateLocation]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleVendorNearby = (data: any) => {
      console.log("Vendor nearby notification:", data);

      const notification: Notification = {
        id: `vendor-nearby-${Date.now()}`,
        type: "vendor-nearby",
        title: "Vendor Nearby",
        message: `${data.vendorName} is ${data.distance}m away`,
        data: data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Show toast notification with shorter duration and dismissible
      toast.success(`${data.vendorName} is nearby!`, {
        description: `${data.distance}m away`,
        duration: 3000, // Auto-dismiss after 3 seconds
        dismissible: true, // Make sure it's dismissible
        closeButton: true, // Add close button
        action: {
          label: "View",
          onClick: () => {
            handleVendorClick(data);
            toast.dismiss(); // Dismiss when action is clicked
          },
        },
      });

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: `vendor-${data.vendorId}`,
        });
      }
    };

    const handleVendorDeparted = (data: any) => {
      console.log("Vendor departed:", data);

      // Remove vendor from nearby list
      setNearbyVendors((prev) =>
        prev.filter((vendor) => vendor.vendorId !== data.vendorId)
      );
    };

    const handleVendorLocationUpdated = (data: any) => {
      console.log("Vendor location updated:", data);

      // Update vendor in nearby list
      setNearbyVendors((prev) => {
        const existing = prev.find((v) => v.vendorId === data.vendorId);
        if (existing) {
          return prev.map((v) =>
            v.vendorId === data.vendorId ? { ...v, ...data } : v
          );
        } else if (data.isActive) {
          return [...prev, data];
        }
        return prev;
      });
    };

    const handleLocationUpdateConfirmed = (data: any) => {
      console.log("Location update confirmed:", data);
    };

    // Add event listeners
    socket.on("vendor-nearby", handleVendorNearby);
    socket.on("vendor-departed", handleVendorDeparted);
    socket.on("vendor-location-updated", handleVendorLocationUpdated);
    socket.on("location-update-confirmed", handleLocationUpdateConfirmed);

    // Cleanup
    return () => {
      socket.off("vendor-nearby", handleVendorNearby);
      socket.off("vendor-departed", handleVendorDeparted);
      socket.off("vendor-location-updated", handleVendorLocationUpdated);
      socket.off("location-update-confirmed", handleLocationUpdateConfirmed);
    };
  }, [socket]);

  // Initialize demo vendors
  const initializeDemoVendors = async () => {
    if (!currentLocation) {
      toast.error("Location required to initialize demo vendors");
      return;
    }

    setIsInitializing(true);
    try {
      await vendorSimulationService.initializeDemoVendors({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });

      setIsInitialized(true);
      toast.success("Demo vendors initialized successfully!", {
        description: "5 vendors are now active in your area",
      });
    } catch (error) {
      console.error("Failed to initialize demo vendors:", error);

      // Fallback: Create mock vendors for demo purposes
      const mockVendors = [
        {
          vendorId: "mock-1",
          vendorName: "Fresh Fruits Cart",
          coordinates: [
            currentLocation.longitude + 0.002,
            currentLocation.latitude + 0.001,
          ],
          distance: 150,
          isActive: true,
          products: ["Apples", "Bananas", "Oranges"],
          timestamp: new Date().toISOString(),
        },
        {
          vendorId: "mock-2",
          vendorName: "Vegetable Express",
          coordinates: [
            currentLocation.longitude - 0.001,
            currentLocation.latitude + 0.002,
          ],
          distance: 280,
          isActive: true,
          products: ["Tomatoes", "Onions", "Potatoes"],
          timestamp: new Date().toISOString(),
        },
      ];

      setNearbyVendors(mockVendors);
      setIsInitialized(true);

      toast.warning("Using demo mode (backend unavailable)", {
        description: "Mock vendors created for demonstration",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Stop all simulations
  const stopAllSimulations = async () => {
    try {
      await vendorSimulationService.stopAllSimulations();
      setIsInitialized(false);
      setNearbyVendors([]);
      setNotifications([]);
      toast.dismiss(); // Clear any existing toasts
      toast.success("All vendor simulations stopped", { duration: 2000 });
    } catch (error) {
      console.error("Failed to stop simulations:", error);
      toast.error("Failed to stop simulations");
    }
  };

  // Handle vendor click
  const handleVendorClick = (vendor: any) => {
    console.log("Vendor clicked:", vendor);
    toast.info(`Viewing ${vendor.vendorName || vendor.name}`, {
      description: "Vendor details would open here",
    });
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);

    if (notification.type === "vendor-nearby" && notification.data) {
      handleVendorClick(notification.data);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Remove notification
  const removeNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  // Clear all notifications and toasts
  const clearAllNotifications = () => {
    setNotifications([]);

    // Try to dismiss all toasts using the library
    toast.dismiss();

    // Fallback: manually remove toast elements from DOM if they persist
    setTimeout(() => {
      const toastElements = document.querySelectorAll("[data-sonner-toast]");
      toastElements.forEach((element) => {
        element.remove();
      });

      // Also try common toast container selectors
      const toastContainers = document.querySelectorAll(
        ".sonner, [data-toast], .toast-container"
      );
      toastContainers.forEach((container) => {
        container.innerHTML = "";
      });
    }, 100);
  };

  // Convert nearbyVendors to the format expected by ConsumerMap
  const vendorLocations = nearbyVendors.map((vendor) => ({
    vendorId: vendor.vendorId || vendor.id || `vendor-${Date.now()}`,
    vendorName: vendor.vendorName || vendor.name || "Unknown Vendor",
    coordinates: vendor.coordinates || [
      vendor.longitude || 0,
      vendor.latitude || 0,
    ],
    distance: vendor.distance,
    isActive: vendor.isActive ?? true,
    products: vendor.products || [],
    timestamp: vendor.timestamp || new Date().toISOString(),
    estimatedArrival: vendor.estimatedArrival,
  }));

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Floating Toast Dismiss Button - Show when there are notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={clearAllNotifications}
            variant="outline"
            size="sm"
            className="bg-white shadow-lg border-2 hover:bg-gray-50"
          >
            Dismiss All ({notifications.length})
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Vendor Nudge System
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time proximity notifications connecting consumers with nearby
              vendors
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <Badge
                variant={isConnected ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {isConnected ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {currentLocation ? "Location Active" : "Location Needed"}
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-blue-700">
                  {currentLocation ? "Active" : "Inactive"}
                </div>
                <div className="text-xs md:text-sm text-blue-600">
                  Location Status
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-green-700">
                  {nearbyVendors.length}
                </div>
                <div className="text-xs md:text-sm text-green-600">
                  Nearby Vendors
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-purple-700">
                  {notifications.length}
                </div>
                <div className="text-xs md:text-sm text-purple-600">
                  Notifications
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Wifi className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-orange-700">
                  {isConnected ? "Online" : "Offline"}
                </div>
                <div className="text-xs md:text-sm text-orange-600">
                  Connection
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Error */}
        {locationError && !currentLocation && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Location access required for vendor notifications.{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={requestLocation}
              >
                Try again
              </Button>
              {" or "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setShowManualLocationInput(true)}
              >
                Set location manually
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Manual Location Input */}
        {showManualLocationInput && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Set Your Location Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="28.6139"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      id="manual-lat"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="77.2090"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      id="manual-lng"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const lat = parseFloat(
                        (
                          document.getElementById(
                            "manual-lat"
                          ) as HTMLInputElement
                        ).value
                      );
                      const lng = parseFloat(
                        (
                          document.getElementById(
                            "manual-lng"
                          ) as HTMLInputElement
                        ).value
                      );
                      if (lat && lng) {
                        setManualLocation({ latitude: lat, longitude: lng });
                        setShowManualLocationInput(false);
                        toast.success("Location set manually!");
                      } else {
                        toast.error("Please enter valid coordinates");
                      }
                    }}
                  >
                    Set Location
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setManualLocation({
                        latitude: 28.6139,
                        longitude: 77.209,
                      });
                      setShowManualLocationInput(false);
                      toast.success("Using Delhi as default location");
                    }}
                  >
                    Use Delhi (Default)
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowManualLocationInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control Panel */}
        <Card className="mb-6 border-2 border-dashed border-blue-200 bg-blue-50/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Truck className="h-6 w-6 text-blue-600" />
              Demo Control Panel
            </CardTitle>
            <p className="text-sm text-gray-600">
              Initialize vendors and start receiving proximity notifications
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={initializeDemoVendors}
                disabled={isInitializing || !currentLocation || isInitialized}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-base md:text-lg"
                size="lg"
              >
                <Truck className="h-4 w-4 md:h-5 md:w-5" />
                {isInitializing ? "Initializing..." : "Start Demo Vendors"}
              </Button>

              {isInitialized && (
                <Button
                  variant="outline"
                  onClick={stopAllSimulations}
                  className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3"
                  size="lg"
                >
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                  Stop All Vendors
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => connect()}
                disabled={isConnected}
                className="flex items-center gap-2 px-3 py-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Reconnect</span>
                <span className="sm:hidden">Reconnect</span>
              </Button>
            </div>

            {isInitialized && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center p-2">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">
                    5
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Total Vendors
                  </div>
                </div>
                <div className="text-center p-2">
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    {nearbyVendors.filter((v) => v.isActive).length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Active Now
                  </div>
                </div>
                <div className="text-center p-2">
                  <div className="text-xl md:text-2xl font-bold text-purple-600">
                    {nearbyVendors.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Nearby</div>
                </div>
                <div className="text-center p-2">
                  <div className="text-xl md:text-2xl font-bold text-orange-600">
                    {notifications.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Notifications
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                Recent Notifications
              </span>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      {notifications.length} new
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearAllNotifications}
                      className="text-xs px-2 py-1"
                    >
                      Clear All
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500">
                  You'll be notified when vendors are nearby!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      notification.read
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          notification.read ? "bg-gray-100" : "bg-blue-100"
                        }`}
                      >
                        <Bell
                          className={`h-4 w-4 ${
                            notification.read
                              ? "text-gray-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div
                          className={`font-medium ${
                            notification.read
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </div>
                        <div
                          className={`text-sm ${
                            notification.read
                              ? "text-gray-500"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </div>
                        <div className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNotificationClick(notification)}
                        className="text-xs px-2 py-1"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeNotification(notification.id)}
                        className="text-lg px-2 py-1 hover:bg-red-100 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        {currentLocation && (
          <Card className="mb-6 overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Interactive Vendor Map
                </span>
                {nearbyVendors.length > 0 && (
                  <Badge variant="secondary" className="bg-white text-blue-600">
                    {nearbyVendors.length} vendor
                    {nearbyVendors.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-blue-100 text-sm">
                Click on markers to view vendor details • Real-time location
                tracking
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ConsumerMap
                userLocation={currentLocation}
                nearbyVendors={vendorLocations}
                onVendorClick={handleVendorClick}
              />
            </CardContent>
          </Card>
        )}

        {/* Vendor List */}
        {nearbyVendors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Active Vendors Nearby
                <Badge variant="secondary">{nearbyVendors.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyVendors.map((vendor) => (
                  <div
                    key={vendor.vendorId}
                    className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 bg-white"
                    onClick={() => handleVendorClick(vendor)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base truncate pr-2">
                        {vendor.vendorName}
                      </h4>
                      <Badge
                        variant={vendor.isActive ? "default" : "secondary"}
                        className="text-xs flex-shrink-0"
                      >
                        {vendor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>Distance: {vendor.distance}m</span>
                    </div>
                    {vendor.products && vendor.products.length > 0 && (
                      <div className="text-xs text-gray-500 mb-2">
                        Products: {vendor.products.slice(0, 3).join(", ")}
                        {vendor.products.length > 3 && "..."}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Last seen:{" "}
                      {new Date(vendor.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsumerMapDemo;
