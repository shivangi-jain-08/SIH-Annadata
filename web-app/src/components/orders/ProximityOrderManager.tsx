import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
      ShoppingCart, 
      MapPin, 
      Clock,
      Truck,
      Bell,
      BellOff,
      Eye,
      X,
      Package,
      AlertCircle,
      CheckCircle,
      RefreshCw,
      Navigation,
      Calculator
    
} from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useLocation } from '@/hooks/useLocation';
import { useOrders } from '@/hooks/useOrders';
import { getCardStyles } from '@/utils/styles';
import { QuickOrderFromProximity } from './QuickOrderFromProximity';
import ApiClient from '@/services/api';

interface ProximityOrder {
      id: string;
      vendorId: string;
      vendorName: string;
      vendorPhone?: string;
      distance: number;
      estimatedDeliveryTime: string;
      products: string[];
      totalProducts: number;
      isActive: boolean;
      timestamp: Date;
      notificationId?: string;
      deliveryFee?: number;
      minOrderValue?: number;
    
}

interface ProximityOrderManagerProps {
      maxOrders?: number;
      autoAcceptRadius?: number; // Auto-show orders within this radius
//   showNotifications?: boolean;
// }
// 
// export function ProximityOrderManager({
//   maxOrders = 10,
//   autoAcceptRadius = 1000, // 1km
//   showNotifications = true
// }: ProximityOrderManagerProps) {
//   const { socket, isConnected, notifications } = useWebSocket();
//   const { location } = useLocation();
//   const { refetch: refetchOrders } = useOrders();
//   
//   const [proximityOrders, setProximityOrders] = useState<ProximityOrder[]>([]);
//   const [selectedOrder, setSelectedOrder] = useState<ProximityOrder | null>(null);
//   const [showQuickOrder, setShowQuickOrder] = useState(false);
//   const [dismissedOrders, setDismissedOrders] = useState<Set<string>>(new Set());
//   const [notificationsEnabled, setNotificationsEnabled] = useState(showNotifications);
//   const [orderHistory, setOrderHistory] = useState<string[]>([]);
// 
//   // Process proximity notifications into orders
//   useEffect(() => {
//     const processNotifications = () => {
//       const orders: ProximityOrder[] = notifications
//         .filter(notification => 
//           notification.type === 'vendor-nearby' && 
//           !dismissedOrders.has(notification.notificationId)
//         )
//         .map(notification => ({
//           id: notification.notificationId,
//           vendorId: notification.vendorId,
//           vendorName: notification.vendorName,
//           distance: notification.distance,
//           estimatedDeliveryTime: notification.estimatedArrival || '15-30 minutes',
//           products: notification.products || [],
//           totalProducts: notification.products?.length || 0,
//           isActive: true,
//           timestamp: notification.timestamp,
//           notificationId: notification.notificationId,
//           deliveryFee: calculateDeliveryFee(notification.distance)
//         }))
//         .sort((a, b) => a.distance - b.distance)
//         .slice(0, maxOrders);
// 
//       setProximityOrders(orders);
// 
//       // Auto-show orders within auto-accept radius
//       const nearbyOrders = orders.filter(order => 
//         order.distance <= autoAcceptRadius && 
//         !orderHistory.includes(order.id)
//       );
// 
//       if (nearbyOrders.length > 0 && notificationsEnabled) {
//         showBrowserNotification(nearbyOrders[0]);
//       }
//     };
// 
//     processNotifications();
//   }, [notifications, dismissedOrders, maxOrders, autoAcceptRadius, notificationsEnabled, orderHistory]);
// 
//   // Listen for real-time vendor updates
//   useEffect(() => {
//     if (!socket || !isConnected) return;
// 
//     const handleVendorDeparted = (data: any) => {
//       setProximityOrders(prev => 
//         prev.filter(order => order.vendorId !== data.vendorId)
//       );
//     };
// 
//     const handleVendorUpdated = (data: any) => {
//       setProximityOrders(prev => 
//         prev.map(order => 
//           order.vendorId === data.vendorId 
//             ? {
//                 ...order,
//                 distance: data.distance || order.distance,
//                 estimatedDeliveryTime: data.estimatedDeliveryTime || order.estimatedDeliveryTime,
//                 isActive: data.isActive !== false,
//                 deliveryFee: calculateDeliveryFee(data.distance || order.distance)
//               }
//             : order
//         )
//       );
//     };
// 
//     socket.on('vendor-departed', handleVendorDeparted);
//     socket.on('vendor-updated', handleVendorUpdated);
// 
//     return () => {
//       socket.off('vendor-departed', handleVendorDeparted);
//       socket.off('vendor-updated', handleVendorUpdated);
//     };
//   }, [socket, isConnected]);
// 
//   const calculateDeliveryFee = (distance: number): number => {
//     const baseFee = 20;
//     const distanceFee = Math.max(0, (distance - 500) / 100) * 2;
//     return Math.round(baseFee + distanceFee);
//   };
// 
//   const showBrowserNotification = (order: ProximityOrder) => {
//     if ('Notification' in window && Notification.permission === 'granted') {
//       const notification = new Notification(
//         `🚚 ${order.vendorName} is nearby!`,
//         {
//           body: `${order.distance}m away • ${order.totalProducts} products available • Est. delivery: ${order.estimatedDeliveryTime}`,
//           icon: '/favicon.ico',
//           tag: `proximity-order-${order.id}`,
//           requireInteraction: true,
//           actions: [
//             { action: 'view', title: 'View Products' },
//             { action: 'dismiss', title: 'Dismiss' }
//           ]
//         }
//       );
// 
//       notification.onclick = () => {
//         handleViewOrder(order);
//         notification.close();
//       };
// 
//       // Auto-close after 10 seconds
//       setTimeout(() => {
//         notification.close();
//       }, 10000);
//     }
//   };
// 
//   const handleViewOrder = (order: ProximityOrder) => {
//     setSelectedOrder(order);
//     setShowQuickOrder(true);
//     
//     // Add to history to prevent duplicate notifications
//     setOrderHistory(prev => [...prev, order.id].slice(-50)); // Keep last 50
//   };
// 
//   const handleDismissOrder = (orderId: string) => {
//     setDismissedOrders(prev => new Set([...prev, orderId]));
//     
//     // Acknowledge the notification
//     const order = proximityOrders.find(o => o.id === orderId);
//     if (order?.notificationId && socket) {
//       socket.emit('acknowledge-notification', { notificationId: order.notificationId });
//     }
//   };
// 
//   const handleOrderPlaced = async (orderId: string) => {
//     setShowQuickOrder(false);
//     setSelectedOrder(null);
//     
//     // Refresh orders list
//     await refetchOrders();
//     
//     // Show success notification
//     if ('Notification' in window && Notification.permission === 'granted') {
//       new Notification('✅ Order Placed Successfully!', {
//         body: `Your order has been placed. Order ID: ${orderId}`,
//         icon: '/favicon.ico'
//       });
//     }
//   };
// 
//   const requestNotificationPermission = async () => {
//     if ('Notification' in window && Notification.permission === 'default') {
//       const permission = await Notification.requestPermission();
//       if (permission === 'granted') {
//         setNotificationsEnabled(true);
//       }
//     }
//   };
// 
//   const formatTimeAgo = (timestamp: Date) => {
//     const now = new Date();
//     const diffMs = now.getTime() - timestamp.getTime();
//     const diffMins = Math.floor(diffMs / 60000);
//     
//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins}m ago`;
//     return `${Math.floor(diffMins / 60)}h ago`;
//   };
// 
//   const getDistanceColor = (distance: number) => {
//     if (distance <= 500) return 'text-green-600';
//     if (distance <= 1000) return 'text-yellow-600';
//     return 'text-red-600';
//   };
// 
//   const getDistanceBadge = (distance: number) => {
//     if (distance <= 500) return { variant: 'default' as const, color: 'bg-green-500', text: 'Very Close' };
//     if (distance <= 1000) return { variant: 'outline' as const, color: 'border-yellow-500 text-yellow-700', text: 'Nearby' };
//     return { variant: 'outline' as const, color: 'border-red-500 text-red-700', text: 'Far' };
//   };
// 
//   return (
//     <div className=\"space-y-4\">
//       {/* Header */}
//       <Card>
//         <CardHeader>
//           <CardTitle className=\"flex items-center justify-between\">
//             <div className=\"flex items-center space-x-2\">
//               <Truck className=\"h-5 w-5 text-blue-500\" />
//               <span>Nearby Delivery Opportunities</span>
//               <Badge variant=\"outline\" className=\"ml-2\">
//                 {proximityOrders.length} available
//               </Badge>
//             </div>
//             <div className=\"flex items-center space-x-2\">
//               <Button
//                 size=\"sm\"
//                 variant=\"outline\"
//                 onClick={() => setNotificationsEnabled(!notificationsEnabled)}
//                 className={notificationsEnabled ? 'text-green-600' : 'text-gray-600'}
//               >
//                 {notificationsEnabled ? (
//                   <Bell className=\"h-4 w-4 mr-2\" />
//                 ) : (
//                   <BellOff className=\"h-4 w-4 mr-2\" />
//                 )}
//                 {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
//               </Button>
//             </div>
//           </CardTitle>
//           <CardDescription className=\"flex items-center justify-between\">
//             <span>Vendors nearby offering delivery to your location</span>
//             <div className=\"flex items-center space-x-1 text-xs text-muted-foreground\">
//               <div className={`w-2 h-2 rounded-full ${
//                 isConnected ? 'bg-green-500' : 'bg-red-500'
//               }`} />
//               <span>{isConnected ? 'Live Updates' : 'Offline'}</span>
//             </div>
//           </CardDescription>
//         </CardHeader>
//       </Card>
// 
//       {/* Connection Status */}
//       {!isConnected && (
//         <Card className=\"border-yellow-200 bg-yellow-50\">
//           <CardContent className=\"p-4\">
//             <div className=\"flex items-center space-x-2 text-yellow-800\">
//               <AlertCircle className=\"h-5 w-5\" />
//               <span className=\"font-medium\">Real-time updates unavailable</span>
//             </div>
//             <p className=\"text-sm text-yellow-700 mt-1\">
//               You may miss nearby vendor notifications. Check your connection.
//             </p>
//           </CardContent>
//         </Card>
//       )}
// 
//       {/* Notification Permission */}
//       {'Notification' in window && Notification.permission === 'default' && (
//         <Card className=\"border-blue-200 bg-blue-50\">
//           <CardContent className=\"p-4\">
//             <div className=\"flex items-center justify-between\">
//               <div className=\"flex items-center space-x-2 text-blue-800\">
//                 <Bell className=\"h-5 w-5\" />
//                 <span className=\"font-medium\">Enable notifications for better experience</span>
//               </div>
//               <Button size=\"sm\" onClick={requestNotificationPermission}>
//                 Enable Notifications
//               </Button>
//             </div>
//             <p className=\"text-sm text-blue-700 mt-1\">
//               Get instant alerts when vendors are nearby for quick ordering.
//             </p>
//           </CardContent>
//         </Card>
//       )}
// 
//       {/* Orders List */}
//       <div className=\"space-y-3\">
//         {proximityOrders.length === 0 ? (
//           <Card>
//             <CardContent className=\"p-8 text-center\">
//               <Truck className=\"h-12 w-12 text-muted-foreground mx-auto mb-4\" />
//               <h3 className=\"text-lg font-semibold mb-2\">No vendors nearby</h3>
//               <p className=\"text-muted-foreground mb-4\">
//                 {isConnected 
//                   ? 'Waiting for vendors to come online in your area...' 
//                   : 'Connect to see nearby vendors offering delivery.'
//                 }
//               </p>
//               {!location && (
//                 <div className=\"p-3 bg-yellow-50 border border-yellow-200 rounded-lg\">
//                   <div className=\"flex items-center space-x-2 text-yellow-800\">
//                     <Navigation className=\"h-4 w-4\" />
//                     <span className=\"text-sm font-medium\">Location required</span>
//                   </div>
//                   <p className=\"text-xs text-yellow-700 mt-1\">
//                     Enable location services to see nearby vendors
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         ) : (
//           proximityOrders.map((order) => {
//             const distanceBadge = getDistanceBadge(order.distance);
//             
//             return (
//               <Card key={order.id} className={getCardStyles('hover')}>
//                 <CardContent className=\"p-4\">
//                   <div className=\"flex items-start justify-between\">
//                     <div className=\"flex items-start space-x-3 flex-1\">
//                       <div className={`p-2 rounded-full ${
//                         order.isActive ? 'bg-green-100' : 'bg-gray-100'
//                       }`}>
//                         <Truck className={`h-4 w-4 ${
//                           order.isActive ? 'text-green-600' : 'text-gray-600'
//                         }`} />
//                       </div>
//                       <div className=\"flex-1\">
//                         <div className=\"flex items-center space-x-2 mb-1\">
//                           <h3 className=\"font-semibold text-sm\">{order.vendorName}</h3>
//                           <Badge 
//                             variant={distanceBadge.variant}
//                             className={distanceBadge.color}
//                           >
//                             {distanceBadge.text}
//                           </Badge>
//                           {order.isActive && (
//                             <div className=\"flex items-center space-x-1 text-xs text-green-600\">
//                               <div className=\"w-2 h-2 bg-green-500 rounded-full animate-pulse\" />
//                               <span>Available</span>
//                             </div>
//                           )}
//                         </div>
//                         
//                         <div className=\"grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-2\">
//                           <div className=\"flex items-center space-x-1\">
//                             <MapPin className=\"h-3 w-3\" />
//                             <span className={getDistanceColor(order.distance)}>
//                               {order.distance}m away
//                             </span>
//                           </div>
//                           <div className=\"flex items-center space-x-1\">
//                             <Clock className=\"h-3 w-3\" />
//                             <span>{order.estimatedDeliveryTime}</span>
//                           </div>
//                           <div className=\"flex items-center space-x-1\">
//                             <Package className=\"h-3 w-3\" />
//                             <span>{order.totalProducts} products</span>
//                           </div>
//                           <div className=\"flex items-center space-x-1\">
//                             <Calculator className=\"h-3 w-3\" />
//                             <span>₹{order.deliveryFee} delivery</span>
//                           </div>
//                         </div>
//                         
//                         {order.products.length > 0 && (
//                           <div className=\"flex flex-wrap gap-1 mb-2\">
//                             {order.products.slice(0, 3).map((product, index) => (
//                               <Badge key={index} variant=\"outline\" className=\"text-xs\">
//                                 {product}
//                               </Badge>
//                             ))}
//                             {order.products.length > 3 && (
//                               <Badge variant=\"outline\" className=\"text-xs\">
//                                 +{order.products.length - 3} more
//                               </Badge>
//                             )}
//                           </div>
//                         )}
//                         
//                         <p className=\"text-xs text-muted-foreground\">
//                           Notified {formatTimeAgo(order.timestamp)}
//                         </p>
//                       </div>
//                     </div>
//                     
//                     <div className=\"flex flex-col items-end space-y-2\">
//                       {order.isActive ? (
//                         <Button 
//                           size=\"sm\" 
//                           onClick={() => handleViewOrder(order)}
//                         >
//                           <Eye className=\"h-4 w-4 mr-2\" />
//                           Quick Order
//                         </Button>
//                       ) : (
//                         <Badge variant=\"outline\" className=\"text-xs\">
//                           Unavailable
//                         </Badge>
//                       )}
//                       <Button 
//                         size=\"sm\" 
//                         variant=\"outline\"
//                         onClick={() => handleDismissOrder(order.id)}
//                       >
//                         <X className=\"h-4 w-4\" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })
//         )}
//       </div>
// 
//       {/* Quick Order Modal */}
//       {showQuickOrder && selectedOrder && (
//         <QuickOrderFromProximity
//           vendorId={selectedOrder.vendorId}
//           vendorName={selectedOrder.vendorName}
//           distance={selectedOrder.distance}
//           estimatedDeliveryTime={selectedOrder.estimatedDeliveryTime}
//           onClose={() => {
//             setShowQuickOrder(false);
//             setSelectedOrder(null);
//           }}
//           onOrderPlaced={handleOrderPlaced}
//         />
//       )}
//     </div>
//   );
// }"
}