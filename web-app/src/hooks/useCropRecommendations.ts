import { useCallback, useMemo } from 'react';
import { useApi, useMutation } from './useApi';
import ApiClient from '@/services/api';
import { CropRecommendationsResponse, DiseaseDetectionResponse, Location, ApiResponse } from '@/types/api';

// Soil Reports Hooks
export function useSoilReports(limit?: number) {
  const {
    data: soilReportsResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ApiResponse>(
    () => ApiClient.getSoilReports(limit),
    [limit],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch soil reports:', error);
      }
    }
  );

  const soilReports = useMemo(() => {
    return soilReportsResponse?.data || [];
  }, [soilReportsResponse]);

  return {
    soilReports,
    loading,
    error,
    refetch,
    retry,
  };
}

export function useLatestSoilReport() {
  const {
    data: soilReportResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ApiResponse>(
    () => ApiClient.getLatestSoilReport(),
    [],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch latest soil report:', error);
      }
    }
  );

  const soilReport = useMemo(() => {
    return soilReportResponse?.data || null;
  }, [soilReportResponse]);

  return {
    soilReport,
    loading,
    error,
    refetch,
    retry,
  };
}

// Crop Recommendations Hooks
export function useCropRecommendations(limit?: number) {
  const {
    data: recommendationsResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<CropRecommendationsResponse>(
    () => ApiClient.getCropRecommendations(limit),
    [limit],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch crop recommendations:', error);
      }
    }
  );

  const recommendations = useMemo(() => {
    return recommendationsResponse?.data?.recommendations || [];
  }, [recommendationsResponse]);

  return {
    recommendations,
    loading,
    error,
    refetch,
    retry,
  };
}

export function useLatestCropRecommendation() {
  const {
    data: recommendationResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<CropRecommendationsResponse>(
    () => ApiClient.getLatestCropRecommendation(),
    [],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch latest crop recommendation:', error);
      }
    }
  );

  const recommendation = useMemo(() => {
    return recommendationResponse?.data?.recommendation || 
           recommendationResponse?.data?.recommendations?.[0] || null;
  }, [recommendationResponse]);

  return {
    recommendation,
    loading,
    error,
    refetch,
    retry,
  };
}

// Hardware Messages Hooks
export function useHardwareMessages(limit?: number) {
  const {
    data: messagesResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ApiResponse>(
    () => ApiClient.getHardwareMessages(limit),
    [limit],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch hardware messages:', error);
      }
    }
  );

  const messages = useMemo(() => {
    return messagesResponse?.data || [];
  }, [messagesResponse]);

  return {
    messages,
    loading,
    error,
    refetch,
    retry,
  };
}

export function useLatestHardwareMessage() {
  const {
    data: messageResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ApiResponse>(
    () => ApiClient.getLatestHardwareMessage(),
    [],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch latest hardware message:', error);
      }
    }
  );

  const message = useMemo(() => {
    return messageResponse?.data || null;
  }, [messageResponse]);

  return {
    message,
    loading,
    error,
    refetch,
    retry,
  };
}

// Disease Detection Hooks
export function useDiseaseDetection() {
  const {
    mutate: detectDisease,
    data: detectionResult,
    loading: detecting,
    error: detectionError,
    reset: resetDetection,
  } = useMutation<DiseaseDetectionResponse, { 
    image: File; 
    cropType?: string; 
    location?: Location;
    onProgress?: (progress: number) => void;
  }>(
    async ({ image, cropType, location, onProgress }) => {
      return ApiClient.detectDisease(image, cropType, location, onProgress);
    },
    {
      onSuccess: (data) => {
        console.log('Disease detection completed:', data);
      },
      onError: (error) => {
        console.error('Disease detection failed:', error);
      }
    }
  );

  const report = useMemo(() => {
    return detectionResult?.data?.report || null;
  }, [detectionResult]);

  return {
    detectDisease,
    report,
    detecting,
    detectionError,
    resetDetection,
  };
}

export function useDiseaseReports(limit?: number) {
  const {
    data: reportsResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ApiResponse>(
    () => ApiClient.getDiseaseReports(limit),
    [limit],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch disease reports:', error);
      }
    }
  );

  const reports = useMemo(() => {
    return reportsResponse?.data || [];
  }, [reportsResponse]);

  return {
    reports,
    loading,
    error,
    refetch,
    retry,
  };
}

export function useDiseaseReportsByFarmer(farmerId: string) {
  const {
    data: reportsResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ApiResponse>(
    () => ApiClient.getDiseaseReportsByFarmer(farmerId),
    [farmerId],
    {
      retryCount: 2,
      onError: (error) => {
        console.error('Failed to fetch disease reports by farmer:', error);
      }
    }
  );

  const reports = useMemo(() => {
    return reportsResponse?.data || [];
  }, [reportsResponse]);

  return {
    reports,
    loading,
    error,
    refetch,
    retry,
  };
}

// Combined hook for comprehensive soil and crop data
export function useFarmAnalytics() {
  const { soilReport, loading: soilLoading, error: soilError } = useLatestSoilReport();
  const { recommendation, loading: cropLoading, error: cropError } = useLatestCropRecommendation();
  const { message: hardwareMessage, loading: hardwareLoading } = useLatestHardwareMessage();

  const loading = soilLoading || cropLoading || hardwareLoading;
  const error = soilError || cropError;

  const hasData = soilReport || recommendation || hardwareMessage;
  const needsHardwareSetup = !soilReport && !hardwareMessage;

  return {
    soilReport,
    recommendation,
    hardwareMessage,
    loading,
    error,
    hasData,
    needsHardwareSetup,
  };
}