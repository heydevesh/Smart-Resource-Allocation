import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, docData, collectionData, query, where, orderBy, setDoc, updateDoc, deleteDoc, enableIndexedDbPersistence } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Need, Task, Volunteer } from '../../models';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore = inject(Firestore);

  constructor() {
    // Enable offline persistence
    enableIndexedDbPersistence(this.firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
      }
    });
  }

  // --- Needs ---
  getOpenNeeds(): Observable<Need[]> {
    const needsRef = collection(this.firestore, 'needs');
    const q = query(needsRef, where('status', '==', 'open'), orderBy('urgency', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Need[]>;
  }

  getNeedById(id: string): Observable<Need | undefined> {
    const needDoc = doc(this.firestore, `needs/${id}`);
    return docData(needDoc, { idField: 'id' }) as Observable<Need | undefined>;
  }

  async addNeed(need: Partial<Need>): Promise<void> {
    const newDocRef = doc(collection(this.firestore, 'needs'));
    const needWithId = { ...need, id: newDocRef.id };
    await setDoc(newDocRef, needWithId);
  }

  async updateNeed(id: string, data: Partial<Need>): Promise<void> {
    const needDoc = doc(this.firestore, `needs/${id}`);
    await updateDoc(needDoc, data);
  }

  // --- Tasks ---
  getActiveTasks(): Observable<Task[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('status', 'in', ['pending', 'active']));
    return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
  }

  getAllTasks(): Observable<Task[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    await updateDoc(taskDoc, data);
  }

  // --- Volunteers ---
  getAvailableVolunteers(): Observable<Volunteer[]> {
    const volunteersRef = collection(this.firestore, 'volunteers');
    const q = query(volunteersRef, where('available', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<Volunteer[]>;
  }

  getAllVolunteers(): Observable<Volunteer[]> {
    const volunteersRef = collection(this.firestore, 'volunteers');
    return collectionData(volunteersRef, { idField: 'id' }) as Observable<Volunteer[]>;
  }

  async semanticSearch(queryStr: string): Promise<Need[]> {
    // Note: To implement actual vector search from Angular, we typically call a Cloud Function
    // that uses the Vertex AI embedding model and performs the vector search,
    // because directly doing vector search in Firestore requires server-side admin SDK currently
    // or direct extensions call if exposed.
    // For now, this is a placeholder per the design.
    console.log('Semantic search requested for:', queryStr);
    return [];
  }
}
