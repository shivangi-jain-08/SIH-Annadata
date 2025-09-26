import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionStats {
  connectedAt?: Date;
  lastDisconnect?: Date;
  reconnectAttempts: number;
  totalUptime: number;
  messagesReceived: number;
  messagesSent: number;
}

interface RealTimeConnectionManagerProps {
  showStats?: boolean;
  showReconnectButton?: boolean;
  autoReconnect?: boolean;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'inline';
  compact?: boolean;
}

export function RealTimeConnectionManager({
  showStats = false,
  showReconnectButton = true,
  autoReconnect = true,
  position = 'bottom-right',
  compact = false
}: RealTimeConnectionManagerProps) {
  const { socket, isConnected, connectionStatus, connect, disconnect } = useWebSocket();
  const { isAuthenticated } = useAuth();
  
  const [stats, setStats] = useState<ConnectionStats>({
    reconnectAttempts: 0,
    totalUptime: 0,
    messagesReceived: 0,
    messagesSent: 0
  });
  const [showDetails, setShowDetails] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  // Track connection statistics
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setStats(prev => ({
        ...prev,
        connectedAt: new Date(),
        reconnectAttempts: 0
      }));
    };

    const handleDisconnect = () => {
      setStats(prev => ({
        ...prev,
        lastDisconnect: new Date(),
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
    };

    const handleMessage = () => {
      setStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1
      }));
      setLastActivity(new Date());
    };

    const handleSend = () => {
      setStats(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + 1
      }));
      setLastActivity(new Date());
    };

    // Listen to all events to track activity
    const originalEmit = socket.emit;
    socket.emit = function(...args) {
      handleSend();
      return originalEmit.apply(this, args);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    // Listen to common events
    const eventTypes = [
      'vendor-nearby',
      'vendor-departed', 
      'vendor-updated',
      'vendor-online',
      'vendor-offline',
      'vendor-location-updated',
      'product-updated',
      'new-order-received',
      'order-updated',
      'proximity-notification'
    ];
    
    eventTypes.forEach(eventType => {
      socket.on(eventType, handleMessage);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      eventTypes.forEach(eventType => {
        socket.off(eventType, handleMessage);
      });
      
      // Restore original emit
      socket.emit = originalEmit;
    };
  }, [socket]);

  // Calculate uptime
  useEffect(() => {
    if (!isConnected || !stats.connectedAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const uptime = now.getTime() - stats.connectedAt!.getTime();
      setStats(prev => ({ ...prev, totalUptime: uptime }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, stats.connectedAt]);

  const handleReconnect = useCallback(() => {
    if (isConnected) {
      disconnect();
      setTimeout(connect, 1000);
    } else {
      connect();
    }
  }, [isConnected, connect, disconnect]);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatLastActivity = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return CheckCircle;
      case 'connecting': return RefreshCw;
      case 'disconnected': return WifiOff;
      case 'error': return AlertCircle;
      default: return WifiOff;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();
  const statusText = getStatusText();

  // Compact version for inline display
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-1 ${statusColor}`}>
          <StatusIcon className={`h-4 w-4 ${
            connectionStatus === 'connecting' ? 'animate-spin' : ''
          }`} />
          <span className="text-sm font-medium">{statusText}</span>
        </div>
        {showReconnectButton && !isConnected && (
          <Button size="sm" variant="outline" onClick={handleReconnect}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        )}
      </div>
    );
  }

  // Inline version
  if (position === 'inline') {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isConnected ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <StatusIcon className={`h-5 w-5 ${statusColor} ${
                  connectionStatus === 'connecting' ? 'animate-spin' : ''
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Real-time Connection</h3>
                <p className={`text-sm ${statusColor}`}>{statusText}</p>
                {isConnected && stats.connectedAt && (
                  <p className="text-xs text-muted-foreground">
                    Connected for {formatUptime(stats.totalUptime)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {showStats && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Stats
                </Button>
              )}
              {showReconnectButton && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReconnect}
                  disabled={connectionStatus === 'connecting'}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${
                    connectionStatus === 'connecting' ? 'animate-spin' : ''
                  }`} />
                  {isConnected ? 'Reconnect' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
          
          {showDetails && showStats && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Messages Received</p>
                  <p className="text-lg font-semibold">{stats.messagesReceived}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Messages Sent</p>
                  <p className="text-lg font-semibold">{stats.messagesSent}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Reconnect Attempts</p>
                  <p className="text-lg font-semibold">{stats.reconnectAttempts}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Last Activity</p>
                  <p className="text-lg font-semibold">{formatLastActivity()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Floating position versions
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50'
  };

  return (
    <div className={positionClasses[position]}>
      <Card className="w-80 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${statusColor} ${
                connectionStatus === 'connecting' ? 'animate-spin' : ''
              }`} />
              <span className={`font-semibold ${statusColor}`}>{statusText}</span>
            </div>
            <Badge 
              variant={isConnected ? 'default' : 'outline'}
              className={isConnected ? 'bg-green-500' : ''}
            >
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </div>
          
          {isConnected && stats.connectedAt && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Uptime:</span>
                <span className="font-medium">{formatUptime(stats.totalUptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Activity:</span>
                <span className="font-medium">{formatLastActivity()}</span>
              </div>
            </div>
          )}
          
          {!isConnected && stats.lastDisconnect && (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Disconnected:</span>
                <span className="font-medium">
                  {formatLastActivity()}
                </span>
              </div>
              {stats.reconnectAttempts > 0 && (
                <div className="flex items-center justify-between">
                  <span>Reconnect attempts:</span>
                  <span className="font-medium">{stats.reconnectAttempts}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            {showStats && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Activity className="h-4 w-4 mr-2" />
                {showDetails ? 'Hide Stats' : 'Show Stats'}
              </Button>
            )}
            
            {showReconnectButton && (
              <Button
                size="sm"
                variant={isConnected ? 'outline' : 'default'}
                onClick={handleReconnect}
                disabled={connectionStatus === 'connecting'}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${
                  connectionStatus === 'connecting' ? 'animate-spin' : ''
                }`} />
                {isConnected ? 'Reconnect' : 'Connect'}
              </Button>
            )}
          </div>
          
          {showDetails && showStats && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages Received:</span>
                <span className="font-medium">{stats.messagesReceived}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages Sent:</span>
                <span className="font-medium">{stats.messagesSent}</span>
              </div>
              {stats.connectedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected At:</span>
                  <span className="font-medium">
                    {stats.connectedAt.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}