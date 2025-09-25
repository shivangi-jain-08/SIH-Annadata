import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Image as ImageIcon,
  X,
  RefreshCw
} from 'lucide-react';
import { useDiseaseDetection, useDiseaseReports } from '@/hooks/useCropRecommendations';

export function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { 
    detectDisease, 
    report, 
    detecting, 
    detectionError, 
    resetDetection 
  } = useDiseaseDetection();

  const { 
    reports, 
    loading: reportsLoading, 
    refetch: refetchReports 
  } = useDiseaseReports(5);

  const handleImageSelect = useCallback((file: File) => {
    console.log('handleImageSelect called with file:', file);
    
    if (file && file.type.startsWith('image/')) {
      console.log('Setting selected image:', file.name, file.size, file.type);
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        console.log('Image preview set');
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Invalid file type or no file:', file?.type);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDetection = async () => {
    console.log('handleDetection called, selectedImage:', selectedImage);
    
    if (!selectedImage) {
      console.error('No image selected');
      return;
    }

    try {
      console.log('Calling detectDisease with image:', selectedImage.name, selectedImage.size);
      await detectDisease({ image: selectedImage });
      await refetchReports(); // Refresh the reports list
    } catch (error) {
      console.error('Disease detection failed:', error);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    resetDetection();
  };

  const startNewDetection = () => {
    clearSelection();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Disease Detection</h1>
          <p className="text-muted-foreground">
            Upload plant images to get AI-powered disease diagnosis and treatment recommendations
          </p>
        </div>
        <Button variant="outline" onClick={() => refetchReports()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-500" />
              <span>Upload Plant Image</span>
            </CardTitle>
            <CardDescription>
              Take a clear photo of the affected plant part for accurate diagnosis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedImage ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drop your image here, or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports JPG, PNG, WebP up to 5MB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview!}
                    alt="Selected plant"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDetection} 
                    disabled={detecting}
                    className="flex-1"
                  >
                    {detecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Detect Disease
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {detectionError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {detectionError.message || 'Failed to detect disease. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Detection Results</span>
            </CardTitle>
            <CardDescription>
              AI analysis results and treatment recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detecting ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing your plant image...
                  </p>
                </div>
              </div>
            ) : report ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-800">Disease Detected</h3>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      Analyzed
                    </Badge>
                  </div>
                  <p className="text-lg font-medium text-green-900 mb-2">
                    {report.diseaseName}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Treatment Recommendations:</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      {report.treatment}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={startNewDetection} variant="outline" className="flex-1">
                    Analyze Another Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload an image to get started with disease detection</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Disease Reports</CardTitle>
          <CardDescription>
            Your latest disease detection history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{report.diseaseName}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {report.treatment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No disease reports yet. Upload your first plant image to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}