// Validation utilities for forms and data

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  availableQuantity: string;
  minimumOrderQuantity: string;
  isActive: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

// Product validation
export function validateProduct(data: ProductFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Product name is required';
  } else if (data.name.length > 200) {
    errors.name = 'Product name cannot exceed 200 characters';
  } else if (data.name.length < 2) {
    errors.name = 'Product name must be at least 2 characters';
  }

  // Description validation
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters';
  }

  // Category validation
  const validCategories = ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'herbs', 'dairy', 'other'];
  if (!validCategories.includes(data.category)) {
    errors.category = 'Please select a valid category';
  }

  // Price validation
  const price = parseFloat(data.price);
  if (!data.price || isNaN(price)) {
    errors.price = 'Price is required and must be a number';
  } else if (price <= 0) {
    errors.price = 'Price must be greater than 0';
  } else if (price > 100000) {
    errors.price = 'Price cannot exceed ₹100,000';
  }

  // Unit validation
  const validUnits = ['kg', 'gram', 'ton', 'piece', 'dozen', 'liter', 'bundle'];
  if (!validUnits.includes(data.unit)) {
    errors.unit = 'Please select a valid unit';
  }

  // Available quantity validation
  const availableQuantity = parseFloat(data.availableQuantity);
  if (!data.availableQuantity || isNaN(availableQuantity)) {
    errors.availableQuantity = 'Available quantity is required and must be a number';
  } else if (availableQuantity < 0) {
    errors.availableQuantity = 'Available quantity cannot be negative';
  } else if (availableQuantity > 1000000) {
    errors.availableQuantity = 'Available quantity seems too large';
  }

  // Minimum order quantity validation
  const minimumOrderQuantity = parseFloat(data.minimumOrderQuantity);
  if (!data.minimumOrderQuantity || isNaN(minimumOrderQuantity)) {
    errors.minimumOrderQuantity = 'Minimum order quantity is required and must be a number';
  } else if (minimumOrderQuantity < 1) {
    errors.minimumOrderQuantity = 'Minimum order quantity must be at least 1';
  } else if (minimumOrderQuantity > availableQuantity) {
    errors.minimumOrderQuantity = 'Minimum order quantity cannot exceed available quantity';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Location validation
export function validateLocation(location: LocationData): ValidationResult {
  const errors: Record<string, string> = {};

  if (typeof location.latitude !== 'number' || isNaN(location.latitude)) {
    errors.latitude = 'Latitude must be a valid number';
  } else if (location.latitude < -90 || location.latitude > 90) {
    errors.latitude = 'Latitude must be between -90 and 90 degrees';
  }

  if (typeof location.longitude !== 'number' || isNaN(location.longitude)) {
    errors.longitude = 'Longitude must be a valid number';
  } else if (location.longitude < -180 || location.longitude > 180) {
    errors.longitude = 'Longitude must be between -180 and 180 degrees';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Indian format)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  } else if (password.length > 128) {
    errors.password = 'Password cannot exceed 128 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// File validation for image uploads
export function validateImageFile(file: File): ValidationResult {
  const errors: Record<string, string> = {};

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    errors.type = 'Only JPEG, PNG, and WebP images are allowed';
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.size = 'Image size cannot exceed 5MB';
  }

  // Check file name
  if (file.name.length > 255) {
    errors.name = 'File name is too long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Delivery address validation
export function validateDeliveryAddress(address: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!address.trim()) {
    errors.address = 'Delivery address is required';
  } else if (address.length < 10) {
    errors.address = 'Please provide a more detailed address';
  } else if (address.length > 500) {
    errors.address = 'Address cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Order quantity validation
export function validateOrderQuantity(
  quantity: number, 
  availableQuantity: number, 
  minimumOrderQuantity: number
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!quantity || quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  } else if (quantity < minimumOrderQuantity) {
    errors.quantity = `Minimum order quantity is ${minimumOrderQuantity}`;
  } else if (quantity > availableQuantity) {
    errors.quantity = `Only ${availableQuantity} units available`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Delivery radius validation
export function validateDeliveryRadius(radius: number): ValidationResult {
  const errors: Record<string, string> = {};

  if (!radius || radius <= 0) {
    errors.radius = 'Delivery radius must be greater than 0';
  } else if (radius < 100) {
    errors.radius = 'Minimum delivery radius is 100 meters';
  } else if (radius > 10000) {
    errors.radius = 'Maximum delivery radius is 10 kilometers';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Generic form validation helper
export function validateForm<T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => ValidationResult>
): ValidationResult {
  const allErrors: Record<string, string> = {};

  Object.keys(validators).forEach(key => {
    const validator = validators[key];
    const result = validator(data[key]);
    
    if (!result.isValid) {
      Object.assign(allErrors, result.errors);
    }
  });

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors
  };
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Format error messages for display
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  return 'An unexpected error occurred';
}

// Check if error is a network error
export function isNetworkError(error: any): boolean {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('fetch') ||
    !navigator.onLine
  );
}

// Check if error is a validation error
export function isValidationError(error: any): boolean {
  return (
    error?.status === 400 ||
    error?.response?.status === 400 ||
    error?.code === 'VALIDATION_ERROR'
  );
}

// Check if error is an authentication error
export function isAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.response?.status === 401 ||
    error?.code === 'UNAUTHORIZED'
  );
}