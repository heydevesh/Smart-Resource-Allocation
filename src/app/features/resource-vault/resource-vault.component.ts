import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
      <button mat-flat-button class="request-btn">
        <mat-icon fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">add_circle</mat-icon>
        Request Resource
      </button>
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
        <button class="review-btn">Review Allocation</button>
      </div>

      <!-- Main Column -->
      <div class="main-column">
        <!-- Critical Stock -->
        <div class="stock-card critical">
          <div class="stock-header">
            <div>
              <div class="title-row">
                <h2>Medical Supplies</h2>
                <span class="badge">Critical Stock-Out</span>
              </div>
              <p>Trauma kits, IV fluids, basic antibiotics.</p>
            </div>
            <div class="percentage">
              <span class="value">12%</span>
              <span class="label">Capacity</span>
            </div>
          </div>
          <div class="progress-bar">
            <div class="fill" style="width: 12%"></div>
          </div>
          <div class="stock-footer">
            <span>Available: <strong>45</strong> units</span>
            <span class="target">Target: 400 units</span>
          </div>
        </div>

        <!-- Grid of standard items -->
        <div class="item-grid">
          <div class="item-card">
            <div class="item-info">
              <h3>Food Rations</h3>
              <p>MREs, dry grains, infant formula.</p>
            </div>
            <div class="item-stats">
              <div class="stat-row">
                <span class="value">85%</span>
                <span class="count">1,200 <small>pallets</small></span>
              </div>
              <div class="progress-bar mini">
                <div class="fill" style="width: 85%"></div>
              </div>
            </div>
          </div>

          <div class="item-card warning">
            <div class="item-info">
              <div class="title-row">
                <h3>Water Supply</h3>
                <mat-icon fontSet="material-symbols-rounded">warning</mat-icon>
              </div>
              <p>Bottled water, purification tablets.</p>
            </div>
            <div class="item-stats">
              <div class="stat-row">
                <span class="value warn">38%</span>
                <span class="count">450 <small>liters</small></span>
              </div>
              <div class="progress-bar mini">
                <div class="fill warn" style="width: 38%"></div>
              </div>
            </div>
          </div>

          <div class="item-card wide">
            <div class="item-info-row">
              <div class="item-info">
                <h3>Shelter Kits</h3>
                <p>Tents, tarps, thermal blankets.</p>
              </div>
              <div class="item-stats-header">
                <span class="value">62%</span>
                <span class="count">310 <small>units available</small></span>
              </div>
            </div>
            <div class="multi-progress">
              <div class="fill primary" style="width: 40%"></div>
              <div class="fill secondary" style="width: 22%"></div>
            </div>
            <div class="legend">
              <div class="legend-item"><span class="dot primary"></span> Tents</div>
              <div class="legend-item"><span class="dot secondary"></span> Blankets</div>
            </div>
          </div>
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
            <div class="feed-item">
              <div class="icon-box">
                <mat-icon fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">local_shipping</mat-icon>
              </div>
              <div class="feed-content">
                <div class="feed-title">
                  <h4>Dispatched: Water</h4>
                  <span class="time">10 MIN AGO</span>
                </div>
                <p>200 liters sent to Mobile Unit C in Ward 4.</p>
              </div>
            </div>
            <div class="feed-item">
              <div class="icon-box primary">
                <mat-icon fontSet="material-symbols-rounded" style="font-variation-settings: 'FILL' 1;">flight_land</mat-icon>
              </div>
              <div class="feed-content">
                <div class="feed-title">
                  <h4>Incoming: Med Kits</h4>
                  <span class="time">ETA 2 HRS</span>
                </div>
                <p>Red Cross airdrop arriving at North Helipad. 350 units.</p>
              </div>
            </div>
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
      background-color: white;
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
      background-color: white;
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
      background-color: white;
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
      background-color: white;
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
export class ResourceVaultComponent {}

