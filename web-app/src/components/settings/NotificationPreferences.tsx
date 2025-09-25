import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  MapPin, 
  Clock, 
  Volume2,
  Eye,
  Vibrate,
  Moon,
  Star,
  Users,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getCardStyles } from '@/utils/styles';

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

const defaultPreferences: NotificationPreferences = {
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
};

const vendorCategories = [
  'vegetables',
  'fruits',
  'grains',
  'pulses',
  'spices',
  'herbs',
  'dairy',
  'other'
];

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load preferences
  const loadPreferences = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/location/consumer-preferences');
      
      if (response.data.success) {
        setPreferences(response.data.data.preferences || defaultPreferences);
      } else {
        throw new Error(response.data.message || 'Failed to load preferences');
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
      setError('Failed to load preferences');
      // Use default preferences on error
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.put('/location/consumer-preferences', preferences);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Load preferences on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Update preference helper
  const updatePreference = (path: string, value: any) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current: any = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  // Toggle vendor category
  const toggleVendorCategory = (category: string) => {
    const currentTypes = preferences.proximityNotifications.vendorTypes;
    const newTypes = currentTypes.includes(category)
      ? currentTypes.filter(t => t !== category)
      : [...currentTypes, category];
    
    updatePreference('proximityNotifications.vendorTypes', newTypes);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-muted-foreground">
            Customize how and when you receive vendor proximity notifications
          </p>
        </div>
        <Button 
          onClick={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Preferences saved successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-purple-500" />
            <span>Do Not Disturb</span>
          </CardTitle>
          <CardDescription>
            Temporarily disable all proximity notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-semibold text-sm">Enable Do Not Disturb</p>
              <p className="text-xs text-muted-foreground">
                When enabled, you won't receive any proximity notifications
              </p>
            </div>
            <Switch
              checked={preferences.doNotDisturb}
              onCheckedChange={(checked: boolean) => updatePreference('doNotDisturb', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Proximity Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <span>Proximity Notifications</span>
          </CardTitle>
          <CardDescription>
            Get notified when vendors are nearby your location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-semibold text-sm">Enable Proximity Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive notifications when vendors are near your location
              </p>
            </div>
            <Switch
              checked={preferences.proximityNotifications.enabled}
              onCheckedChange={(checked: boolean) => updatePreference('proximityNotifications.enabled', checked)}
            />
          </div>

          {/* Notification Radius */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Notification Radius</label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <Input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={preferences.proximityNotifications.radius}
                  onChange={(e) => updatePreference('proximityNotifications.radius', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="text-sm font-semibold min-w-[80px]">
                  {(preferences.proximityNotifications.radius / 1000).toFixed(1)} km
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You'll be notified when vendors are within this distance from your location
              </p>
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Notification Types</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Sound</span>
                </div>
                <Switch
                  checked={preferences.proximityNotifications.notificationTypes.sound}
                  onCheckedChange={(checked: boolean) => updatePreference('proximityNotifications.notificationTypes.sound', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Visual</span>
                </div>
                <Switch
                  checked={preferences.proximityNotifications.notificationTypes.visual}
                  onCheckedChange={(checked: boolean) => updatePreference('proximityNotifications.notificationTypes.visual', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Vibrate className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Vibration</span>
                </div>
                <Switch
                  checked={preferences.proximityNotifications.notificationTypes.vibration}
                  onCheckedChange={(checked: boolean) => updatePreference('proximityNotifications.notificationTypes.vibration', checked)}
                />
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Quiet Hours</label>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Enable Quiet Hours</p>
                  <p className="text-xs text-muted-foreground">
                    Don't receive notifications during specified hours
                  </p>
                </div>
                <Switch
                  checked={preferences.proximityNotifications.quietHours.enabled}
                  onCheckedChange={(checked: boolean) => updatePreference('proximityNotifications.quietHours.enabled', checked)}
                />
              </div>
              
              {preferences.proximityNotifications.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Time</label>
                    <Input
                      type="time"
                      value={preferences.proximityNotifications.quietHours.start}
                      onChange={(e) => updatePreference('proximityNotifications.quietHours.start', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Time</label>
                    <Input
                      type="time"
                      value={preferences.proximityNotifications.quietHours.end}
                      onChange={(e) => updatePreference('proximityNotifications.quietHours.end', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Minimum Vendor Rating</label>
            </div>
            <div className="space-y-2">
              <Select
                value={preferences.proximityNotifications.minimumRating.toString()}
                onValueChange={(value) => updatePreference('proximityNotifications.minimumRating', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
                  <SelectItem value="1">1+ stars</SelectItem>
                  <SelectItem value="2">2+ stars</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="5">5 stars only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only receive notifications from vendors with this rating or higher
              </p>
            </div>
          </div>

          {/* Vendor Categories */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Preferred Vendor Types</label>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Select the types of vendors you want to receive notifications from. Leave empty to receive from all types.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {vendorCategories.map((category) => (
                  <div
                    key={category}
                    className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                      preferences.proximityNotifications.vendorTypes.includes(category)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleVendorCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      {preferences.proximityNotifications.vendorTypes.includes(category) && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preview</CardTitle>
          <CardDescription>
            Here's how your notification settings will work
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Notifications:</strong> {preferences.proximityNotifications.enabled ? 'Enabled' : 'Disabled'}
            </p>
            {preferences.proximityNotifications.enabled && (
              <>
                <p className="text-sm text-blue-700">
                  • You'll be notified when vendors are within {(preferences.proximityNotifications.radius / 1000).toFixed(1)}km
                </p>
                {preferences.proximityNotifications.quietHours.enabled && (
                  <p className="text-sm text-blue-700">
                    • Quiet hours: {preferences.proximityNotifications.quietHours.start} - {preferences.proximityNotifications.quietHours.end}
                  </p>
                )}
                {preferences.proximityNotifications.minimumRating > 0 && (
                  <p className="text-sm text-blue-700">
                    • Only vendors with {preferences.proximityNotifications.minimumRating}+ star rating
                  </p>
                )}
                {preferences.proximityNotifications.vendorTypes.length > 0 && (
                  <p className="text-sm text-blue-700">
                    • Only from: {preferences.proximityNotifications.vendorTypes.join(', ')}
                  </p>
                )}
              </>
            )}
            {preferences.doNotDisturb && (
              <p className="text-sm text-purple-700">
                • Do Not Disturb is enabled - all notifications are paused
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}