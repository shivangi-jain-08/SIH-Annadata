// Vendor Service for API Integration

import { apiRequest } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class VendorService {
    
    // Get vendor's dashboard data
    static async getVendorDashboardData() {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const headers = {};
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            console.log('Fetching vendor dashboard data...');

            // Get vendor orders (both buying from farmers and selling to consumers)
            const ordersResponse = await apiRequest('/orders/my-orders?role=vendor', {
                method: 'GET',
                headers,
            });

            return {
                success: true,
                data: ordersResponse
            };
        } catch (error) {
            console.error('Error fetching vendor dashboard data:', error);
            
            // Return mock data for development/offline mode
            return {
                success: false,
                isMock: true,
                data: this.getMockVendorData(),
                error: error.message
            };
        }
    }

    // Get nearby consumers with active orders from this vendor
    static async getNearbyConsumers(vendorLocation = null) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const headers = {};
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            console.log('Fetching nearby consumers...');

            // API endpoint for getting consumers with active orders from this vendor
            let endpoint = '/vendors/nearby-consumers';
            if (vendorLocation) {
                endpoint += `?lat=${vendorLocation.latitude}&lng=${vendorLocation.longitude}&radius=10`;
            }

            const response = await apiRequest(endpoint, {
                method: 'GET',
                headers,
            });

            if (response.success) {
                return {
                    success: true,
                    data: response.data.consumers || response.data || []
                };
            } else {
                throw new Error(response.message || 'Failed to fetch consumers');
            }
        } catch (error) {
            console.error('Error fetching nearby consumers:', error);
            
            // Return mock data for development/offline mode
            return {
                success: false,
                isMock: true,
                data: this.getMockNearbyConsumers(vendorLocation),
                error: error.message
            };
        }
    }

    // Generate mock nearby consumers data
    static getMockNearbyConsumers(vendorLocation) {
        const baseLat = vendorLocation?.latitude || 28.6139;
        const baseLng = vendorLocation?.longitude || 77.2090;

        return Array.from({ length: 8 }, (_, index) => ({
            id: `consumer_${index + 1}`,
            name: `Consumer ${index + 1}`,
            email: `consumer${index + 1}@example.com`,
            phone: `+91 98765432${10 + index}`,
            address: `Address ${index + 1}, Sector ${index + 10}, Delhi`,
            latitude: baseLat + (Math.random() - 0.5) * 0.02, // Within ~1km radius
            longitude: baseLng + (Math.random() - 0.5) * 0.02,
            activeOrders: Math.floor(Math.random() * 5) + 1,
            orderValue: Math.floor(Math.random() * 15000) + 2000,
            distance: Math.random() * 3 + 0.5, // 0.5 to 3.5 km
            lastOrderDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            preferredCrops: ['Wheat', 'Rice', 'Tomatoes', 'Potatoes'].slice(0, Math.floor(Math.random() * 3) + 1),
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 star rating
            isVerified: Math.random() > 0.2 // 80% verified
        }));
    }

    // Get vendor orders (both buying and selling)
    static async getVendorOrders(type = 'all') {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const headers = {};
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            let endpoint = '/orders/my-orders?role=vendor';
            if (type === 'buying') {
                endpoint += '&type=buying';
            } else if (type === 'selling') {
                endpoint += '&type=selling';
            }

            console.log('Fetching vendor orders from:', endpoint);

            const response = await apiRequest(endpoint, {
                method: 'GET',
                headers,
            });

            return response;
        } catch (error) {
            console.error('Error fetching vendor orders:', error);
            throw new Error('Failed to fetch vendor orders. Please check your connection.');
        }
    }

    // Calculate vendor metrics from orders
    static calculateVendorMetrics(orders) {
        if (!orders || !Array.isArray(orders)) {
            return {
                totalRevenue: 0,
                activeOrders: 0,
                totalOrders: 0,
                deliveredOrders: 0,
                pendingOrders: 0,
                monthlyRevenue: 0,
                revenueGrowth: 0,
                activeOrdersGrowth: 0
            };
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Filter orders by month
        const currentMonthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });

        const lastMonthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
        });

        // Calculate metrics
        const totalRevenue = orders
            .filter(order => order.status === 'delivered')
            .reduce((total, order) => total + (order.totalAmount || 0), 0);

        const activeOrders = orders.filter(order => 
            order.status === 'pending' || 
            order.status === 'confirmed' || 
            order.status === 'in_transit'
        ).length;

        const currentMonthRevenue = currentMonthOrders
            .filter(order => order.status === 'delivered')
            .reduce((total, order) => total + (order.totalAmount || 0), 0);

        const lastMonthRevenue = lastMonthOrders
            .filter(order => order.status === 'delivered')
            .reduce((total, order) => total + (order.totalAmount || 0), 0);

        const currentMonthActive = currentMonthOrders.filter(order => 
            order.status === 'pending' || 
            order.status === 'confirmed' || 
            order.status === 'in_transit'
        ).length;

        const lastMonthActive = lastMonthOrders.filter(order => 
            order.status === 'pending' || 
            order.status === 'confirmed' || 
            order.status === 'in_transit'
        ).length;

        // Calculate growth percentages
        const revenueGrowth = lastMonthRevenue > 0 
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
            : currentMonthRevenue > 0 ? 100 : 0;

        const activeOrdersGrowth = lastMonthActive > 0 
            ? ((currentMonthActive - lastMonthActive) / lastMonthActive) * 100 
            : currentMonthActive > 0 ? 100 : 0;

        return {
            totalRevenue,
            activeOrders,
            totalOrders: orders.length,
            deliveredOrders: orders.filter(o => o.status === 'delivered').length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            monthlyRevenue: currentMonthRevenue,
            revenueGrowth: Math.round(revenueGrowth * 10) / 10, // Round to 1 decimal
            activeOrdersGrowth: Math.round(activeOrdersGrowth * 10) / 10
        };
    }

    // Format currency for display
    static formatCurrency(amount, currency = '₹') {
        if (!amount && amount !== 0) return `${currency}0`;
        
        // Format number with Indian number system
        if (amount >= 10000000) { // 1 crore
            return `${currency}${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) { // 1 lakh
            return `${currency}${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) { // 1 thousand
            return `${currency}${(amount / 1000).toFixed(1)}K`;
        }
        
        const formatter = new Intl.NumberFormat('en-IN');
        return `${currency}${formatter.format(amount)}`;
    }

    // Get recent activity for vendor
    static getRecentActivity(orders) {
        if (!orders || !Array.isArray(orders)) return [];

        // Sort by most recent and take last 5
        const recentOrders = orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        return recentOrders.map(order => {
            const timeAgo = this.getTimeAgo(order.createdAt);
            let activity = '';
            let icon = 'Package';
            let color = '#666';

            switch (order.status) {
                case 'delivered':
                    activity = `Order #${order._id?.slice(-6)} completed`;
                    icon = 'Check';
                    color = '#4CAF50';
                    break;
                case 'confirmed':
                    activity = `Order #${order._id?.slice(-6)} confirmed`;
                    icon = 'CheckCircle';
                    color = '#2196F3';
                    break;
                case 'pending':
                    activity = `New order #${order._id?.slice(-6)} received`;
                    icon = 'Plus';
                    color = '#FF9800';
                    break;
                case 'in_transit':
                    activity = `Order #${order._id?.slice(-6)} in transit`;
                    icon = 'Truck';
                    color = '#9C27B0';
                    break;
                default:
                    activity = `Order #${order._id?.slice(-6)} updated`;
            }

            return {
                id: order._id,
                activity,
                timeAgo,
                icon,
                color
            };
        });
    }

    // Helper function to calculate time ago
    static getTimeAgo(date) {
        const now = new Date();
        const orderDate = new Date(date);
        const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 1440) { // 24 hours
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    // Mock data for development/testing
    static getMockVendorData() {
        const mockOrders = [
            {
                _id: 'VND001',
                sellerId: 'farmer1',
                buyerId: 'consumer1',
                products: [
                    { name: 'Wheat', quantity: 500, price: 25, unit: 'kg' }
                ],
                totalAmount: 12500,
                status: 'delivered',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                _id: 'VND002',
                sellerId: 'farmer2',
                buyerId: 'consumer2',
                products: [
                    { name: 'Rice', quantity: 300, price: 40, unit: 'kg' }
                ],
                totalAmount: 12000,
                status: 'confirmed',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                _id: 'VND003',
                sellerId: 'farmer3',
                buyerId: 'consumer3',
                products: [
                    { name: 'Tomatoes', quantity: 200, price: 60, unit: 'kg' }
                ],
                totalAmount: 12000,
                status: 'pending',
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
            },
            {
                _id: 'VND004',
                sellerId: 'farmer1',
                buyerId: 'consumer4',
                products: [
                    { name: 'Onions', quantity: 400, price: 30, unit: 'kg' }
                ],
                totalAmount: 12000,
                status: 'delivered',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
                _id: 'VND005',
                sellerId: 'farmer2',
                buyerId: 'consumer5',
                products: [
                    { name: 'Potatoes', quantity: 600, price: 25, unit: 'kg' }
                ],
                totalAmount: 15000,
                status: 'in_transit',
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
            }
        ];

        return mockOrders;
    }
}

export default VendorService;

// Helper functions for easy import
export const getVendorDashboardData = VendorService.getVendorDashboardData.bind(VendorService);
export const getVendorOrders = VendorService.getVendorOrders.bind(VendorService);
export const calculateVendorMetrics = VendorService.calculateVendorMetrics.bind(VendorService);
export const formatCurrency = VendorService.formatCurrency.bind(VendorService);