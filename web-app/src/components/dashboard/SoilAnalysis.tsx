import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sprout, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Droplets,
  Zap,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  useLatestSoilReport,
  useLatestCropRecommendation, 
  useLatestHardwareMessage,
  useFarmAnalytics 
} from '@/hooks/useCropRecommendations';
import { getCardStyles, getStatusColor } from '@/utils/styles';

interface SoilParameter {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function SoilAnalysis() {
  const { 
    soilReport, 
    recommendation, 
    hardwareMessage, 
    loading, 
    error, 
    hasData, 
    needsHardwareSetup 
  } = useFarmAnalytics();

  const { 
    refetch: refetchSoil, 
    retry: retrySoil 
  } = useLatestSoilReport();
  
  const { 
    refetch: refetchRecommendation, 
    retry: retryRecommendation 
  } = useLatestCropRecommendation();

  const sensorData = soilReport?.sensorData || hardwareMessage?.sensorData;

  // Calculate soil parameters from real data
  const soilParameters: SoilParameter[] = useMemo(() => {
    if (!sensorData) {
      return []; // Return empty array if no sensor data
    }

    return [
      {
        name: 'pH Level',
        value: sensorData.ph,
        unit: '',
        status: (sensorData.ph >= 6.0 && sensorData.ph <= 7.5) ? 'good' : 
                (sensorData.ph >= 5.5 && sensorData.ph < 6.0) || (sensorData.ph > 7.5 && sensorData.ph <= 8.0) ? 'warning' : 'critical',
        icon: <Zap className="h-4 w-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        name: 'Nitrogen',
        value: sensorData.nitrogen,
        unit: 'mg/kg',
        status: sensorData.nitrogen >= 40 ? 'good' : sensorData.nitrogen >= 20 ? 'warning' : 'critical',
        icon: <Sprout className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        name: 'Phosphorus',
        value: sensorData.phosphorus,
        unit: 'mg/kg',
        status: sensorData.phosphorus >= 20 ? 'good' : sensorData.phosphorus >= 10 ? 'warning' : 'critical',
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        name: 'Potassium',
        value: sensorData.potassium,
        unit: 'mg/kg',
        status: sensorData.potassium >= 150 ? 'good' : sensorData.potassium >= 100 ? 'warning' : 'critical',
        icon: <TrendingDown className="h-4 w-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      },
      {
        name: 'Moisture',
        value: sensorData.moisture,
        unit: '%',
        status: (sensorData.moisture >= 40 && sensorData.moisture <= 80) ? 'good' : 
                (sensorData.moisture >= 30 && sensorData.moisture < 40) || (sensorData.moisture > 80 && sensorData.moisture <= 90) ? 'warning' : 'critical',
        icon: <Droplets className="h-4 w-4" />,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100'
      },
      {
        name: 'Temperature',
        value: sensorData.temperature,
        unit: '°C',
        status: (sensorData.temperature >= 20 && sensorData.temperature <= 35) ? 'good' : 
                (sensorData.temperature >= 15 && sensorData.temperature < 20) || (sensorData.temperature > 35 && sensorData.temperature <= 40) ? 'warning' : 'critical',
        icon: <Thermometer className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ];
  }, [sensorData]);

  // Calculate overall health score
  const healthScore = useMemo(() => {
    if (soilParameters.length === 0) return 0;
    
    const scores = soilParameters.map(param => {
      switch (param.status) {
        case 'good': return 100;
        case 'warning': return 60;
        case 'critical': return 20;
        default: return 0;
      }
    });
    
    return Math.round(scores.reduce((sum: number, score) => sum + score, 0) / scores.length) as 0 | 20 | 60 | 100;
  }, [soilParameters]);

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchSoil(),
        refetchRecommendation()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show hardware setup message if no data available
  if (needsHardwareSetup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Soil Analysis</h2>
            <p className="text-muted-foreground">
              Connect your soil sensors to get real-time data
            </p>
          </div>
        </div>

        <Card className={getCardStyles('base')}>
          <CardContent className="p-8 text-center">
            <WifiOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Sensor Data Available</h3>
            <p className="text-muted-foreground mb-6">
              To get AI-powered soil analysis and crop recommendations, you need to connect your soil monitoring hardware.
            </p>
            <div className="space-y-3">
              <Button size="lg">
                Connect Hardware
              </Button>
              <p className="text-sm text-muted-foreground">
                Need help? <a href="/support" className="text-primary hover:underline">Contact Support</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <span>Soil Analysis</span>
            {hasData && <Wifi className="h-5 w-5 text-green-500" />}
          </h2>
          <p className="text-muted-foreground">
            {soilReport 
              ? `Last updated: ${new Date(soilReport.updatedAt).toLocaleDateString()}`
              : hardwareMessage
              ? `Last reading: ${new Date(hardwareMessage.createdAt).toLocaleDateString()}`
              : 'No recent data available'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          {error && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                retrySoil?.();
                retryRecommendation?.();
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Unable to load soil data</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {error.message || 'Please check your connection and try again.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Soil Parameters Grid */}
      {soilParameters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {soilParameters.map((param, index) => (
            <Card key={index} className={getCardStyles('hover')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-full ${param.bgColor}`}>
                    <div className={param.color}>
                      {param.icon}
                    </div>
                  </div>
                  {getStatusIcon(param.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {param.name}
                  </p>
                  <p className="text-2xl font-bold">
                    {param.value.toFixed(1)}{param.unit}
                  </p>
                  <p className={`text-xs ${getStatusColor(param.status)}`}>
                    {param.status === 'good' ? 'Optimal' : 
                     param.status === 'warning' ? 'Needs attention' : 'Critical'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Crop Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sprout className="h-5 w-5 text-green-500" />
            <span>AI Crop Recommendations</span>
          </CardTitle>
          <CardDescription>
            Based on your current soil conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-green-800">
                    Recommended: {recommendation.cropName}
                  </h3>
                  <p className="text-sm text-green-700">
                    Suitability: {recommendation.suitabilityPercentage}%
                  </p>
                  {recommendation.expectedYield && (
                    <p className="text-sm text-green-700">
                      Expected yield: {recommendation.expectedYield}
                    </p>
                  )}
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Best Match
                </Badge>
              </div>
              
              {soilReport?.recommendations && soilReport.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Additional Recommendations:</h4>
                  <ul className="space-y-1">
                    {soilReport.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {soilReport?.cropRecommendations && soilReport.cropRecommendations.length > 1 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Alternative Crops:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {soilReport.cropRecommendations.slice(1, 5).map((crop: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{crop.cropName}</span>
                          <span className="text-sm text-muted-foreground">
                            {crop.suitabilityPercentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                {hasData 
                  ? 'Processing soil data to generate crop recommendations...'
                  : 'No recommendations available. Connect your soil sensors to get AI-powered crop suggestions.'
                }
              </p>
              {!hasData && (
                <Button size="sm">
                  Connect Sensors
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Soil Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Soil Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {soilParameters.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Health Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        healthScore >= 80 ? 'bg-green-500' : 
                        healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{healthScore}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-800">
                    {soilParameters.filter(p => p.status === 'good').length} Parameters
                  </p>
                  <p className="text-xs text-green-700">Optimal Range</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-yellow-800">
                    {soilParameters.filter(p => p.status === 'warning').length} Parameters
                  </p>
                  <p className="text-xs text-yellow-700">Need Attention</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-red-800">
                    {soilParameters.filter(p => p.status === 'critical').length} Parameters
                  </p>
                  <p className="text-xs text-red-700">Critical</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Soil health summary will appear here once sensor data is available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}