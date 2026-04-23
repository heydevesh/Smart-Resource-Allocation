import { Injectable, inject, signal } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from '@angular/fire/storage';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'error';
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_MB = 5;

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);

  uploadProgress = signal<UploadProgress | null>(null);

  /** Upload a file with progress tracking */
  async uploadFile(file: File, path: string, onProgress?: (progress: UploadProgress) => void): Promise<string> {
    const storageRef = ref(this.storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            state: snapshot.state as UploadProgress['state']
          };
          this.uploadProgress.set(progress);
          onProgress?.(progress);
        },
        (error) => {
          this.uploadProgress.set({
            bytesTransferred: 0,
            totalBytes: 0,
            percentage: 0,
            state: 'error'
          });
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          this.uploadProgress.set({
            bytesTransferred: uploadTask.snapshot.totalBytes,
            totalBytes: uploadTask.snapshot.totalBytes,
            percentage: 100,
            state: 'success'
          });
          resolve(url);
        }
      );
    });
  }

  /** Upload a photo with image-specific validation */
  async uploadPhoto(file: File, path: string): Promise<string> {
    this.validateImage(file);
    return this.uploadFile(file, path);
  }

  /** Upload a document (PDF, image) with validation */
  async uploadDocument(file: File, path: string): Promise<string> {
    this.validateDocument(file);
    return this.uploadFile(file, path);
  }

  /** Delete a file by its storage path */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (e: any) {
      // Ignore 'object-not-found' — file may already have been deleted
      if (e.code !== 'storage/object-not-found') {
        throw e;
      }
    }
  }

  /** Delete a file by its download URL */
  async deleteByUrl(url: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, url);
      await deleteObject(storageRef);
    } catch (e: any) {
      if (e.code !== 'storage/object-not-found') {
        throw e;
      }
    }
  }

  /** List all files in a directory */
  async listFiles(directoryPath: string): Promise<string[]> {
    const dirRef = ref(this.storage, directoryPath);
    const result = await listAll(dirRef);
    const urls: string[] = [];
    for (const item of result.items) {
      urls.push(await getDownloadURL(item));
    }
    return urls;
  }

  /** Generate a unique file path for uploads */
  generatePath(folder: string, userId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${folder}/${userId}/${timestamp}_${sanitized}`;
  }

  /** Validate image file type and size */
  private validateImage(file: File): void {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Invalid image type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      throw new Error(`Image too large. Maximum size: ${MAX_IMAGE_SIZE_MB}MB`);
    }
  }

  /** Validate document file type and size */
  private validateDocument(file: File): void {
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      throw new Error(`Invalid document type: ${file.type}. Allowed: ${ALLOWED_DOC_TYPES.join(', ')}`);
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      throw new Error(`Document too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`);
    }
  }
}
