import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface ProximityNotification {
  type: 'vendor-nearby' | 'vendor-departed' | 'vendor-updated';
  vendorId: string;
  vendorName: string;
  distance: number; // meters
  coordinates: [number, number]; // [longitude, latitude]
  products: string[];
  estimatedArrival: string;
  timestamp: Date;
  notificationId: string;
  title?: string;
  message?: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: ProximityNotification[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  connect: () => void;
  disconnect: () => void;
  updateLocation: (location: { latitude: number; longitude: number }) => void;
  acknowledgeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<ProximityNotification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const { user, isAuthenticated } = useAuth();

  const connect = useCallback(() => {
    if (socket?.connected) return;

    setConnectionStatus('connecting');
    
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('authToken'),
        userId: user?.id
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }
      
      // Schedule reconnection with exponential backoff
      scheduleReconnection();
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
      scheduleReconnection();
    });

    // Listen for proximity notifications
    newSocket.on('vendor-nearby', (data: ProximityNotification) => {
      console.log('Vendor nearby notification:', data);
      setNotifications(prev => {
        // Avoid duplicates
        const exists = prev.some(n => n.notificationId === data.notificationId);
        if (exists) return prev;
        
        // Add new notification and keep only last 10
        return [data, ...prev].slice(0, 10);
      });
    });

    newSocket.on('vendor-departed', (data: ProximityNotification) => {
      console.log('Vendor departed notification:', data);
      setNotifications(prev => 
        prev.filter(n => n.vendorId !== data.vendorId)
      );
    });

    newSocket.on('vendor-updated', (data: ProximityNotification) => {
      console.log('Vendor updated notification:', data);
      setNotifications(prev => 
        prev.map(n => n.vendorId === data.vendorId ? data : n)
      );
    });

    // Listen for general proximity notifications
    newSocket.on('proximity-notification', (data: ProximityNotification) => {
      console.log('Proximity notification:', data);
      setNotifications(prev => [data, ...prev].slice(0, 10));
    });

    setSocket(newSocket);
  }, [user?.id]);

  const scheduleReconnection = useCallback(() => {
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Max 30 seconds
    
    setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      connect();
    }, delay);
  }, [reconnectAttempts, connect]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [socket]);

  const updateLocation = useCallback((location: { latitude: number; longitude: number }) => {
    if (socket?.connected) {
      socket.emit('update-location', {
        longitude: location.longitude,
        latitude: location.latitude,
        timestamp: new Date().toISOString()
      });
    }
  }, [socket]);

  const acknowledgeNotification = useCallback((notificationId: string) => {
    if (socket?.connected) {
      socket.emit('acknowledge-notification', { notificationId });
    }
    
    // Remove from local state
    setNotifications(prev => 
      prev.filter(n => n.notificationId !== notificationId)
    );
  }, [socket]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, user]); // Removed connect/disconnect from dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    notifications,
    connectionStatus,
    connect,
    disconnect,
    updateLocation,
    acknowledgeNotification,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}