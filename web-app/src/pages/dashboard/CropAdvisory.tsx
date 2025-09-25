import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sprout, 
  TrendingUp, 
  Droplets, 
  Thermometer,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Leaf
} from 'lucide-react';
import { useLatestSoilReport, useLatestCropRecommendation, useLatestHardwareMessage } from '@/hooks/useCropRecommendations';

export function CropAdvisory() {
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    soilReport, 
    loading: soilLoading, 
    error: soilError, 
    refetch: refetchSoil 
  } = useLatestSoilReport();
  
  const { 
    recommendation, 
    loading: recLoading, 
    error: recError, 
    refetch: refetchRecommendation 
  } = useLatestCropRecommendation();
  
  const { 
    message: hardwareMessage, 
    loading: hardwareLoading, 
    refetch: refetchHardware 
  } = useLatestHardwareMessage();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSoil(),
        refetchRecommendation(),
        refetchHardware()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const sensorData = soilReport?.sensorData || hardwareMessage?.sensorData;
  const recommendations = soilReport?.recommendations || hardwareMessage?.recommendations || [];
  const cropRecommendations = soilReport?.cropRecommendations || hardwareMessage?.cropRecommendations || [];

  const getSensorStatus = (value: number, min: number, max: number) => {
    if (value < min) return { status: 'low', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (value > max) return { status: 'high', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { status: 'optimal', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const sensorCards = sensorData ? [
    {
      title: 'pH Level',
      value: sensorData.ph?.toFixed(1) || 'N/A',
      unit: '',
      icon: Activity,
      status: getSensorStatus(sensorData.ph || 0, 6.0, 7.5),
      description: 'Soil acidity/alkalinity'
    },
    {
      title: 'Nitrogen',
      value: sensorData.nitrogen || 'N/A',
      unit: 'ppm',
      icon: Leaf,
      status: getSensorStatus(sensorData.nitrogen || 0, 40, 60),
      description: 'Essential for plant growth'
    },
    {
      title: 'Phosphorus',
      value: sensorData.phosphorus || 'N/A',
      unit: 'ppm',
      icon: TrendingUp,
      status: getSensorStatus(sensorData.phosphorus || 0, 20, 40),
      description: 'Root development'
    },
    {
      title: 'Potassium',
      value: sensorData.potassium || 'N/A',
      unit: 'ppm',
      icon: BarChart3,
      status: getSensorStatus(sensorData.potassium || 0, 150, 250),
      description: 'Disease resistance'
    },
    {
      title: 'Moisture',
      value: sensorData.moisture || 'N/A',
      unit: '%',
      icon: Droplets,
      status: getSensorStatus(sensorData.moisture || 0, 40, 80),
      description: 'Soil water content'
    },
    {
      title: 'Temperature',
      value: sensorData.temperature || 'N/A',
      unit: '°C',
      icon: Thermometer,
      status: getSensorStatus(sensorData.temperature || 0, 20, 35),
      description: 'Soil temperature'
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crop Advisory</h1>
          <p className="text-muted-foreground">
            AI-powered soil analysis and crop recommendations based on your sensor data
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing || soilLoading || recLoading || hardwareLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Error States */}
      {(soilError || recError) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {soilError?.message || recError?.message || 'Failed to load soil data. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Sensor Data Grid */}
      {sensorData ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Current Soil Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensorCards.map((sensor, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${sensor.status.bgColor}`}>
                        <sensor.icon className={`h-4 w-4 ${sensor.status.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sensor.title}</p>
                        <p className="text-xs text-muted-foreground">{sensor.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {sensor.value} {sensor.unit}
                      </p>
                      <Badge 
                        variant={sensor.status.status === 'optimal' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {sensor.status.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Sensor Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Connect your hardware sensors to start receiving soil analysis data.
            </p>
            <Button onClick={handleRefresh}>
              Check for Data
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sprout className="h-5 w-5 text-green-500" />
              <span>Recommended Crops</span>
            </CardTitle>
            <CardDescription>
              Best crops for your current soil conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : cropRecommendations.length > 0 ? (
              <div className="space-y-4">
                {cropRecommendations.map((crop: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{crop.cropName}</h4>
                      <Badge variant="outline">
                        {crop.suitabilityPercentage}% suitable
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expected yield: {crop.expectedYield}
                    </p>
                  </div>
                ))}
              </div>
            ) : recommendation ? (
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{recommendation.cropName}</h4>
                  <Badge variant="outline">
                    {recommendation.suitabilityPercentage}% suitable
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Expected yield: {recommendation.expectedYield}
                </p>
                {recommendation.plantingAdvice && (
                  <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                    {recommendation.plantingAdvice}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Sprout className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No crop recommendations available. Ensure your sensors are connected.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* General Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span>Soil Recommendations</span>
            </CardTitle>
            <CardDescription>
              Expert advice for improving your soil health
            </CardDescription>
          </CardHeader>
          <CardContent>
            {soilLoading || hardwareLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recommendations available. Upload soil data to get expert advice.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Summary */}
      {(sensorData || recommendation) && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
            <CardDescription>
              Overall assessment of your soil conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Soil Health</h4>
                <p className="text-sm text-green-700">Good overall condition</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800">Growth Potential</h4>
                <p className="text-sm text-blue-700">High yield expected</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Sprout className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-800">Crop Diversity</h4>
                <p className="text-sm text-purple-700">Multiple options available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}