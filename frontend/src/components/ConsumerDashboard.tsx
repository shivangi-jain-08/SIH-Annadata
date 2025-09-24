import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Search, 
  Filter, 
  Heart, 
  Star,
  MapPin,
  ShoppingCart,
  Truck,
  Clock,
  Plus,
  Minus,
  Eye
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ConsumerDashboardProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function ConsumerDashboard({ currentView, onViewChange }: ConsumerDashboardProps) {
  const featuredProducts = [
    {
      id: 1,
      name: "Fresh Organic Tomatoes",
      vendor: "Green Valley Farm",
      price: 45,
      originalPrice: 60,
      rating: 4.8,
      reviews: 124,
      distance: "2.3 km",
      image: "https://images.unsplash.com/photo-1683008952375-410ae668e6b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHRvbWF0b2VzfGVufDF8fHx8MTc1ODYxMzcxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      discount: 25,
      inStock: true,
      category: "Vegetables"
    },
    {
      id: 2,
      name: "Premium Basmati Rice",
      vendor: "Grain Master Co.",
      price: 120,
      originalPrice: 140,
      rating: 4.9,
      reviews: 89,
      distance: "3.1 km",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNtYXRpJTIwcmljZXxlbnwxfHx8fDE3NTg2NTA4NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      discount: 14,
      inStock: true,
      category: "Grains"
    },
    {
      id: 3,
      name: "Organic Mixed Salad",
      vendor: "Healthy Greens",
      price: 75,
      originalPrice: 85,
      rating: 4.7,
      reviews: 156,
      distance: "1.8 km",
      image: "https://images.unsplash.com/photo-1617138230108-bd1a7f72351e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtaXhlZCUyMHNhbGFkJTIwZ3JlZW5zfGVufDF8fHx8MTc1ODY1MDg4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      discount: 12,
      inStock: true,
      category: "Vegetables"
    },
    {
      id: 4,
      name: "Fresh Strawberries",
      vendor: "Berry Bliss Farm",
      price: 250,
      originalPrice: 300,
      rating: 4.9,
      reviews: 67,
      distance: "4.2 km",
      image: "https://images.unsplash.com/photo-1565032156168-0a22e5b8374f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHN0cmF3YmVycmllc3xlbnwxfHx8fDE3NTg1Mzg0ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      discount: 17,
      inStock: false,
      category: "Fruits"
    }
  ];

  const nearbyVendors = [
    {
      id: 1,
      name: "Green Valley Farm",
      rating: 4.8,
      distance: "2.3 km",
      products: 24,
      specialties: ["Organic Vegetables", "Herbs"],
      isOpen: true
    },
    {
      id: 2,
      name: "Grain Master Co.",
      rating: 4.9,
      distance: "3.1 km",
      products: 18,
      specialties: ["Rice", "Wheat", "Pulses"],
      isOpen: true
    },
    {
      id: 3,
      name: "Berry Bliss Farm",
      rating: 4.7,
      distance: "4.2 km",
      products: 12,
      specialties: ["Seasonal Fruits", "Berries"],
      isOpen: false
    }
  ];

  const recentOrders = [
    {
      id: "#ORD001",
      vendor: "Green Valley Farm",
      items: ["Tomatoes", "Lettuce", "Carrots"],
      total: 185,
      status: "delivered",
      date: "2 days ago"
    },
    {
      id: "#ORD002",
      vendor: "Grain Master Co.",
      items: ["Basmati Rice", "Wheat Flour"],
      total: 450,
      status: "shipped",
      date: "3 days ago"
    },
    {
      id: "#ORD003",
      vendor: "Berry Bliss Farm",
      items: ["Strawberries", "Blueberries"],
      total: 320,
      status: "processing",
      date: "1 week ago"
    }
  ];

  if (currentView === 'vendors') {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nearby Vendors</h1>
          <div className="flex items-center space-x-2">
            <Input placeholder="Search vendors..." className="w-64" />
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyVendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{vendor.name}</CardTitle>
                    <Badge variant={vendor.isOpen ? "default" : "secondary"}>
                      {vendor.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{vendor.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{vendor.distance}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">{vendor.products} Products Available</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {vendor.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full" variant={vendor.isOpen ? "default" : "secondary"}>
                      {vendor.isOpen ? "View Products" : "View Details"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (currentView === 'orders') {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <div className="flex space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {recentOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.vendor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          order.status === 'delivered' ? 'default' : 
                          order.status === 'shipped' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{order.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Items:</p>
                      <p className="text-sm">{order.items.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{order.total}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Default Marketplace View
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Discover fresh produce from local vendors</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => onViewChange('vendors')}>
            <MapPin className="w-4 h-4 mr-2" />
            Find Vendors
          </Button>
          <Button onClick={() => onViewChange('orders')}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            My Orders
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div 
        className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search for products..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="vegetables">Vegetables</SelectItem>
            <SelectItem value="fruits">Fruits</SelectItem>
            <SelectItem value="grains">Grains</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="distance">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">156</div>
              <p className="text-xs text-muted-foreground">Products Available</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">23</div>
              <p className="text-xs text-muted-foreground">Active Vendors</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">2.1</div>
              <p className="text-xs text-muted-foreground">Avg Distance (km)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">4.8</div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Featured Products */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured Products</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                    <ImageWithFallback 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  {product.discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      -{product.discount}%
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.vendor}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{product.distance}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <Badge variant={product.inStock ? "default" : "secondary"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <div className="flex items-center border rounded">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="px-3 text-sm">1</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button className="flex-1" disabled={!product.inStock}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.inStock ? "Add to Cart" : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}