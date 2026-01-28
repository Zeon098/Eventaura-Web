/**
 * Cloudinary image upload service
 */
import { Cloudinary } from 'cloudinary-core';
import { logError } from '../../utils/errorHandlers';

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;
  private cloudinary: Cloudinary;

  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!this.cloudName || !this.uploadPreset) {
      throw new Error(
        'Cloudinary configuration missing. Ensure CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET are set.'
      );
    }

    this.cloudinary = new Cloudinary({ cloud_name: this.cloudName });
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(
    file: File,
    folder: string = 'eventaura',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });
    } catch (error) {
      logError(error, 'uploadImage');
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(
    files: File[],
    folder: string = 'eventaura',
    onProgress?: (index: number, progress: number) => void
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadImage(file, folder, (progress) => {
          onProgress?.(index, progress);
        })
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      logError(error, 'uploadImages');
      throw error;
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  getOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale';
      quality?: number;
    }
  ): string {
    const { width, height, crop = 'fill', quality = 80 } = options || {};

    const transformations: Record<string, string | number> = {
      crop,
      quality,
    };

    if (width) transformations.width = width;
    if (height) transformations.height = height;

    return this.cloudinary.url(publicId, transformations);
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();
