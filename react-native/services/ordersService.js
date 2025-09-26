// Orders Service for API Integration

import { apiRequest } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OrdersService {
    
    // Get user's orders (buyer or seller)
    static async getUserOrders(role = 'seller', status = null) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const headers = {};
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            let endpoint = `/orders/my-orders?role=${role}`;
            if (status) {
                endpoint += `&status=${status}`;
            }

            console.log('Fetching orders from:', endpoint);

            const response = await apiRequest(endpoint, {
                method: 'GET',
                headers,
            });

            return response;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            throw new Error('Failed to fetch orders. Please check your connection.');
        }
    }

    // Get order statistics for dashboard
    static async getOrderStats(role = 'seller') {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const headers = {};
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const endpoint = `/orders/stats?role=${role}`;

            console.log('Fetching order stats from:', endpoint);

            const response = await apiRequest(endpoint, {
                method: 'GET',
                headers,
            });

            return response;
        } catch (error) {
            console.error('Error fetching order stats:', error);
            throw new Error('Failed to fetch order statistics. Please check your connection.');
        }
    }

    // Calculate active orders (pending + confirmed + in_transit)
    static calculateActiveOrders(orders) {
        if (!orders || !Array.isArray(orders)) return 0;
        
        return orders.filter(order => 
            order.status === 'pending' || 
            order.status === 'confirmed' || 
            order.status === 'in_transit'
        ).length;
    }

    // Calculate total revenue from delivered orders
    static calculateTotalRevenue(orders) {
        if (!orders || !Array.isArray(orders)) return 0;
        
        return orders
            .filter(order => order.status === 'delivered')
            .reduce((total, order) => total + (order.totalAmount || 0), 0);
    }

    // Get dashboard metrics
    static getDashboardMetrics(orders) {
        if (!orders || !Array.isArray(orders)) {
            return {
                activeOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                confirmedOrders: 0,
                deliveredOrders: 0,
                cancelledOrders: 0
            };
        }

        const metrics = {
            activeOrders: this.calculateActiveOrders(orders),
            totalRevenue: this.calculateTotalRevenue(orders),
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
            deliveredOrders: orders.filter(o => o.status === 'delivered').length,
            cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
            totalOrders: orders.length
        };

        return metrics;
    }

    // Format currency for display
    static formatCurrency(amount, currency = '₹') {
        if (!amount && amount !== 0) return `${currency}0`;
        
        // Format number with Indian number system (lakhs, crores)
        const formatter = new Intl.NumberFormat('en-IN');
        return `${currency}${formatter.format(amount)}`;
    }

    // Get order status color for UI
    static getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'pending':
                return '#FF9800'; // Orange
            case 'confirmed':
                return '#2196F3'; // Blue
            case 'in_transit':
                return '#9C27B0'; // Purple
            case 'delivered':
                return '#4CAF50'; // Green
            case 'cancelled':
                return '#F44336'; // Red
            default:
                return '#757575'; // Gray
        }
    }

    // Get user-friendly status text
    static getStatusText(status) {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'Pending';
            case 'confirmed':
                return 'Confirmed';
            case 'in_transit':
                return 'In Transit';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    }

    // Check if order is active (for farmer dashboard)
    static isActiveOrder(order) {
        const activeStatuses = ['pending', 'confirmed', 'in_transit'];
        return activeStatuses.includes(order.status?.toLowerCase());
    }

    // Get recent orders (last 30 days)
    static getRecentOrders(orders, days = 30) {
        if (!orders || !Array.isArray(orders)) return [];
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= cutoffDate;
        });
    }

    // Generate mock order data for testing (remove in production)
    static generateMockOrderData(userId) {
        return [
            {
                _id: '1',
                buyerId: { name: 'Consumer 1', phone: '+919876543210' },
                products: [
                    { name: 'Wheat', quantity: 100, price: 25, unit: 'kg' },
                    { name: 'Rice', quantity: 50, price: 40, unit: 'kg' }
                ],
                totalAmount: 4500,
                status: 'delivered',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                _id: '2',
                buyerId: { name: 'Consumer 2', phone: '+919876543211' },
                products: [
                    { name: 'Corn', quantity: 75, price: 30, unit: 'kg' }
                ],
                totalAmount: 2250,
                status: 'confirmed',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                _id: '3',
                buyerId: { name: 'Consumer 3', phone: '+919876543212' },
                products: [
                    { name: 'Tomatoes', quantity: 200, price: 15, unit: 'kg' }
                ],
                totalAmount: 3000,
                status: 'pending',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                _id: '4',
                buyerId: { name: 'Consumer 4', phone: '+919876543213' },
                products: [
                    { name: 'Onions', quantity: 150, price: 20, unit: 'kg' }
                ],
                totalAmount: 3000,
                status: 'delivered',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
            },
            {
                _id: '5',
                buyerId: { name: 'Consumer 5', phone: '+919876543214' },
                products: [
                    { name: 'Potatoes', quantity: 80, price: 18, unit: 'kg' }
                ],
                totalAmount: 1440,
                status: 'in_transit',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            }
        ];
    }
}

export default OrdersService;

// Helper functions for easy import
export const getUserOrders = OrdersService.getUserOrders.bind(OrdersService);
export const getOrderStats = OrdersService.getOrderStats.bind(OrdersService);
export const calculateActiveOrders = OrdersService.calculateActiveOrders.bind(OrdersService);
export const calculateTotalRevenue = OrdersService.calculateTotalRevenue.bind(OrdersService);
export const formatCurrency = OrdersService.formatCurrency.bind(OrdersService);