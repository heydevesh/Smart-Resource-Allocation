import { Component, inject, signal, effect, ElementRef, ViewChild, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { MapsService } from '../../core/maps/maps.service';
import { Need } from '../../models';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NeedBottomSheetComponent } from '../../shared/components/need-bottom-sheet/need-bottom-sheet.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { ReportNeedComponent } from '../../modals/report-need/report-need.component';

@Component({
  selector: 'app-needs-map',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBottomSheetModule, MatDialogModule, RelativeTimePipe],
  template: `
    <div class="map-wrapper">
      <!-- Map Background with Overlay -->
      <div class="map-background">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2Yfv59Dzl77BMxAXQbIoN2DKafa-wyQfMrCqBAvze_XMIKNvUfzjxNIRu5D-9bPx11toWnnwV36RXRCl4f5YQoNYHydZ2GgDyDruuF3peF8QV6EpcH9I4YFGwKhCy3urYUG1rm_7Bd1kGvV4h3i3L6lw8X42DQF6Rnvm6U8PHtR5Vw_bD0A8b8iZvxJy60bYkIWQXvjrRF6r6MzrQBucnar2x4jD94iFvWdYWrr2cUaF-MqXDr2zLyaKudjaioLgVXt1dCvPqc8nV"
             alt="Mumbai Map" class="map-image" />
        <div class="overlay-dark"></div>
        <div class="overlay-gradient"></div>
      </div>

      <div #mapContainer class="map-container"></div>

      <!-- Top Search & Filter Bar -->
      <div class="top-bar">
        <div class="search-box glass-panel">
          <mat-icon>search</mat-icon>
          <input type="text" placeholder="Search coordinates, wards, or need types..." (input)="onSearch($event)" />
          <button mat-icon-button (click)="centerOnUser()" title="My Location">
            <mat-icon>my_location</mat-icon>
          </button>
        </div>

        <div class="filter-group glass-panel">
          <button class="filter-btn" [class.active]="filter() === 'all'" (click)="setFilter('all')">
            All Regions
          </button>
          <div class="divider"></div>
          <button class="filter-btn critical" [class.active]="filter() === 'critical'" (click)="setFilter('critical')">
            <mat-icon>local_fire_department</mat-icon>
            Critical
          </button>
          <button class="filter-btn" [class.active]="filter() === 'medical'" (click)="setFilter('medical')">
            Medical
          </button>
          <button class="filter-btn" [class.active]="filter() === 'food'" (click)="setFilter('food')">
            Food
          </button>
          <button class="filter-btn" [class.active]="filter() === 'water'" (click)="setFilter('water')">
            Water
          </button>
          <div class="divider"></div>
          <button class="filter-btn heatmap" [class.active]="showHeatmap()" (click)="toggleHeatmap()">
            <mat-icon>texture</mat-icon>
            Heatmap
          </button>
        </div>
      </div>

      <!-- Live Intelligence Panel (Right) -->
      <div class="intelligence-panel glass-panel">
        <div class="panel-header">
          <div class="ai-badge">
            <mat-icon>colors_spark</mat-icon>
            <span>AI Dispatch</span>
          </div>
          <h2 class="font-serif">Live Intelligence</h2>
          <p class="stats">{{ filteredNeeds().length }} Active reports in your sector</p>
        </div>

        <div class="needs-list">
          @for (need of filteredNeeds(); track need.id) {
            <div class="need-card" [class]="need.urgency" (click)="focusOnNeed(need)">
              <div class="live-pulse" *ngIf="need.urgency === 'critical'"></div>
              <div class="card-indicator" [class]="need.urgency"></div>
              <div class="card-header">
                <span class="urgency-badge" [class]="need.urgency">{{ need.urgency | uppercase }}</span>
                <span class="time">{{ need.reportedAt | relativeTime }}</span>
              </div>
              <h3>{{ need.title }}</h3>
              <p class="description">{{ need.description }}</p>
              <div class="card-footer">
                <mat-icon>location_on</mat-icon>
                <span>View on map</span>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <mat-icon>radar</mat-icon>
              <p>No active reports in this sector</p>
            </div>
          }
        </div>
      </div>

      <!-- Floating Action Buttons -->
      <div class="floating-actions">
        <button mat-fab class="report-fab" (click)="onReportNeed()">
          <mat-icon>add_alert</mat-icon>
        </button>
      </div>

      <!-- Map Legend -->
      <div class="legend glass-panel">
        <h4 class="font-serif">Map Legend</h4>
        <div class="legend-item">
          <div class="dot critical"></div>
          <span>Critical Need</span>
        </div>
        <div class="legend-item">
          <div class="dot high"></div>
          <span>High Priority</span>
        </div>
        <div class="legend-item">
          <div class="dot medium"></div>
          <span>Medium Priority</span>
        </div>
        <div class="legend-item">
          <div class="dot low"></div>
          <span>Low Priority</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .map-background {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;

      .map-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        mix-blend-mode: luminosity;
        opacity: 0.8;
      }

      .overlay-dark {
        position: absolute;
        inset: 0;
        background: #742fe5;
        opacity: 0.3;
        mix-blend-mode: multiply;
      }

      .overlay-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top right, rgba(47, 49, 48, 0.9), transparent);
      }
    }
    .map-container {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
    }

    .top-bar {
      position: absolute;
      top: 24px;
      left: 24px;
      right: 380px;
      display: flex;
      gap: 16px;
      z-index: 10;
    }

    .search-box {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 12px;
      gap: 12px;

      mat-icon { color: var(--color-text-hint); }
      input {
        border: none;
        background: transparent;
        color: var(--color-text-primary);
        font-weight: 500;
        font-size: 14px;
        width: 100%;
        outline: none;
        &::placeholder { color: var(--color-text-hint); }
      }
    }

    .filter-group {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 12px;
      gap: 8px;

      .divider {
        width: 1px;
        height: 24px;
        background: var(--color-outline-variant, #bec9c5);
        opacity: 0.3;
      }

      .filter-btn {
        border: none;
        background: var(--color-surface-container-low, #f3f4f3);
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-hint);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;

        &.active {
          background: var(--color-primary);
          color: white;
        }

        &.critical {
          background: var(--color-error-container, #ffdad6);
          color: var(--color-error, #ba1a1a);
          &.active { background: var(--color-error); color: white; }
          mat-icon { font-size: 16px; width: 16px; height: 16px; }
        }
      }
    }

    .intelligence-panel {
      position: absolute;
      top: 24px;
      right: 24px;
      bottom: 24px;
      width: 352px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      z-index: 10;
      overflow: hidden;

      .panel-header {
        padding: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-outline-variant, #bec9c5);
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(8px);
        position: relative;

        .ai-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-tertiary, #5b00c7);
          margin-bottom: 8px;
          mat-icon { font-size: 14px; width: 14px; height: 14px; fill: 1; }
          span { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
        }

        h2 {
          font-family: var(--font-display), serif;
          font-size: 24px;
          color: var(--color-primary, #005147);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .stats { font-size: 12px; color: var(--color-text-hint); margin-top: 4px; }
      }

      .needs-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
      }
    }

    .need-card {
      background: var(--color-surface-container-low, #f3f4f3);
      padding: 16px;
      border-radius: 12px;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
      overflow: hidden;

      &:hover { background: var(--color-surface-container, #eeeeed); }

      .card-indicator {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--color-primary);

        &.critical { background: var(--color-error, #ba1a1a); }
        &.high { background: var(--color-secondary, #006c4e); }
        &.medium { background: var(--color-primary-fixed, #a1f2e1); }
      }

      .live-pulse {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 6px;
        height: 6px;
        background: var(--color-error, #ba1a1a);
        border-radius: 50%;
        box-shadow: 0 0 0 rgba(186, 26, 26, 0.4);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(186, 26, 26, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(186, 26, 26, 0); }
        100% { box-shadow: 0 0 0 0 rgba(186, 26, 26, 0); }
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .urgency-badge {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;

          &.critical { background: var(--color-error-container, #ffdad6); color: var(--color-error, #ba1a1a); }
          &.high { background: var(--color-secondary-container, #83f5c6); color: var(--color-on-secondary-container, #007151); }
          &.medium { background: var(--color-surface-variant, #e2e2e2); color: var(--color-on-surface, #1a1c1c); }
        }
        .time { font-size: 10px; color: var(--color-text-hint); }
      }

      h3 {
        font-family: var(--font-ui), sans-serif;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 4px;
        color: var(--color-on-surface, #1a1c1c);
      }
      .description {
        font-size: 12px;
        color: var(--color-text-secondary);
        line-height: 1.4;
        margin-bottom: 12px;
      }

      .card-footer {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        color: var(--color-primary, #005147);
        mat-icon { font-size: 14px; width: 14px; height: 14px; }
      }
    }

    .floating-actions {
      position: absolute;
      bottom: 24px;
      right: 380px;
      z-index: 10;
    }

    .report-fab {
      background: linear-gradient(135deg, var(--color-primary, #005147), var(--color-primary-container, #0a6b5e));
      color: white;
      box-shadow: 0 12px 32px rgba(0, 81, 71, 0.2);
    }

    .legend {
      position: absolute;
      bottom: 24px;
      left: 24px;
      padding: 16px;
      border-radius: 16px;
      width: 180px;
      z-index: 10;

      h4 {
        font-family: var(--font-display), serif;
        font-size: 14px;
        color: var(--color-primary, #005147);
        margin: 0 0 12px 0;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        span { font-size: 12px; font-weight: 500; color: var(--color-on-surface, #1a1c1c); }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          &.critical {
            background: var(--color-error, #ba1a1a);
            box-shadow: 0 0 0 4px rgba(186, 26, 26, 0.2);
          }
          &.high {
            background: var(--color-secondary, #006c4e);
            box-shadow: 0 0 0 4px rgba(0, 108, 78, 0.2);
          }
          &.medium {
            background: var(--color-primary-fixed, #a1f2e1);
            box-shadow: 0 0 0 4px rgba(161, 242, 225, 0.2);
          }
          &.low {
            background: var(--color-surface-container-highest, #e2e2e2);
            border: 1px solid var(--color-outline, #6f7976);
          }
        }
      }
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 12px 32px rgba(0, 81, 71, 0.06);
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px;
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--color-text-hint);
        margin-bottom: 8px;
      }
      p { color: var(--color-text-secondary); font-size: 14px; }
    }
  `]
})
export class NeedsMapComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapElement!: ElementRef;
  
  private firestore = inject(FirestoreService);
  private mapsService = inject(MapsService);
  private bottomSheet = inject(MatBottomSheet);
  private dialog = inject(MatDialog);
  
  needs = toSignal(this.firestore.getOpenNeeds(), { initialValue: [] });
  filter = signal<string>('all');
  searchTerm = signal<string>('');
  showHeatmap = signal<boolean>(false);

  filteredNeeds = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const activeFilter = this.filter();
    
    return this.needs().filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(term) || n.description.toLowerCase().includes(term);
      const matchesFilter = activeFilter === 'all' || 
                           (activeFilter === 'critical' ? n.urgency === 'critical' : n.category === activeFilter);
      return matchesSearch && matchesFilter;
    });
  });
  
  private map?: google.maps.Map;
  private markers: google.maps.Marker[] = [];
  private heatmap?: google.maps.visualization.HeatmapLayer;

  constructor() {
    effect(() => {
      this.updateMarkers(this.filteredNeeds());
    });
  }

  ngAfterViewInit() {
    effect(() => {
      if (this.mapsService.isLoaded()) {
        this.initMap();
      }
    });
  }

  private initMap() {
    this.map = this.mapsService.createMap(this.mapElement.nativeElement, {
      zoom: 13,
      center: { lat: 19.0760, lng: 72.8777 }, // Mumbai default
      mapId: 'SAHAAY_MAP_ID'
    });

    this.updateMarkers(this.needs());
  }

  private updateMarkers(needs: Need[]) {
    if (!this.map) return;

    this.markers.forEach(m => m.setMap(null));
    this.markers = [];

    const filteredNeeds = needs.filter(n => {
      if (this.filter() === 'all') return true;
      if (this.filter() === 'critical') return n.urgency === 'critical';
      return n.category === this.filter();
    });

    filteredNeeds.forEach(need => {
      const marker = new google.maps.Marker({
        position: { lat: need.lat, lng: need.lng },
        map: this.map,
        title: need.title,
        icon: this.getIconForUrgency(need.urgency)
      });

      marker.addListener('click', () => {
        this.openNeedDetail(need);
      });

      this.markers.push(marker);
    });
    
    // Update heatmap if active
    if (this.showHeatmap()) {
      this.updateMapLayers();
    }
  }

  private getIconForUrgency(urgency: string): any {
    const colors: Record<string, string> = {
      critical: '#ba1a1a',
      high: '#006c4e',
      medium: '#a1f2e1',
      low: '#6b6965'
    };

    const color = colors[urgency] || '#0a6b5e';
    const scale = urgency === 'critical' ? 10 : urgency === 'high' ? 8 : 6;

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: urgency === 'critical' ? 0.9 : 0.7,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale
    };
  }

  setFilter(f: string) {
    this.filter.set(f);
  }

  toggleHeatmap() {
    this.showHeatmap.update(v => !v);
    this.updateMapLayers();
  }

  private updateMapLayers() {
    if (!this.map) return;

    if (this.showHeatmap()) {
      // Hide markers and show heatmap
      this.markers.forEach(m => m.setMap(null));
      const data = this.filteredNeeds().map(n => ({ lat: n.lat, lng: n.lng }));
      
      if (this.heatmap) {
        this.heatmap.setMap(null);
      }
      this.heatmap = this.mapsService.createHeatmap(this.map, data);
    } else {
      // Hide heatmap and show markers
      if (this.heatmap) {
        this.heatmap.setMap(null);
      }
      this.markers.forEach(m => m.setMap(this.map!));
    }
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  async centerOnUser() {
    try {
      const coords = await this.mapsService.geolocation.getCurrentPosition();
      this.map?.setCenter(coords);
      this.map?.setZoom(17);
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  }

  focusOnNeed(need: Need) {
    this.map?.panTo({ lat: need.lat, lng: need.lng });
    this.map?.setZoom(16);
    this.openNeedDetail(need);
  }

  onReportNeed() {
    this.dialog.open(ReportNeedComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'civic-modal-panel'
    });
  }

  private openNeedDetail(need: Need) {
    this.bottomSheet.open(NeedBottomSheetComponent, {
      data: { need }
    });
  }
}

