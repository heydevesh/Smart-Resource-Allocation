import { Injectable, inject } from '@angular/core';
import { FirestoreService } from '../firebase/firestore.service';
import { StorageService } from '../firebase/storage.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { Ngo, NgoMembership, NgoDocument, NgoStatus } from '../../models';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Service to manage the NGO lifecycle: registration, document submission,
 * and membership administration.
 */
@Injectable({ providedIn: 'root' })
export class NgoRegistryService {
  private firestore = inject(FirestoreService);
  private storage = inject(StorageService);
  private errorHandler = inject(ErrorHandlerService);
  private auth = inject(AuthService);

  /**
   * Register a new NGO on the platform.
   * This involves creating the NGO document and a founder membership.
   */
  async registerNgo(
    ngoData: Partial<Ngo>, 
    documents: { file: File, type: NgoDocument['type'] }[],
    logoFile?: File
  ): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Unauthenticated');

    try {
      // 1. Check for registration number collision (if provided)
      if (ngoData.registrationNumber) {
        const existing = await firstValueFrom(this.firestore.getNgos());
        if (existing.find(n => n.registrationNumber === ngoData.registrationNumber)) {
          throw new Error('An NGO with this registration number already exists');
        }
      }

      // 2. Initial NGO document creation to get ID
      const ngoId = await this.firestore.addNgo({
        ...ngoData,
        founderId: user.uid,
        memberIds: [user.uid],
        status: 'pending_review' as NgoStatus
      });

      // 3. Upload documents
      const uploadedDocs: NgoDocument[] = [];
      for (const doc of documents) {
        const path = `ngos/${ngoId}/legal/${doc.type}_${Date.now()}`;
        const url = await this.storage.uploadFile(doc.file, path);
        
        uploadedDocs.push({
          type: doc.type,
          url,
          fileName: doc.file.name,
          uploadedAt: new Date(),
          verified: false
        });
      }

      // 4. Update NGO with document URLs and Logo
      let logoUrl = '';
      if (logoFile) {
        const logoPath = `ngos/${ngoId}/branding/logo_${Date.now()}`;
        logoUrl = await this.storage.uploadFile(logoFile, logoPath);
      }

      await this.firestore.updateNgo(ngoId, { 
        documents: uploadedDocs,
        logoUrl: logoUrl || undefined
      });

      // 5. Create membership
      await this.firestore.addNgoMember({
        ngoId,
        userId: user.uid,
        role: 'founder',
        isActive: true
      });

      // 6. Update user role to ngo_founder/ngo_admin if not already (logic in auth service usually)
      // This might require a Cloud Function for security, but we'll assume the 
      // signup flow handles user metadata.

      this.errorHandler.handleSuccess('NGO registration submitted for review');
      return ngoId;
    } catch (error) {
      this.errorHandler.handleError(error, 'NGO Registration');
      throw error;
    }
  }

  /** Get all NGOs for superadmin view */
  getAllNgos(): Observable<Ngo[]> {
    return this.firestore.getNgos();
  }

  /** Get active NGOs for directory/map */
  getActiveNgos(): Observable<Ngo[]> {
    return this.firestore.getActiveNgos();
  }

  /** Get NGO by ID */
  getNgo(id: string): Observable<Ngo | undefined> {
    return this.firestore.getNgoById(id);
  }

  /** Update NGO profile */
  async updateProfile(id: string, data: Partial<Ngo>): Promise<void> {
    try {
      await this.firestore.updateNgo(id, data);
      this.errorHandler.handleSuccess('Profile updated');
    } catch (error) {
      this.errorHandler.handleError(error, 'Update Profile');
    }
  }

  /** Approve an NGO (Super Admin only) */
  async approveNgo(id: string): Promise<void> {
    const admin = this.auth.currentUser;
    if (!admin) return;

    try {
      await this.firestore.approveNgo(id, admin.uid);
      this.errorHandler.handleSuccess('NGO approved successfully');
    } catch (error) {
      this.errorHandler.handleError(error, 'NGO Approval');
    }
  }

  /** Get members of an NGO */
  getMembers(ngoId: string): Observable<NgoMembership[]> {
    return this.firestore.getNgoMembers(ngoId);
  }
}
