# Error Handling

Comprehensive guide for handling API errors.

## Error Response Format

All API errors return consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Frontend Error Handler

```javascript
// errorHandler.js
export const handleApiError = (error, response = null) => {
  console.error('API Error:', error);

  // Check response status
  if (response) {
    switch (response.status) {
      case 400:
        alert('Invalid request. Please check your input.');
        break;
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;
      case 403:
        alert('Access denied. You do not have permission for this action.');
        break;
      case 404:
        alert('Resource not found.');
        break;
      case 500:
        alert('Server error. Please try again later.');
        break;
      default:
        alert(error.message || 'An unexpected error occurred.');
    }
  } else {
    // Network or other errors
    if (error.message.includes('Failed to fetch')) {
      alert('Network error. Please check your connection.');
    } else {
      alert(error.message || 'An unexpected error occurred.');
    }
  }
};
```

## API Client with Error Handling

```javascript
class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const result = await response.json();
      
      if (!result.success) {
        const error = new Error(result.message || 'API request failed');
        error.status = response.status;
        error.errors = result.errors;
        throw error;
      }
      
      return result.data;
    } catch (error) {
      // Handle different error types
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      handleApiError(error);
      throw error;
    }
  }
}
```

## React Error Boundary

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Validation Errors

Handle validation errors from forms:

```javascript
const handleValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    // Show all validation errors
    const errorMessage = errors.join('\n');
    alert(errorMessage);
  } else if (typeof errors === 'object') {
    // Handle field-specific errors
    Object.keys(errors).forEach(field => {
      const fieldElement = document.querySelector(`[name="${field}"]`);
      if (fieldElement) {
        fieldElement.classList.add('error');
        // Show error message near field
      }
    });
  }
};
```

## Retry Logic

```javascript
const apiCallWithRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error; // Last attempt failed
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Usage
const getProducts = () => apiCallWithRetry(() => ApiClient.getProducts());
```

## React Hook for Error Handling

```javascript
import { useState } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsync = async (asyncFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err.message);
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { error, loading, handleAsync, clearError };
};

// Usage in component
const MyComponent = () => {
  const { error, loading, handleAsync } = useErrorHandler();

  const loadData = () => {
    handleAsync(async () => {
      const data = await ApiClient.getProducts();
      // Handle success
    });
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}
      <button onClick={loadData}>Load Data</button>
    </div>
  );
};
```

## Toast Notifications

```javascript
// toast.js
export const showToast = (message, type = 'info') => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};

// Usage
export const handleApiError = (error) => {
  if (error.status === 401) {
    showToast('Session expired. Please login again.', 'error');
    // Redirect to login
  } else {
    showToast(error.message, 'error');
  }
};
```

## React Native Error Handling

```javascript
import { Alert } from 'react-native';

export const handleApiError = (error) => {
  if (error.status === 401) {
    Alert.alert(
      'Session Expired',
      'Please login again.',
      [{ text: 'OK', onPress: () => navigateToLogin() }]
    );
  } else {
    Alert.alert('Error', error.message);
  }
};
```