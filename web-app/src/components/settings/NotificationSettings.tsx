import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Volume2, 
  Eye, 
  Vibrate,
  Clock,
  MapPin,
  Save,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ApiClient from '@/services/api';

interface NotificationPreferences {
  proximityNotifications: {
    enabled: boolean;
    radius: number;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    notificationTypes: {
      sound: boolean;
      visual: boolean;
      vibration: boolean;
    };
    vendorTypes: string[];
    minimumRating: number;
  };
  doNotDisturb: boolean;
}

export function NotificationSettings() {
  const { user, updateUser } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    proximityNotifications: {
      enabled: true,
      radius: 1000,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      notificationTypes: {
        sound: true,
        visual: true,
        vibration: false
      },
      vendorTypes: [],
      minimumRating: 0
    },
    doNotDisturb: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences(user.notificationPreferences);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update preferences via API
      const response = await ApiClient.request('/location/consumer-preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });

      // Update local user state
      updateUser({ notificationPreferences: preferences });
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (path: string[], value: any) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      let current: any = newPrefs;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newPrefs;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground">
          Customize how and when you receive vendor proximity notifications
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Proximity Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when vendors are nearby
              </p>
            </div>
            <Button
              variant={preferences.proximityNotifications.enabled ? "default" : "outline"}
              size="sm"
              onClick={() => updatePreference(['proximityNotifications', 'enabled'], !preferences.proximityNotifications.enabled)}
            >
              {preferences.proximityNotifications.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Do Not Disturb</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable all notifications
              </p>
            </div>
            <Button
              variant={preferences.doNotDisturb ? "destructive" : "outline"}
              size="sm"
              onClick={() => updatePreference(['doNotDisturb'], !preferences.doNotDisturb)}
            >
              {preferences.doNotDisturb ? 'On' : 'Off'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Proximity Settings */}
      {preferences.proximityNotifications.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <span>Proximity Settings</span>
            </CardTitle>
            <CardDescription>
              Configure when and how you receive vendor alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Radius */}
            <div className="space-y-2">
              <Label htmlFor="radius">Notification Radius</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="radius"
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={preferences.proximityNotifications.radius}
                  onChange={(e) => updatePreference(['proximityNotifications', 'radius'], parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="outline" className="min-w-20">
                  {preferences.proximityNotifications.radius < 1000 
                    ? `${preferences.proximityNotifications.radius}m`
                    : `${(preferences.proximityNotifications.radius / 1000).toFixed(1)}km`
                  }
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                You'll be notified when vendors are within this distance
              </p>
            </div>

            {/* Notification Types */}
            <div className="space-y-3">
              <Label>Notification Types</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Volume2 className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Sound</p>
                    <p className="text-xs text-muted-foreground">Audio alerts</p>
                  </div>
                  <Button
                    variant={preferences.proximityNotifications.notificationTypes.sound ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference(['proximityNotifications', 'notificationTypes', 'sound'], !preferences.proximityNotifications.notificationTypes.sound)}
                  >
                    {preferences.proximityNotifications.notificationTypes.sound ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Eye className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Visual</p>
                    <p className="text-xs text-muted-foreground">Pop-up notifications</p>
                  </div>
                  <Button
                    variant={preferences.proximityNotifications.notificationTypes.visual ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference(['proximityNotifications', 'notificationTypes', 'visual'], !preferences.proximityNotifications.notificationTypes.visual)}
                  >
                    {preferences.proximityNotifications.notificationTypes.visual ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Vibrate className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="font-medium">Vibration</p>
                    <p className="text-xs text-muted-foreground">Device vibration</p>
                  </div>
                  <Button
                    variant={preferences.proximityNotifications.notificationTypes.vibration ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference(['proximityNotifications', 'notificationTypes', 'vibration'], !preferences.proximityNotifications.notificationTypes.vibration)}
                  >
                    {preferences.proximityNotifications.notificationTypes.vibration ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Quiet Hours</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Disable notifications during specific hours
                  </p>
                </div>
                <Button
                  variant={preferences.proximityNotifications.quietHours.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreference(['proximityNotifications', 'quietHours', 'enabled'], !preferences.proximityNotifications.quietHours.enabled)}
                >
                  {preferences.proximityNotifications.quietHours.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {preferences.proximityNotifications.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={preferences.proximityNotifications.quietHours.start}
                      onChange={(e) => updatePreference(['proximityNotifications', 'quietHours', 'start'], e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={preferences.proximityNotifications.quietHours.end}
                      onChange={(e) => updatePreference(['proximityNotifications', 'quietHours', 'end'], e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <Label htmlFor="min-rating">Minimum Vendor Rating</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="min-rating"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={preferences.proximityNotifications.minimumRating}
                  onChange={(e) => updatePreference(['proximityNotifications', 'minimumRating'], parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="outline" className="min-w-16">
                  {preferences.proximityNotifications.minimumRating} ⭐
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Only get notifications from vendors with this rating or higher
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Save className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">Settings Saved</p>
                <p className="text-sm text-green-700">Your notification preferences have been updated successfully.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}