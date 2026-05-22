import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid CORS issues on preview images
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  fileName: string = 'cropped.webp'
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // set canvas size to match the bounding box
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // draw image to canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        // Convert Blob to File
        const croppedFile = new File([file], fileName, { type: 'image/webp' });
        resolve(croppedFile);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/webp', 0.9);
  });
}

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName: string;
  shape?: 'rect' | 'round';
  aspectRatio?: number;
  onCropComplete: (file: File) => void;
  onCancel: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  fileName,
  shape = 'rect',
  aspectRatio = 1,
  onCropComplete,
  onCancel
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileName);
      onCropComplete(croppedFile);
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background border border-border/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/20">
          <h3 className="font-bold text-lg">Crop & Position Image</h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative w-full h-[50vh] min-h-[300px] bg-black/90">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={shape}
            showGrid={true}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-4 space-y-4 bg-muted/10 border-t border-border/30">
          <div className="flex items-center gap-4 px-2">
            <ZoomOut size={18} className="text-muted-foreground" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
            />
            <ZoomIn size={18} className="text-muted-foreground" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-muted/40 hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : <><Check size={16} /> Apply Crop</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
