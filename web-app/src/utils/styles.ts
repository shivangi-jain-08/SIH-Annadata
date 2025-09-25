import { cn } from './cn';

// Standardized component styles for consistency across the application
export const componentStyles = {
  // Card styles
  card: {
    base: "bg-white rounded-lg shadow-sm border transition-shadow duration-200",
    hover: "hover:shadow-md",
    interactive: "cursor-pointer hover:shadow-md hover:border-primary/20",
    padding: {
      sm: "p-4",
      md: "p-6", 
      lg: "p-8"
    }
  },

  // Button styles
  button: {
    base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    sizes: {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-8",
      icon: "h-10 w-10"
    },
    variants: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "underline-offset-4 hover:underline text-primary"
    }
  },

  // Input styles
  input: {
    base: "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    error: "border-destructive focus-visible:ring-destructive"
  },

  // Badge styles
  badge: {
    base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variants: {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground"
    }
  },

  // Layout styles
  layout: {
    container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
    section: "py-8 lg:py-12",
    grid: {
      cols1: "grid grid-cols-1 gap-6",
      cols2: "grid grid-cols-1 md:grid-cols-2 gap-6",
      cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    }
  },

  // Dashboard specific styles
  dashboard: {
    statsCard: "bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow",
    quickAction: "p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group",
    welcomeSection: "rounded-lg p-6 text-white mb-6",
    sidebarItem: "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors"
  },

  // Status colors
  status: {
    success: "text-green-600 bg-green-100",
    warning: "text-yellow-600 bg-yellow-100", 
    error: "text-red-600 bg-red-100",
    info: "text-blue-600 bg-blue-100",
    pending: "text-orange-600 bg-orange-100"
  },

  // Role colors
  role: {
    farmer: "bg-green-100 text-green-800",
    vendor: "bg-orange-100 text-orange-800", 
    consumer: "bg-blue-100 text-blue-800"
  }
};

// Helper functions for applying styles
export const getCardStyles = (variant: 'base' | 'hover' | 'interactive' = 'base', padding: 'sm' | 'md' | 'lg' = 'md') => {
  return cn(
    componentStyles.card.base,
    componentStyles.card[variant],
    componentStyles.card.padding[padding]
  );
};

export const getButtonStyles = (variant: keyof typeof componentStyles.button.variants = 'default', size: keyof typeof componentStyles.button.sizes = 'md') => {
  return cn(
    componentStyles.button.base,
    componentStyles.button.variants[variant],
    componentStyles.button.sizes[size]
  );
};

export const getBadgeStyles = (variant: keyof typeof componentStyles.badge.variants = 'default') => {
  return cn(
    componentStyles.badge.base,
    componentStyles.badge.variants[variant]
  );
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'farmer': return componentStyles.role.farmer;
    case 'vendor': return componentStyles.role.vendor;
    case 'consumer': return componentStyles.role.consumer;
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
    case 'active':
      return { bg: 'bg-green-100', text: 'text-green-600' };
    case 'pending':
    case 'processing':
      return { bg: 'bg-orange-100', text: 'text-orange-600' };
    case 'cancelled':
    case 'failed':
    case 'error':
      return { bg: 'bg-red-100', text: 'text-red-600' };
    case 'warning':
      return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-600' };
  }
};