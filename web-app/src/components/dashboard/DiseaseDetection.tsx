import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  FileText,
  Calendar,
  RefreshCw,
  X,
  Info,
  Shield,
  Zap
} from 'lucide-react';
import { useDiseaseDetection, useDiseaseReports } from '@/hooks/useCropRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { getCardStyles, getStatusColor } from '@/utils/styles';

export function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropType, setCropType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    detectDisease, 
    report: analysisResult, 
    detecting: isAnalyzing, 
    detectionError, 
    resetDetection 
  } = useDiseaseDetection();
  
  const { 
    reports, 
    loading: reportsLoading, 
    error: reportsError,
    refetch: refetchReports,
    retry: retryReports
  } = useDiseaseReports(5);
  
  const { user } = useAuth();
  const { isConnected } = useWebSocket();

  const validateImageFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }
    
    if (file.size > maxSize) {
      return 'Image size must be less than 10MB';
    }
    
    return null;
  };

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }

      setSelectedImage(file);
      resetDetection();
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [resetDetection]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) {
      return;
    }

    try {
      const location = user?.location ? {
        longitude: user.location.coordinates[0],
        latitude: user.location.coordinates[1]
      } : undefined;

      await detectDisease({
        image: selectedImage,
        cropType: cropType || undefined,
        location,
        onProgress: setUploadProgress
      });

      // Refresh reports list after successful detection
      refetchReports();
    } catch (error) {
      console.error('Disease detection failed:', error);
    }
  }, [selectedImage, cropType, user?.location, detectDisease, refetchReports]);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setCropType('');
    setUploadProgress(0);
    resetDetection();
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetDetection]);

  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <span>Disease Detection</span>
            {isConnected ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600">Offline</span>
              </div>
            )}
          </h2>
          <p className="text-muted-foreground">
            Upload plant images to get AI-powered disease diagnosis and treatment recommendations
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={refetchReports}
          disabled={reportsLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload and Analysis */}
        <Card className={getCardStyles('base')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-500" />
              <span>Upload Plant Image</span>
            </CardTitle>
            <CardDescription>
              Take a clear photo of the affected plant or upload from your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={!imagePreview ? handleFileInputClick : undefined}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Selected plant"
                      className="max-w-full h-48 object-contain mx-auto rounded-lg"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleReset}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2 justify-center">
                    <Button size="sm" variant="outline" onClick={handleFileInputClick}>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium">Upload plant image</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                  <Button size="sm" type="button">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Upload Progress */}
            {isAnalyzing && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Crop Type Input */}
            <div className="space-y-2">
              <Label htmlFor="crop-type">Crop Type (Optional)</Label>
              <Input
                id="crop-type"
                placeholder="e.g., Tomato, Wheat, Rice"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Specifying crop type helps improve accuracy
              </p>
            </div>

            {/* Error Display */}
            {detectionError && (
              <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span>{detectionError.message}</span>
                  {detectionError.canRetry && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 ml-0"
                      onClick={handleAnalyze}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Tips for better results:</p>
                  <ul className="text-xs space-y-1 text-blue-700">
                    <li>• Take photos in good lighting</li>
                    <li>• Focus on affected areas of the plant</li>
                    <li>• Avoid blurry or distant shots</li>
                    <li>• Include leaves, stems, or fruits showing symptoms</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Analyze Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className={getCardStyles('base')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <span>Analysis Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-sm text-muted-foreground mb-2">
                  Analyzing your plant image...
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-4">
                {/* Disease Detection Result */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-800">
                        {analysisResult.diseaseName ? 
                          `Disease Detected: ${analysisResult.diseaseName}` : 
                          'Analysis Complete'
                        }
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Analysis completed successfully
                      </p>
                      {analysisResult.severity && (
                        <Badge 
                          className={`mt-2 ${getStatusColor(analysisResult.severity)}`}
                        >
                          {analysisResult.severity} severity
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confidence Level */}
                {analysisResult.confidence && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Confidence Level</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full">
                        <div 
                          className={`h-3 rounded-full ${
                            analysisResult.confidence >= 80 ? 'bg-green-500' :
                            analysisResult.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${analysisResult.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold min-w-[3rem]">
                        {analysisResult.confidence}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Treatment Recommendations */}
                {analysisResult.treatments && analysisResult.treatments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Treatment Recommendations</span>
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.treatments.map((treatment: any, index: number) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-green-800">{treatment.method}</p>
                              <p className="text-sm text-green-700 mt-1">{treatment.description}</p>
                            </div>
                            {treatment.urgency && (
                              <Badge 
                                variant={treatment.urgency === 'high' ? 'destructive' : 'outline'}
                                className="ml-2"
                              >
                                {treatment.urgency}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention Tips */}
                {analysisResult.preventionTips && analysisResult.preventionTips.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Prevention Tips</h4>
                    <ul className="space-y-1">
                      {analysisResult.preventionTips.map((tip: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={handleReset}>
                    Analyze Another Image
                  </Button>
                  <Button size="sm" variant="outline" onClick={refetchReports}>
                    View All Reports
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload an image to start disease detection
                </p>
                <p className="text-xs text-muted-foreground">
                  Our AI will analyze your plant and provide treatment recommendations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className={getCardStyles('base')}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span>Recent Disease Reports</span>
            </div>
            {reportsError && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={retryReports || undefined}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Your latest disease detection history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsError && (
            <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 mb-4">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Failed to load reports: {reportsError.message}</span>
            </div>
          )}
          
          {reportsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report: any, index: number) => (
                <div key={report._id || index} className={`${getCardStyles('hover')} p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        report.severity === 'high' ? 'bg-red-100' :
                        report.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          report.severity === 'high' ? 'text-red-600' :
                          report.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-sm">
                            {report.diseaseName || 'Disease Analysis'}
                          </p>
                          {report.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {report.confidence}% confidence
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()} • {report.cropType || 'Unknown crop'}
                        </p>
                        {report.treatments && report.treatments.length > 0 && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            Treatment: {report.treatments[0].method}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full">
                View All Reports ({reports.length}+)
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No disease reports yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start by analyzing your first plant image to build your detection history
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}