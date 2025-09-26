import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Clock, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface PerformanceMetrics {
  connectionLatency: number;
  messageLatency: number;
  messagesPerSecond: number;
  reconnectionCount: number;
  errorCount: number;
  uptime: number;
  memoryUsage: number;
  lastMessageTime: Date | null;
}

interface LatencyMeasurement {
  timestamp: Date;
  latency: number;
  type: 'connection' | 'message';
}

export function PerformanceMonitor() {
  const { socket, isConnected, connectionStatus } = useWebSocket();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    connectionLatency: 0,
    messageLatency: 0,
    messagesPerSecond: 0,
    reconnectionCount: 0,
    errorCount: 0,
    uptime: 0,
    memoryUsage: 0,
    lastMessageTime: null
  });
  
  const [latencyHistory, setLatencyHistory] = useState<LatencyMeasurement[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const startTimeRef = useRef<Date>(new Date());
  const messageCountRef = useRef<number>(0);
  const lastSecondRef = useRef<number>(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (!socket || isMonitoring) return;
    
    setIsMonitoring(true);
    startTimeRef.current = new Date();
    messageCountRef.current = 0;
    
    // Ping interval for latency measurement
    pingIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        const pingStart = performance.now();
        socket.emit('ping', { timestamp: pingStart });
        
        socket.once('pong', (data) => {
          const latency = performance.now() - pingStart;
          
          setMetrics(prev => ({ ...prev, connectionLatency: latency }));
          setLatencyHistory(prev => [
            { timestamp: new Date(), latency, type: 'connection' },
            ...prev.slice(0, 49) // Keep last 50 measurements
          ]);
        });
      }
    }, 5000); // Ping every 5 seconds
    
    // Metrics update interval
    metricsIntervalRef.current = setInterval(() => {
      updateMetrics();
    }, 1000); // Update every second
    
    // Listen for socket events
    if (socket) {
      socket.onAny((eventName, ...args) => {
        messageCountRef.current++;
        setMetrics(prev => ({ ...prev, lastMessageTime: new Date() }));
      });
      
      socket.on('connect', () => {
        setMetrics(prev => ({ ...prev, reconnectionCount: prev.reconnectionCount + 1 }));
      });
      
      socket.on('connect_error', () => {
        setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
      });
    }
  }, [socket, isMonitoring]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
    
    if (socket) {
      socket.offAny();
    }
  }, [socket]);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    
    // Calculate messages per second
    if (currentSecond !== lastSecondRef.current) {
      const messagesThisSecond = messageCountRef.current;
      setMetrics(prev => ({ 
        ...prev, 
        messagesPerSecond: messagesThisSecond,
        uptime: (now - startTimeRef.current.getTime()) / 1000
      }));
      
      messageCountRef.current = 0;
      lastSecondRef.current = currentSecond;
    }
    
    // Update memory usage (if available)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      setMetrics(prev => ({ 
        ...prev, 
        memoryUsage: memInfo.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, []);

  // Auto-start monitoring when connected
  useEffect(() => {
    if (isConnected && !isMonitoring) {
      startMonitoring();
    } else if (!isConnected && isMonitoring) {
      stopMonitoring();
    }
  }, [isConnected, isMonitoring, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-600 bg-green-100';
    if (latency < 300) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLatencyStatus = (latency: number) => {
    if (latency < 100) return 'Excellent';
    if (latency < 300) return 'Good';
    if (latency < 500) return 'Fair';
    return 'Poor';
  };

  const averageLatency = latencyHistory.length > 0 
    ? latencyHistory.reduce((sum, item) => sum + item.latency, 0) / latencyHistory.length
    : 0;

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Performance Monitor</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={isMonitoring ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}
            >
              {isMonitoring ? 'Active' : 'Inactive'}
            </Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>
        <CardDescription>
          Real-time performance metrics for WebSocket connection
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Latency</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {metrics.connectionLatency.toFixed(0)}ms
            </p>
            <Badge 
              variant="outline" 
              className={`text-xs ${getLatencyColor(metrics.connectionLatency)}`}
            >
              {getLatencyStatus(metrics.connectionLatency)}
            </Badge>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Messages/sec</span>
            </div>
            <p className="text-lg font-bold text-green-900">
              {metrics.messagesPerSecond}
            </p>
            <p className="text-xs text-green-700">Real-time</p>
          </div>
          
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Uptime</span>
            </div>
            <p className="text-lg font-bold text-purple-900">
              {formatUptime(metrics.uptime)}
            </p>
            <p className="text-xs text-purple-700">Connected</p>
          </div>
          
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Wifi className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Status</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              {isConnected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-bold">
                {connectionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        {showDetails && (
          <div className="space-y-4">
            {/* Connection Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Reconnections</p>
                <p className="text-xl font-bold">{metrics.reconnectionCount}</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Errors</p>
                <p className="text-xl font-bold text-red-600">{metrics.errorCount}</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Memory Usage</p>
                <p className="text-xl font-bold">{metrics.memoryUsage.toFixed(1)} MB</p>
              </div>
            </div>

            {/* Latency History */}
            {latencyHistory.length > 0 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Latency Trend</span>
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Average: {averageLatency.toFixed(0)}ms</span>
                    <span>Samples: {latencyHistory.length}</span>
                  </div>
                  
                  {/* Simple latency chart */}
                  <div className="flex items-end space-x-1 h-16">
                    {latencyHistory.slice(0, 20).reverse().map((measurement, index) => {
                      const height = Math.max(4, (measurement.latency / 500) * 60); // Scale to 60px max
                      return (
                        <div
                          key={index}
                          className={`w-2 rounded-t ${getLatencyColor(measurement.latency).includes('green') ? 'bg-green-400' :
                            getLatencyColor(measurement.latency).includes('yellow') ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ height: `${height}px` }}
                          title={`${measurement.latency.toFixed(0)}ms at ${measurement.timestamp.toLocaleTimeString()}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Last Message */}
            {metrics.lastMessageTime && (
              <div className="p-3 bg-gray-50 border rounded-lg">
                <p className="text-sm text-gray-600">
                  Last message received: {metrics.lastMessageTime.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex space-x-2">
          {isMonitoring ? (
            <Button size="sm" variant="outline" onClick={stopMonitoring}>
              Stop Monitoring
            </Button>
          ) : (
            <Button size="sm" onClick={startMonitoring} disabled={!isConnected}>
              Start Monitoring
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setLatencyHistory([]);
              setMetrics({
                connectionLatency: 0,
                messageLatency: 0,
                messagesPerSecond: 0,
                reconnectionCount: 0,
                errorCount: 0,
                uptime: 0,
                memoryUsage: 0,
                lastMessageTime: null
              });
            }}
          >
            Clear History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceMonitor;