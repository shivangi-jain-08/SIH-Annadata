import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Search,
  MapPin,
  Clock,
  Star
} from 'lucide-react';

interface FarmerProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  farmerId: string;
  farmerName: string;
  location: string;
  distance: number;
  rating: number;
  imageUrl?: string;
  harvestDate: string;
  category: string;
}

const FarmerMarketplace: React.FC = () => {
  const [products, setProducts] = useState<FarmerProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockProducts: FarmerProduct[] = [
      {
        id: '1',
        name: 'Organic Tomatoes',
        description: 'Fresh organic tomatoes grown without pesticides',
        price: 40,
        unit: 'kg',
        quantity: 100,
        farmerId: 'farmer1',
        farmerName: 'Rajesh Kumar',
        location: 'Gurgaon, Haryana',
        distance: 5.2,
        rating: 4.8,
        harvestDate: '2024-01-15',
        category: 'Vegetables'
      },
      {
        id: '2',
        name: 'Fresh Spinach',
        description: 'Leafy green spinach, harvested this morning',
        price: 25,
        unit: 'kg',
        quantity: 50,
        farmerId: 'farmer2',
        farmerName: 'Priya Sharma',
        location: 'Faridabad, Haryana',
        distance: 8.1,
        rating: 4.6,
        harvestDate: '2024-01-16',
        category: 'Leafy Greens'
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Farmer Marketplace</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">
                  ₹{product.price}/{product.unit}
                </div>
                <div className="text-sm text-gray-500">
                  {product.quantity} {product.unit} available
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span>By {product.farmerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{product.location} • {product.distance}km away</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{product.rating}/5.0</span>
                </div>
              </div>

              <Button className="w-full">
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No products available at the moment'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FarmerMarketplace;