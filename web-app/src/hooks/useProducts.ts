import { useState, useCallback, useMemo } from 'react';
import { useApi, useMutation } from './useApi';
import ApiClient from '@/services/api';
import { ProductFilters, ProductsResponse, ProductData, ApiResponse } from '@/types/api';

export function useProducts(initialFilters: ProductFilters & { role?: string } = {}) {
  const [filters, setFilters] = useState<ProductFilters & { role?: string }>(initialFilters);
  
  const {
    data: productsResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ProductsResponse>(
    () => {
      if (filters.role) {
        return ApiClient.getProductsByRole(filters.role);
      }
      return ApiClient.getProducts(filters);
    },
    [filters],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch products:', error);
      }
    }
  );

  const products = useMemo(() => {
    return productsResponse?.data?.products || [];
  }, [productsResponse]);

  const pagination = useMemo(() => ({
    total: productsResponse?.data?.total || 0,
    page: productsResponse?.data?.page || 1,
    limit: productsResponse?.data?.limit || 10,
    pages: Math.ceil((productsResponse?.data?.total || 0) / (productsResponse?.data?.limit || 10))
  }), [productsResponse]);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const {
    mutate: searchProducts,
    data: searchResults,
    loading: searching,
    error: searchError,
  } = useMutation<ProductsResponse, string>(
    (query: string) => ApiClient.searchProducts(query),
    {
      onError: (error) => {
        console.error('Search failed:', error);
      }
    }
  );

  const {
    mutate: createProduct,
    loading: creating,
    error: createError,
  } = useMutation<ApiResponse, ProductData>(
    (productData: ProductData) => ApiClient.createProduct(productData),
    {
      onSuccess: () => {
        refetch(); // Refresh the products list
      },
      onError: (error) => {
        console.error('Create product failed:', error);
      }
    }
  );

  return {
    products,
    pagination,
    loading,
    error,
    retry,
    filters,
    updateFilters,
    clearFilters,
    refetch,
    searchProducts,
    searchResults: searchResults?.data?.products || [],
    searching,
    searchError,
    createProduct,
    creating,
    createError,
  };
}

export function useMyProducts() {
  const {
    data: productsResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ProductsResponse>(
    () => ApiClient.getMyProducts(),
    [],
    {
      immediate: true, // Load immediately
      retryCount: 1,
      onError: (error) => {
        console.error('Failed to fetch my products:', error);
      }
    }
  );

  const products = useMemo(() => {
    return productsResponse?.data?.products || [];
  }, [productsResponse]);

  const stats = useMemo(() => {
    const activeProducts = products.filter(p => (p as any).isActive !== false);
    const outOfStockProducts = products.filter(p => p.availableQuantity === 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.availableQuantity), 0);
    const categories = new Set(products.map(p => p.category)).size;
    
    return {
      total: products.length,
      active: activeProducts.length,
      inactive: products.length - activeProducts.length,
      outOfStock: outOfStockProducts.length,
      categories,
      totalValue,
      averagePrice: products.length > 0 ? totalValue / products.length : 0,
    };
  }, [products]);

  const {
    mutate: updateProduct,
    loading: updating,
    error: updateError,
  } = useMutation<ApiResponse, { productId: string; data: Partial<ProductData> }>(
    ({ productId, data }) => ApiClient.updateProduct(productId, data),
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error('Update product failed:', error);
      }
    }
  );

  const {
    mutate: deleteProduct,
    loading: deleting,
    error: deleteError,
  } = useMutation<ApiResponse, string>(
    (productId: string) => ApiClient.deleteProduct(productId),
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error('Delete product failed:', error);
      }
    }
  );

  return {
    products,
    stats,
    loading,
    error,
    retry,
    refetch,
    updateProduct,
    updating,
    updateError,
    deleteProduct,
    deleting,
    deleteError,
  };
}

export function useProductsByCategory(category: string) {
  const {
    data: productsResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ProductsResponse>(
    () => ApiClient.getProductsByCategory(category),
    [category],
    {
      retryCount: 2,
      onError: (error) => {
        console.error(`Failed to fetch products for category ${category}:`, error);
      }
    }
  );

  const products = useMemo(() => {
    return productsResponse?.data?.products || [];
  }, [productsResponse]);

  return {
    products,
    loading,
    error,
    retry,
    refetch,
  };
}

// New hook for product management
export function useProductManagement() {
  const {
    mutate: createProduct,
    loading: creating,
    error: createError,
    reset: resetCreate,
  } = useMutation<ApiResponse, ProductData>(
    (productData: ProductData) => ApiClient.createProduct(productData),
    {
      onSuccess: (data) => {
        console.log('Product created successfully:', data);
      },
      onError: (error) => {
        console.error('Create product failed:', error);
      }
    }
  );

  const {
    mutate: updateProduct,
    loading: updating,
    error: updateError,
    reset: resetUpdate,
  } = useMutation<ApiResponse, { productId: string; data: Partial<ProductData> }>(
    ({ productId, data }) => ApiClient.updateProduct(productId, data),
    {
      onSuccess: (data) => {
        console.log('Product updated successfully:', data);
      },
      onError: (error) => {
        console.error('Update product failed:', error);
      }
    }
  );

  const {
    mutate: deleteProduct,
    loading: deleting,
    error: deleteError,
    reset: resetDelete,
  } = useMutation<ApiResponse, string>(
    (productId: string) => ApiClient.deleteProduct(productId),
    {
      onSuccess: (data) => {
        console.log('Product deleted successfully:', data);
      },
      onError: (error) => {
        console.error('Delete product failed:', error);
      }
    }
  );

  return {
    createProduct,
    creating,
    createError,
    resetCreate,
    updateProduct,
    updating,
    updateError,
    resetUpdate,
    deleteProduct,
    deleting,
    deleteError,
    resetDelete,
  };
}