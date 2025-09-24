import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { 
  Leaf, 
  Bell, 
  Settings, 
  LogOut, 
  Home,
  BarChart3,
  ShoppingBag,
  Camera,
  MapPin,
  Users,
  Package
} from "lucide-react";

interface NavigationProps {
  currentRole: 'farmer' | 'vendor' | 'consumer';
  currentView: string;
  onViewChange: (view: string) => void;
  onRoleChange: () => void;
}

export function Navigation({ currentRole, currentView, onViewChange, onRoleChange }: NavigationProps) {
  const getNavItems = () => {
    switch (currentRole) {
      case 'farmer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'sensors', label: 'Sensor Data', icon: BarChart3 },
          { id: 'disease', label: 'Disease Detection', icon: Camera },
          { id: 'products', label: 'My Products', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingBag }
        ];
      case 'vendor':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'location', label: 'Location', icon: MapPin },
          { id: 'customers', label: 'Customers', icon: Users }
        ];
      case 'consumer':
        return [
          { id: 'marketplace', label: 'Marketplace', icon: Home },
          { id: 'orders', label: 'My Orders', icon: ShoppingBag },
          { id: 'vendors', label: 'Nearby Vendors', icon: MapPin },
          { id: 'favorites', label: 'Favorites', icon: Users }
        ];
      default:
        return [];
    }
  };

  const getRoleColor = () => {
    switch (currentRole) {
      case 'farmer': return 'bg-primary';
      case 'vendor': return 'bg-secondary';
      case 'consumer': return 'bg-accent';
      default: return 'bg-primary';
    }
  };

  const navItems = getNavItems();

  return (
    <motion.nav 
      className="bg-card border-b border-border shadow-sm"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Role */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">Annadata</span>
            </div>
            <Badge variant="secondary" className={`${getRoleColor()} text-white capitalize`}>
              {currentRole}
            </Badge>
          </motion.div>

          {/* Navigation Items */}
          <motion.div 
            className="hidden md:flex items-center space-x-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              >
                <Button
                  variant={currentView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className="flex items-center space-x-2 transition-all duration-200"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* User Menu */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                3
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRole}`} />
                    <AvatarFallback className={`${getRoleColor()} text-white`}>
                      {currentRole.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none capitalize">{currentRole} Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentRole}@annadata.com
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRoleChange}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Switch Role</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRoleChange}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <motion.div 
          className="md:hidden mt-4 flex space-x-2 overflow-x-auto pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </motion.div>
      </div>
    </motion.nav>
  );
}