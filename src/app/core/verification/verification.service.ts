import { Injectable, inject, signal } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

export interface CloudVisionFaceResult {
  faceDetected: boolean;
  faceCount: number;
  confidence: number;
  isBlurred: boolean;
  hasHeadwear: boolean;
}

export interface FaceMatchResult {
  matched: boolean;
  distance: number;
  confidence: number;
  selfieDetected: boolean;
  aadhaarFaceDetected: boolean;
  visionApiUsed: boolean;
  visionResult?: CloudVisionFaceResult;
}

export interface AadhaarOcrResult {
  extractedText: string;
  aadhaarNumber: string | null;
  dob: string | null;
  gender: string | null;
  confidence: number;
}

@Injectable({ providedIn: 'root' })
export class VerificationService {
  private fns = inject(Functions);
  loading = signal(false);
  status = signal('');

  // ─── Cloud Vision API (free 1000/month) ───
  async detectFaceWithVision(imageBase64: string): Promise<CloudVisionFaceResult> {
    this.status.set('Running Cloud Vision face detection...');
    try {
      const callable = httpsCallable<{ imageBase64: string }, CloudVisionFaceResult>(
        this.fns, 'DetectFace'
      );
      const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const result = await callable({ imageBase64: base64 });
      return result.data;
    } catch (e) {
      console.warn('Cloud Vision API unavailable, falling back:', e);
      return { faceDetected: true, faceCount: 1, confidence: 0, isBlurred: false, hasHeadwear: false };
    }
  }

  // ─── Verification using Gemini Cloud Function ───
  async verifyFaceMatch(aadhaarImageSrc: string, selfieImageSrc: string): Promise<FaceMatchResult> {
    this.loading.set(true);
    this.status.set('Matching faces with Gemini...');
    try {
      const callable = httpsCallable<any, any>(this.fns, 'VerifyKYC');
      const result = await callable({
        aadhaarImageBase64: aadhaarImageSrc,
        selfieImageBase64: selfieImageSrc
      });

      const res = result.data;
      this.status.set(res.faceMatched ? 'Face matched!' : 'Face mismatch.');
      
      return {
        matched: res.faceMatched,
        distance: 1 - (res.confidence / 100),
        confidence: res.confidence,
        selfieDetected: true,
        aadhaarFaceDetected: true,
        visionApiUsed: false
      };
    } catch (e: any) {
      console.error('VerifyKYC failed:', e);
      this.status.set(`Verification failed: ${e.message || 'Server error'}`);
      return {
        matched: false, distance: 1, confidence: 0,
        selfieDetected: false, aadhaarFaceDetected: false,
        visionApiUsed: false
      };
    } finally {
      this.loading.set(false);
    }
  }

  // ─── OCR using Gemini Cloud Function ───
  async ocrAadhaarCard(imageFile: File): Promise<AadhaarOcrResult> {
    this.status.set('Reading Aadhaar card (OCR)...');
    try {
      const base64 = await this.fileToDataUrl(imageFile);
      const callable = httpsCallable<any, any>(this.fns, 'OcrAadhaar');
      const result = await callable({ imageBase64: base64 });
      
      const res = result.data;
      this.status.set('OCR complete.');
      return {
        extractedText: '',
        aadhaarNumber: res.aadhaarNumber,
        dob: res.dob,
        gender: res.gender,
        confidence: 99
      };
    } catch (e: any) {
      console.error('OcrAadhaar failed:', e);
      this.status.set(`OCR failed: ${e.message || 'Server error'}`);
      return {
        extractedText: '',
        aadhaarNumber: null,
        dob: null,
        gender: null,
        confidence: 0
      };
    }
  }

  // ─── Helpers ───
  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

