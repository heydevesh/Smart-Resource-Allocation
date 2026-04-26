import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { inject } from '@angular/core';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { InventoryItem, InventoryTransaction } from '../../models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-resource-vault',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <p class="subtitle">Central Node • Mumbai</p>
        <h1 class="title">Resource Vault</h1>
      </div>
      @if (auth.hasPermission('request_inventory')) {
        <button mat-flat-button class="request-btn" (click)="scanQRCode()">
          <mat-icon fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">qr_code_scanner</mat-icon>
          Scan Handover
        </button>
      }
    </div>

    <div class="grid-layout">
      <!-- Forecast Alert -->
      <div class="alert-card">
        <div class="alert-content">
          <div class="icon-wrapper">
            <mat-icon fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">auto_awesome</mat-icon>
          </div>
          <div>
            <h3>Forecast Alert: Monsoon Surge</h3>
            <p>Predictive models indicate a 40% spike in demand for Shelter Kits and Water Purification in Sector 4 within 72 hours.</p>
          </div>
        </div>
        @if (auth.hasPermission('manage_inventory')) {
          <button class="review-btn">Review Allocation</button>
        }
      </div>

      <!-- Main Column -->
      <div class="main-column">
        <!-- Critical Stock -->
        @if (criticalItems$ | async; as criticalItems) {
          @if (criticalItems.length > 0) {
            <div class="stock-card critical">
              <div class="stock-header">
                <div>
                  <div class="title-row">
                    <h2>{{criticalItems[0].name}}</h2>
                    <span class="badge">Critical Stock</span>
                  </div>
                  <p>{{criticalItems[0].description}}</p>
                </div>
                <div class="percentage">
                  <span class="value">{{getPercentage(criticalItems[0])}}%</span>
                  <span class="label">Capacity</span>
                </div>
              </div>
              <div class="progress-bar">
                <div class="fill" [style.width.%]="getPercentage(criticalItems[0])"></div>
              </div>
              <div class="stock-footer">
                <span>Available: <strong>{{criticalItems[0].quantity}}</strong> {{criticalItems[0].unit}}</span>
                <span class="target">Target: {{getTarget(criticalItems[0])}} {{criticalItems[0].unit}}</span>
              </div>
            </div>
          }
        }

        <!-- Grid of standard items -->
        <div class="item-grid">
          @for (item of inventoryItems$ | async; track item.id) {
            <div class="item-card" [class.warning]="item.status === 'low'">
              <div class="item-info">
                <div class="title-row">
                  <h3>{{item.name}}</h3>
                  @if (item.status === 'low') {
                    <mat-icon fontSet="material-symbols-rounded">warning</mat-icon>
                  }
                </div>
                <p>{{item.description}}</p>
              </div>
              <div class="item-stats">
                <div class="stat-row">
                  <span class="value" [class.warn]="item.status === 'low'">{{getPercentage(item)}}%</span>
                  <span class="count">{{item.quantity}} <small>{{item.unit}}</small></span>
                </div>
                <div class="progress-bar mini">
                  <div class="fill" [class.warn]="item.status === 'low'" [style.width.%]="getPercentage(item)"></div>
                </div>
              </div>
            </div>
          }

          @if ((inventoryItems$ | async)?.length === 0) {
            <div class="item-card">
              <div class="item-info">
                <h3>No Inventory</h3>
                <p>Add resources to track stock.</p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Side Column -->
      <div class="side-column">
        <div class="map-card">
          <div class="map-placeholder">
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800" alt="Warehouse Map">
            <div class="pin">
              <mat-icon fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">location_on</mat-icon>
            </div>
          </div>
          <div class="map-info">
            <div>
              <h4>HQ Warehouse Alpha</h4>
              <p class="status"><span class="dot"></span> Operational</p>
            </div>
            <button mat-icon-button><mat-icon fontSet="material-symbols-rounded">open_in_new</mat-icon></button>
          </div>
        </div>

        <div class="feed-card">
          <div class="feed-header">
            <h3>Logistics Feed</h3>
            <button class="view-all">View All</button>
          </div>
          <div class="feed-items">
            @for (tx of recentTransactions$ | async; track tx.id) {
              <div class="feed-item">
                <div class="icon-box" [class.primary]="tx.type === 'inbound'">
                  <mat-icon fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">
                    {{tx.type === 'outbound' ? 'local_shipping' : 'flight_land'}}
                  </mat-icon>
                </div>
                <div class="feed-content">
                  <div class="feed-title">
                    <h4>{{tx.type === 'outbound' ? 'Dispatched' : 'Incoming'}}</h4>
                    <span class="time">JUST NOW</span>
                  </div>
                  <p>{{tx.quantity}} units {{tx.type === 'outbound' ? 'sent' : 'received'}}. {{tx.notes}}</p>
                </div>
              </div>
            }
            @if ((recentTransactions$ | async)?.length === 0) {
              <p style="color: var(--color-text-secondary); font-size: 12px;">No recent transactions.</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
    }

    .subtitle {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .title {
      font-family: var(--font-display);
      font-size: 48px;
      margin: 0;
      color: var(--color-text-primary);
    }

    .request-btn {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-mid));
      color: white !important;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 32px;
    }

    .alert-card {
      grid-column: span 12;
      background-color: var(--color-primary-light);
      border: 1px solid var(--color-primary-mid);
      border-radius: 14px;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert-content {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .icon-wrapper {
      background-color: var(--color-primary-mid);
      color: white;
      padding: 12px;
      border-radius: 50%;
      display: flex;
    }

    .alert-content h3 {
      font-family: var(--font-display);
      font-size: 20px;
      margin: 0 0 4px 0;
      color: var(--color-primary);
    }

    .alert-content p {
      margin: 0;
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    .review-btn {
      background: transparent;
      border: 1px solid var(--color-primary-mid);
      color: var(--color-primary);
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
    }

    .main-column {
      grid-column: span 8;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .stock-card {
      background-color: var(--color-card);
      border-radius: 14px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      border-left: 4px solid var(--color-primary);
    }

    .stock-card.critical {
      border-left-color: var(--color-danger);
    }

    .stock-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .title-row h2 {
      font-family: var(--font-display);
      font-size: 28px;
      margin: 0;
    }

    .badge {
      background-color: var(--color-danger-light);
      color: var(--color-danger);
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 1px;
    }

    .stock-header p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .percentage {
      text-align: right;
    }

    .percentage .value {
      display: block;
      font-family: var(--font-display);
      font-size: 36px;
      color: var(--color-danger);
      line-height: 1;
    }

    .percentage .label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-hint);
    }

    .progress-bar {
      height: 12px;
      background-color: var(--color-surface);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .progress-bar .fill {
      height: 100%;
      background-color: var(--color-danger);
      border-radius: 6px;
    }

    .stock-footer {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: var(--color-text-primary);
    }

    .stock-footer .target {
      color: var(--color-text-secondary);
    }

    .item-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .item-card {
      background-color: var(--color-card);
      border-radius: 14px;
      padding: 24px;
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }

    .item-card.warning {
      border-left: 4px solid var(--color-warning);
    }

    .item-card.wide {
      grid-column: span 2;
    }

    .item-info h3 {
      font-family: var(--font-display);
      font-size: 20px;
      margin: 0 0 4px 0;
    }

    .item-info p {
      margin: 0;
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .item-stats {
      margin-top: auto;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 8px;
    }

    .stat-row .value {
      font-family: var(--font-display);
      font-size: 28px;
      color: var(--color-primary);
      line-height: 1;
    }

    .stat-row .value.warn { color: var(--color-warning); }

    .count {
      font-size: 14px;
      font-weight: 600;
    }

    .count small { font-weight: 400; color: var(--color-text-secondary); }

    .progress-bar.mini { height: 8px; margin: 0; }
    .progress-bar.mini .fill { background-color: var(--color-primary); }
    .progress-bar.mini .fill.warn { background-color: var(--color-warning); }

    .item-info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .item-stats-header {
      text-align: right;
    }

    .item-stats-header .value {
      display: block;
      font-family: var(--font-display);
      font-size: 28px;
      color: var(--color-primary);
    }

    .multi-progress {
      height: 10px;
      background-color: var(--color-surface);
      border-radius: 5px;
      display: flex;
      overflow: hidden;
    }

    .multi-progress .fill.primary { background-color: var(--color-primary); }
    .multi-progress .fill.secondary { background-color: var(--color-primary-mid); }

    .legend {
      display: flex;
      gap: 16px;
      margin-top: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot.primary { background-color: var(--color-primary); }
    .dot.secondary { background-color: var(--color-primary-mid); }

    .side-column {
      grid-column: span 4;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .map-card {
      background-color: var(--color-card);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }

    .map-placeholder {
      height: 180px;
      position: relative;
    }

    .map-placeholder img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(0.5) opacity(0.8);
    }

    .pin {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--color-primary);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }

    .map-info {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .map-info h4 {
      margin: 0 0 4px 0;
      font-family: var(--font-display);
      font-size: 18px;
    }

    .status {
      margin: 0;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--color-text-secondary);
    }

    .status .dot {
      width: 6px;
      height: 6px;
      background-color: var(--color-success);
    }

    .feed-card {
      background-color: var(--color-surface);
      border-radius: 14px;
      padding: 24px;
      flex-grow: 1;
    }

    .feed-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .feed-header h3 {
      font-family: var(--font-display);
      font-size: 20px;
      margin: 0;
    }

    .view-all {
      background: transparent;
      border: none;
      color: var(--color-primary);
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
    }

    .feed-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feed-item {
      background-color: var(--color-card);
      padding: 16px;
      border-radius: 12px;
      display: flex;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      transition: transform 0.2s ease;
    }

    .feed-item:hover {
      transform: translateY(-2px);
    }

    .icon-box {
      background-color: var(--color-surface);
      color: var(--color-text-secondary);
      padding: 8px;
      border-radius: 8px;
      height: fit-content;
    }

    .icon-box.primary {
      background-color: var(--color-primary-light);
      color: var(--color-primary);
    }

    .feed-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .feed-title h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }

    .time {
      font-size: 9px;
      font-weight: 700;
      color: var(--color-text-hint);
    }

    .feed-content p {
      margin: 0;
      font-size: 12px;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }
  `]
})
export class ResourceVaultComponent implements OnInit {
  auth = inject(AuthService);
  private firestoreService = inject(FirestoreService);

  inventoryItems$!: Observable<InventoryItem[]>;
  criticalItems$!: Observable<InventoryItem[]>;
  recentTransactions$!: Observable<InventoryTransaction[]>;

  ngOnInit() {
    this.inventoryItems$ = this.firestoreService.getInventoryItems();
    this.criticalItems$ = this.inventoryItems$.pipe(
      map(items => items.filter(item => item.status === 'critical' || item.status === 'out_of_stock'))
    );
    this.recentTransactions$ = this.firestoreService.getInventoryTransactions().pipe(
      map(txs => txs.slice(0, 5))
    );
  }

  async scanQRCode() {
    // Simulated QR code scanning logic for handover
    const simulatedQrCode = 'MED-KIT-101';
    
    try {
      const item = await this.firestoreService.getInventoryItemByQRCode(simulatedQrCode);
      if (item) {
        // Log an outbound transaction
        await this.firestoreService.logInventoryTransaction({
          itemId: item.id,
          type: 'outbound',
          quantity: 1, // Simulated 1 unit
          performedBy: this.auth.currentUser?.uid || 'unknown',
          notes: 'Handover via QR Scan',
          qrCodeScanned: true
        });
        alert(`Successfully scanned and checked out 1 unit of ${item.name}`);
      } else {
        alert('QR Code not found in inventory.');
      }
    } catch (e) {
      console.error('Error scanning QR code', e);
      alert('Error scanning QR code.');
    }
  }

  getPercentage(item: InventoryItem): number {
    if (item.minimumThreshold === 0) return 100;
    // Assuming target is e.g. 3 times the minimum threshold
    const target = item.minimumThreshold * 3;
    const pct = (item.quantity / target) * 100;
    return Math.min(Math.round(pct), 100);
  }

  getTarget(item: InventoryItem): number {
    return item.minimumThreshold * 3;
  }
}
