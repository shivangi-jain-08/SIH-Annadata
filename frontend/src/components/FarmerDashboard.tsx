import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  Leaf, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Camera,
  MapPin,
  Calendar,
  BarChart3,
  Package,
  ShoppingBag,
  Info,
  Sun,
  CloudRain,
  Wind,
  Sprout,
  Timer,
  Target,
  Lightbulb,
  DollarSign,
  Tractor,
  Wheat,
  Apple,
  Heart,
  Activity,
  Clock,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Settings,
  HelpCircle,
  Phone
} from "lucide-react";

interface FarmerDashboardProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function FarmerDashboard({ currentView, onViewChange }: FarmerDashboardProps) {
  // Enhanced farmer-friendly data
  const sensorData = [
    { time: 'Morning', temperature: 22, humidity: 65, ph: 6.8, nitrogen: 45, label: '6 AM' },
    { time: 'Day', temperature: 25, humidity: 60, ph: 7.0, nitrogen: 50, label: '12 PM' },
    { time: 'Evening', temperature: 26, humidity: 58, ph: 6.9, nitrogen: 49, label: '6 PM' },
    { time: 'Night', temperature: 20, humidity: 70, ph: 6.9, nitrogen: 48, label: '12 AM' }
  ];

  const cropRecommendations = [
    { 
      crop: 'Tomatoes', 
      suitability: 92, 
      season: 'Perfect Now!', 
      yield: '15-20 tons/acre',
      profit: '₹2,50,000/acre',
      icon: Apple,
      color: '#FF6B6B',
      timeToHarvest: '75-80 days',
      difficulty: 'Easy'
    },
    { 
      crop: 'Lettuce', 
      suitability: 88, 
      season: 'Good Now', 
      yield: '25-30 tons/acre',
      profit: '₹1,80,000/acre',
      icon: Leaf,
      color: '#4ECDC4',
      timeToHarvest: '45-50 days',
      difficulty: 'Very Easy'
    },
    { 
      crop: 'Carrots', 
      suitability: 85, 
      season: 'Next Month', 
      yield: '40-50 tons/acre',
      profit: '₹3,20,000/acre',
      icon: Sprout,
      color: '#FF9F43',
      timeToHarvest: '90-100 days',
      difficulty: 'Medium'
    }
  ];

  const soilHealthData = [
    { 
      name: 'Soil Nutrition', 
      value: 78, 
      max: 100, 
      color: '#2E7D32',
      status: 'Good',
      action: 'Add organic fertilizer next week'
    },
    { 
      name: 'Water Level', 
      value: 65, 
      max: 100, 
      color: '#2196F3',
      status: 'Perfect',
      action: 'Continue current watering schedule'
    },
    { 
      name: 'Soil Health', 
      value: 82, 
      max: 100, 
      color: '#4CAF50',
      status: 'Excellent',
      action: 'Keep up the good work!'
    }
  ];

  const todayTasks = [
    { 
      id: 1, 
      task: 'Water tomato plants', 
      time: 'Morning (6-8 AM)', 
      priority: 'high',
      estimated: '30 min',
      field: 'Field A'
    },
    { 
      id: 2, 
      task: 'Check lettuce for pests', 
      time: 'Evening (5-6 PM)', 
      priority: 'medium',
      estimated: '20 min',
      field: 'Field B'
    },
    { 
      id: 3, 
      task: 'Apply fertilizer to carrots', 
      time: 'Morning (7-9 AM)', 
      priority: 'high',
      estimated: '45 min',
      field: 'Field C'
    }
  ];

  const weatherData = {
    today: { temp: 28, condition: 'Sunny', humidity: 65, wind: 12, icon: Sun },
    tomorrow: { temp: 24, condition: 'Light Rain', humidity: 80, wind: 8, icon: CloudRain },
    alerts: [
      { type: 'rain', message: 'Light rain expected tomorrow - good for newly planted seeds!', priority: 'info' },
      { type: 'heat', message: 'Hot afternoon ahead - water your plants early', priority: 'warning' }
    ]
  };

  const farmStats = {
    totalEarnings: 45600,
    monthlyGrowth: 23,
    activeFields: 3,
    cropsSold: 156,
    pendingOrders: 7,
    healthyPlants: 94
  };

  if (currentView === 'sensors') {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Farmer-friendly Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Activity className="h-8 w-8" />
                Your Field Sensors
              </h1>
              <p className="text-muted-foreground mt-1">Live monitoring of your crops and soil conditions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                All 3 Sensors Online
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Sensor Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Sensor Cards - Farmer Friendly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Temperature</CardTitle>
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">26°C</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Perfect for growth</span>
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2°C
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> Ideal temperature for tomatoes
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Soil Moisture</CardTitle>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">58%</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Good moisture level</span>
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                    Optimal
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  💧 <strong>Next watering:</strong> Tomorrow morning
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Soil Health</CardTitle>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">6.9 pH</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Almost perfect!</span>
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                    Excellent
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  🌱 <strong>Action:</strong> No changes needed
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Plant Nutrition</CardTitle>
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">Good</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">NPK levels balanced</span>
                  <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                    Healthy
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  🌿 <strong>Next feed:</strong> Add fertilizer in 5 days
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Field Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Today's Field Conditions
                    </CardTitle>
                    <CardDescription>How your crops are doing throughout the day</CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Live Updates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      labelFormatter={(value) => `Time: ${value}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#FF6B35" 
                      strokeWidth={3}
                      dot={{ fill: '#FF6B35', r: 4 }}
                      name="Temperature (°C)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#2196F3" 
                      strokeWidth={3}
                      dot={{ fill: '#2196F3', r: 4 }}
                      name="Humidity (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Soil Nutrition Report
                </CardTitle>
                <CardDescription>What your soil needs right now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-medium">Nitrogen</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">Good</div>
                      <div className="text-xs text-muted-foreground">49 ppm</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="font-medium">Phosphorus</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">Low</div>
                      <div className="text-xs text-muted-foreground">32 ppm</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium">Potassium</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">Good</div>
                      <div className="text-xs text-muted-foreground">28 ppm</div>
                    </div>
                  </div>
                </div>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Recommendation:</strong> Add phosphorus-rich fertilizer this week to boost plant growth.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sensor Alerts & Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Smart Alerts & Recommendations
              </CardTitle>
              <CardDescription>Your sensors are watching your crops and giving you actionable advice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800">All Good!</h4>
                      <p className="text-xs text-green-600">Field A - Tomatoes</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mb-3">Your tomato plants are in perfect condition. Keep up the great work!</p>
                  <Button size="sm" variant="outline" className="w-full border-green-300 text-green-700">
                    View Details
                  </Button>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Droplets className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800">Water Needed</h4>
                      <p className="text-xs text-yellow-600">Field B - Lettuce</p>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">Soil moisture is getting low. Water your lettuce in the next 2 hours.</p>
                  <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600">
                    Set Reminder
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Leaf className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Fertilizer Time</h4>
                      <p className="text-xs text-blue-600">Field C - Carrots</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">Phosphorus levels are low. Add fertilizer this weekend for better growth.</p>
                  <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700">
                    Order Fertilizer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  if (currentView === 'disease') {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Farmer-friendly Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Camera className="h-8 w-8" />
                Plant Health Doctor
              </h1>
              <p className="text-muted-foreground mt-1">Take a photo and get instant diagnosis with treatment advice</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-4 py-2">
                <Heart className="w-4 h-4 mr-2" />
                AI Powered Diagnosis
              </Badge>
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                How it works
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Upload Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Take or Upload Plant Photo
                </CardTitle>
                <CardDescription>Get instant AI diagnosis in seconds - it's like having a plant doctor in your pocket!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Click here to take or upload photo</h3>
                  <p className="text-sm text-muted-foreground mb-4">Drag & drop or click to select image</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Upload Image
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    📱 Supports JPG, PNG up to 10MB • Works on phone camera
                  </p>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Pro Tips:</strong> Take photos in good lighting, focus on affected leaves, and include close-up shots for better accuracy.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium">95% Accuracy</p>
                    <p className="text-xs text-muted-foreground">AI Detection Rate</p>
                  </div>
                  <div className="p-3 bg-info/10 rounded-lg">
                    <Timer className="h-6 w-6 text-info mx-auto mb-2" />
                    <p className="text-sm font-medium">Under 3 Secs</p>
                    <p className="text-xs text-muted-foreground">Instant Results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Recent Detections */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Your Recent Plant Checkups
                </CardTitle>
                <CardDescription>AI analysis results with treatment recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div 
                  className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-800">Healthy Tomato Plant! 🍅</h4>
                      <Badge variant="outline" className="border-green-300 text-green-700 text-xs">95% Sure</Badge>
                    </div>
                    <p className="text-sm text-green-700 mb-2">Your tomato plants are thriving! No diseases detected.</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-green-600">Field A • 2 hours ago</p>
                      <Button size="sm" variant="outline" className="text-xs border-green-300 text-green-700">
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-yellow-800">Early Blight Found ⚠️</h4>
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700 text-xs">87% Sure</Badge>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">Early stage disease detected. Quick action needed!</p>
                    <div className="bg-yellow-100 rounded-lg p-3 mb-3">
                      <h5 className="text-xs font-medium text-yellow-800 mb-1">💡 Treatment Plan:</h5>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Remove affected leaves immediately</li>
                        <li>• Apply copper-based fungicide</li>
                        <li>• Improve air circulation</li>
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-yellow-600">Field B • Yesterday</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                          Get Treatment
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                          Call Expert
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-4 p-4 bg-red-50 rounded-xl border border-red-200 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-800">Leaf Spot Disease 🚨</h4>
                      <Badge variant="outline" className="border-red-300 text-red-700 text-xs">92% Sure</Badge>
                    </div>
                    <p className="text-sm text-red-700 mb-2">Serious fungal infection spreading fast!</p>
                    <div className="bg-red-100 rounded-lg p-3 mb-3">
                      <h5 className="text-xs font-medium text-red-800 mb-1">🚨 Urgent Action Needed:</h5>
                      <ul className="text-xs text-red-700 space-y-1">
                        <li>• Isolate affected plants now</li>
                        <li>• Apply systemic fungicide today</li>
                        <li>• Call farming expert immediately</li>
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-600">Field C • 2 days ago</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="text-xs bg-red-500 hover:bg-red-600">
                          Emergency Help
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-red-300 text-red-700">
                          <Phone className="w-3 h-3 mr-1" />
                          Call Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Common Plant Diseases Guide */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Common Plant Problems & Quick Fixes
              </CardTitle>
              <CardDescription>Learn to spot and treat common crop diseases before they spread</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-xl hover:shadow-md transition-shadow">
                  <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h4 className="font-medium mb-2">Yellow Leaves</h4>
                  <p className="text-sm text-muted-foreground mb-3">Usually means overwatering or nutrient deficiency</p>
                  <div className="text-xs text-left bg-yellow-50 p-3 rounded-lg">
                    <strong>Quick Fix:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Reduce watering frequency</li>
                      <li>• Add nitrogen fertilizer</li>
                      <li>• Check soil drainage</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center p-4 border rounded-xl hover:shadow-md transition-shadow">
                  <div className="bg-brown-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  </div>
                  <h4 className="font-medium mb-2">Brown Spots</h4>
                  <p className="text-sm text-muted-foreground mb-3">Often indicates fungal diseases or pest damage</p>
                  <div className="text-xs text-left bg-amber-50 p-3 rounded-lg">
                    <strong>Quick Fix:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Remove affected leaves</li>
                      <li>• Apply organic fungicide</li>
                      <li>• Improve air circulation</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center p-4 border rounded-xl hover:shadow-md transition-shadow">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="h-8 w-8 text-gray-600" />
                  </div>
                  <h4 className="font-medium mb-2">Wilting Plants</h4>
                  <p className="text-sm text-muted-foreground mb-3">Could be underwatering, root rot, or disease</p>
                  <div className="text-xs text-left bg-gray-50 p-3 rounded-lg">
                    <strong>Quick Fix:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Check soil moisture level</li>
                      <li>• Inspect roots for damage</li>
                      <li>• Water gradually if dry</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help & Support */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Need Expert Help?
              </CardTitle>
              <CardDescription>Connect with agricultural experts for personalized advice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call Plant Doctor: 1800-CROP-HELP
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  WhatsApp Photo for Instant Help
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  View Treatment Videos
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // Default Dashboard View
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Farmer-friendly Header */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Tractor className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary">Good Morning, Farmer!</h1>
                <p className="text-muted-foreground">Ready to make your farm thrive today?</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => onViewChange('disease')} className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Check Plant Health
            </Button>
            <Button onClick={() => onViewChange('sensors')} className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Field Sensors
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Weather & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today's Weather</CardTitle>
                <weatherData.today.icon className="h-8 w-8 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{weatherData.today.temp}°C</span>
                  <span className="text-sm text-muted-foreground">{weatherData.today.condition}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-blue-500" />
                    <span>{weatherData.today.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3 text-gray-500" />
                    <span>{weatherData.today.wind} km/h</span>
                  </div>
                </div>
                {weatherData.alerts.map((alert, index) => (
                  <Alert key={index} className={`${alert.priority === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
                    <AlertDescription className="text-xs">{alert.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Farm Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Your Farm at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">₹{farmStats.totalEarnings.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">This Month's Earnings</p>
                  <Badge variant="secondary" className="mt-1">+{farmStats.monthlyGrowth}% ↗</Badge>
                </div>
                <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                  <Sprout className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-success">{farmStats.healthyPlants}%</div>
                  <p className="text-sm text-muted-foreground">Healthy Plants</p>
                  <Badge variant="outline" className="mt-1 border-success text-success">Excellent</Badge>
                </div>
                <div className="text-center p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <Package className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-secondary">{farmStats.pendingOrders}</div>
                  <p className="text-sm text-muted-foreground">Orders to Fulfill</p>
                  <Badge variant="outline" className="mt-1">Ready to Ship</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Tasks */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                Today's Farm Tasks
              </CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                3 tasks pending
              </Badge>
            </div>
            <CardDescription>Your daily farming checklist - stay organized and productive!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    task.priority === 'high' 
                      ? 'border-l-red-500 bg-red-50 hover:bg-red-100' 
                      : 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        <h4 className="font-medium">{task.task}</h4>
                        <Badge variant="outline" className="text-xs">{task.field}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {task.estimated}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Soil Health Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Soil Health Score
              </CardTitle>
              <CardDescription>Real-time monitoring of your field conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {soilHealthData.map((metric, index) => (
                  <div key={metric.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" style={{ color: metric.color, borderColor: metric.color }}>
                          {metric.status}
                        </Badge>
                        <span className="text-sm font-bold">{metric.value}%</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={metric.value} className="h-3" />
                      <div 
                        className="absolute top-0 left-0 h-3 rounded-full transition-all duration-700"
                        style={{ 
                          width: `${metric.value}%`, 
                          backgroundColor: metric.color
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      {metric.action}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Field Conditions Today
              </CardTitle>
              <CardDescription>Live data from your smart sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sensorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="temperature" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="humidity" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Smart Crop Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="h-5 w-5 text-primary" />
                  Smart Crop Recommendations
                </CardTitle>
                <CardDescription>AI-powered suggestions based on your soil, weather, and market prices</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-1" />
                How it works
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cropRecommendations.map((crop, index) => (
                <motion.div
                  key={crop.crop}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="relative p-6 border rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  style={{ borderColor: crop.color + '30' }}
                >
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={crop.suitability > 90 ? "default" : "secondary"}
                      className="bg-white border"
                      style={{ color: crop.color, borderColor: crop.color }}
                    >
                      {crop.suitability}% Match
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: crop.color + '20' }}
                    >
                      <crop.icon className="h-6 w-6" style={{ color: crop.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{crop.crop}</h4>
                      <p className="text-sm text-muted-foreground">{crop.difficulty} to grow</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Profit Potential:</span>
                      <span className="text-sm font-bold" style={{ color: crop.color }}>{crop.profit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Time to Harvest:</span>
                      <span className="text-sm">{crop.timeToHarvest}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Best Season:</span>
                      <Badge variant="outline" className="text-xs">{crop.season}</Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <Button 
                    className="w-full group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: crop.color }}
                  >
                    Plant {crop.crop}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Help & Support */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Need Help with Your Farm?
            </CardTitle>
            <CardDescription>Our farming experts are here to support you 24/7</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Expert: 1800-123-FARM
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Send Plant Photo for Help
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Setup New Sensors
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}