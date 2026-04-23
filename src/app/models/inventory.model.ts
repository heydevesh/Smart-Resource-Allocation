import { Timestamp } from '@angular/fire/firestore';

export type InventoryCategory = 'food' | 'water' | 'medical' | 'shelter' | 'other';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  description: string;
  quantity: number;
  unit: string; // e.g., 'units', 'liters', 'pallets', 'kits'
  location: string; // e.g., 'HQ Warehouse Alpha'
  locationLat?: number;
  locationLng?: number;
  qrCode?: string; // For QR code scanning and handovers
  minimumThreshold: number; // For low stock alerts
  lastUpdated: Timestamp | Date;
  status: 'optimal' | 'low' | 'critical' | 'out_of_stock';
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  timestamp: Timestamp | Date;
  performedBy: string; // User ID
  notes?: string;
  qrCodeScanned?: boolean;
}
