import { useState } from 'react';
import { toast } from 'sonner';

export const useCloudinary = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMedia = async (file: File): Promise<{ secureUrl: string, publicId: string, resourceType: 'image' | 'video' | 'raw' }> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const msg = "Cloudinary config missing (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET). Check .env";
      toast.error(msg);
      throw new Error(msg);
    }

    setIsUploading(true);
    setProgress(0);

    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            secureUrl: response.secure_url,
            publicId: response.public_id,
            resourceType: response.resource_type
          });
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            const errMsg = errorResponse.error?.message || "Upload failed";
            toast.error(`Upload Error: ${errMsg}`);
            reject(new Error(errMsg));
          } catch (e) {
            toast.error("Upload failed with unknown error.");
            reject(new Error("Upload failed"));
          }
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error("Network error during upload");
        reject(new Error("Network error"));
      };

      xhr.send(formData);
    });
  };

  return { uploadMedia, isUploading, progress };
};
