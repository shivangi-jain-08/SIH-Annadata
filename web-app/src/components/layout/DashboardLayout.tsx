import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  Home,
  BarChart3,
  ShoppingCart,
  Settings,
  Bell,
  User,
  Sprout,
  Camera,
  MapPin,
  Package,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { RealTimeConnectionManager } from '@/components/common/RealTimeConnectionManager';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
}

const getSidebarItems = (role: string): SidebarItem[] => {
  const baseItems: SidebarItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
      href: `/dashboard/${role}`,
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Analytics',
      href: `/dashboard/${role}/analytics`,
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications',
      href: `/dashboard/${role}/notifications`,
      badge: '3',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: `/dashboard/${role}/settings`,
    },
  ];

  const roleSpecificItems: Record<string, SidebarItem[]> = {
    farmer: [
      {
        icon: <Sprout className="h-5 w-5" />,
        label: 'Crop Advisory',
        href: `/dashboard/farmer/crop-advisory`,
      },
      {
        icon: <Camera className="h-5 w-5" />,
        label: 'Disease Detection',
        href: `/dashboard/farmer/disease-detection`,
      },
      {
        icon: <Package className="h-5 w-5" />,
        label: 'My Products',
        href: `/dashboard/farmer/products`,
      },
      {
        icon: <ShoppingCart className="h-5 w-5" />,
        label: 'Orders',
        href: `/dashboard/farmer/orders`,
        badge: '2',
      },
    ],
    vendor: [
      {
        icon: <ShoppingCart className="h-5 w-5" />,
        label: 'Buy from Farmers',
        href: `/dashboard/vendor/buy`,
      },
      {
        icon: <Package className="h-5 w-5" />,
        label: 'My Inventory',
        href: `/dashboard/vendor/inventory`,
      },
      {
        icon: <Users className="h-5 w-5" />,
        label: 'Sell to Consumers',
        href: `/dashboard/vendor/sell`,
      },
      {
        icon: <MapPin className="h-5 w-5" />,
        label: 'Location Services',
        href: `/dashboard/vendor/location`,
      },
      {
        icon: <TrendingUp className="h-5 w-5" />,
        label: 'Sales',
        href: `/dashboard/vendor/sales`,
      },
    ],
    consumer: [
      {
        icon: <ShoppingCart className="h-5 w-5" />,
        label: 'Browse Products',
        href: `/dashboard/consumer/browse`,
      },
      {
        icon: <MapPin className="h-5 w-5" />,
        label: 'Nearby Vendors',
        href: `/dashboard/consumer/vendors`,
      },
      {
        icon: <Package className="h-5 w-5" />,
        label: 'My Orders',
        href: `/dashboard/consumer/orders`,
        badge: '1',
      },
      {
        icon: <MessageSquare className="h-5 w-5" />,
        label: 'Reviews',
        href: `/dashboard/consumer/reviews`,
      },
    ],
  };

  return [
    ...baseItems.slice(0, 1), // Dashboard
    ...(roleSpecificItems[role] || []),
    ...baseItems.slice(1), // Analytics, Notifications, Settings
  ];
};

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <div>Loading...</div>;
  }

  const sidebarItems = getSidebarItems(user.role);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-orange-100 text-orange-800';
      case 'consumer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Annadata</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h1 className="text-xl font-semibold text-gray-900">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="dashboard-main py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Real-time Connection Manager */}
      <RealTimeConnectionManager 
        position="bottom-right"
        showStats={true}
        showReconnectButton={true}
      />
    </div>
  );
}