import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveCameraCaptureProps {
  onCapture: (photoData: {
    photoId: string;
    timestamp: string;
    lat?: number;
    lng?: number;
    base64Image: string;
  }) => void;
  label: string;
  required?: boolean;
}

export default function LiveCameraCapture({ onCapture, label, required = false }: LiveCameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });
      
      setStream(mediaStream);
      setIsCapturing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
    setCapturedPhoto(null);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(base64Image);

    // Get current location and timestamp
    const timestamp = new Date().toISOString();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const photoData = {
            photoId: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            base64Image,
          };
          onCapture(photoData);
          stopCamera();
          toast({
            title: "Photo Captured",
            description: `Photo with GPS location saved at ${new Date(timestamp).toLocaleTimeString()}`,
          });
        },
        () => {
          // If location fails, still capture photo without GPS
          const photoData = {
            photoId: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp,
            base64Image,
          };
          onCapture(photoData);
          stopCamera();
          toast({
            title: "Photo Captured",
            description: `Photo saved at ${new Date(timestamp).toLocaleTimeString()} (no GPS)`,
          });
        }
      );
    }
  }, [onCapture, stopCamera, toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {!isCapturing && (
          <Button
            type="button"
            onClick={startCamera}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Take Photo
          </Button>
        )}
      </div>

      {isCapturing && (
        <Card className="p-4 bg-slate-50">
          <CardContent className="p-0">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-black rounded-lg object-cover"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-white hover:bg-gray-100 text-black border-2 border-gray-300 rounded-full w-12 h-12 flex items-center justify-center"
                >
                  <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                </Button>
                <Button
                  type="button"
                  onClick={stopCamera}
                  variant="outline"
                  className="bg-white hover:bg-gray-100 text-black border-2 border-gray-300 rounded-full w-12 h-12"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mt-2 text-center">
              Position the camera to capture {label.toLowerCase()}. 
              Photo will include timestamp and GPS location.
            </p>
          </CardContent>
        </Card>
      )}

      {capturedPhoto && (
        <Card className="p-4 bg-green-50 border-green-200">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Photo Captured Successfully</p>
                <p className="text-xs text-green-600">
                  {new Date().toLocaleString()} - With GPS location
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}