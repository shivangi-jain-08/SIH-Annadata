import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Phone,
  Package
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCardStyles } from '@/utils/styles';

interface Message {
  _id: string;
  senderId: string;
  senderRole: 'consumer' | 'vendor' | 'system';
  message: string;
  messageType: 'text' | 'image' | 'location' | 'system';
  isRead: boolean;
  createdAt: string;
  senderName?: string;
}

interface OrderChatProps {
  orderId: string;
  order?: any;
  onBack?: () => void;
}

export function OrderChatComponent({ orderId, order, onBack }: OrderChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages
  const loadMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would typically call the API
      // const response = await api.get(`/orders/${orderId}/messages`);
      
      // Mock messages for development
      const mockMessages: Message[] = [
        {
          _id: '1',
          senderId: 'vendor123',
          senderRole: 'system',
          message: 'Order has been placed successfully',
          messageType: 'system',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: '2',
          senderId: 'vendor123',
          senderRole: 'vendor',
          message: 'Thank you for your order! I will start preparing it right away.',
          messageType: 'text',
          isRead: true,
          createdAt: new Date(Date.now() - 3000000).toISOString(),
          senderName: 'Fresh Produce Cart'
        },
        {
          _id: '3',
          senderId: (user as any)?._id || 'consumer123',
          senderRole: 'consumer',
          message: 'Great! How long will it take for delivery?',
          messageType: 'text',
          isRead: true,
          createdAt: new Date(Date.now() - 2400000).toISOString(),
          senderName: user?.name || 'You'
        },
        {
          _id: '4',
          senderId: 'vendor123',
          senderRole: 'vendor',
          message: 'It should be ready in about 15-20 minutes. I will deliver it to your address.',
          messageType: 'text',
          isRead: false,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          senderName: 'Fresh Produce Cart'
        }
      ];

      setMessages(mockMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // This would typically call the API
      // const response = await api.post(`/orders/${orderId}/messages`, {
      //   message: messageText,
      //   messageType: 'text'
      // });

      // Add message to local state immediately for better UX
      const tempMessage: Message = {
        _id: Date.now().toString(),
        senderId: (user as any)?._id || 'current-user',
        senderRole: (user?.role as any) || 'consumer',
        message: messageText,
        messageType: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
        senderName: user?.name || 'You'
      };

      setMessages(prev => [...prev, tempMessage]);

      // Simulate typing indicator from other party
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          // Add a mock response
          const responseMessage: Message = {
            _id: (Date.now() + 1).toString(),
            senderId: 'other-user',
            senderRole: user?.role === 'vendor' ? 'consumer' : 'vendor',
            message: 'Message received! Thank you for the update.',
            messageType: 'text',
            isRead: false,
            createdAt: new Date().toISOString(),
            senderName: user?.role === 'vendor' ? 'Customer' : 'Vendor'
          };
          setMessages(prev => [...prev, responseMessage]);
        }, 2000);
      }, 1000);

    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      // Remove the temporary message on error
      setMessages(prev => prev.filter(m => m._id !== Date.now().toString()));
    } finally {
      setSending(false);
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    // socket.emit('typing-in-order', { orderId });

    typingTimeoutRef.current = setTimeout(() => {
      // socket.emit('stop-typing-in-order', { orderId });
    }, 1000);
  };

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, [orderId]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = message.senderId === ((user as any)?._id || 'current-user');
    const isSystem = message.senderRole === 'system';

    if (isSystem) {
      return (
        <div className="flex justify-center my-4">
          <div className="px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-600 flex items-center space-x-2">
            <Package className="h-3 w-3" />
            <span>{message.message}</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          {!isOwn && (
            <p className="text-xs text-muted-foreground mb-1 px-3">
              {message.senderName || 'Other User'}
            </p>
          )}
          <div className={`px-4 py-2 rounded-lg ${
            isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm">{message.message}</p>
          </div>
          <div className={`flex items-center space-x-1 mt-1 px-3 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <p className="text-xs text-muted-foreground">
              {new Date(message.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            {isOwn && (
              <div className="flex items-center">
                {message.isRead ? (
                  <CheckCircle className="h-3 w-3 text-blue-500" />
                ) : (
                  <Clock className="h-3 w-3 text-gray-400" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle className="text-lg">
                  Order Chat #{orderId?.slice(-6)}
                </CardTitle>
                <CardDescription>
                  {order ? (
                    `${order.products?.length || 0} items • ₹${order.totalAmount || 0}`
                  ) : (
                    'Chat with the other party about this order'
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {order?.status && (
                <Badge variant="outline">
                  {order.status}
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 flex flex-col p-4 min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
                <Button size="sm" variant="outline" onClick={loadMessages} className="mt-2">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((message) => (
                <MessageBubble key={message._id} message={message} />
              ))}
              
              {/* Typing Indicator */}
              {typing && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-xs lg:max-w-md">
                    <div className="px-4 py-2 bg-gray-100 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              {sending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>
    </div>
  );
}