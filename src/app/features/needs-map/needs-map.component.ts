import { Component, signal, ViewChild, ElementRef, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetModule, MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GoogleMapsModule } from '@angular/google-maps';
import { NeedCardComponent } from '../../shared/components/need-card/need-card.component';
import { NeedBottomSheetComponent } from '../../shared/components/need-bottom-sheet/need-bottom-sheet.component';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { Need } from '../../models';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-needs-map',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatBottomSheetModule, 
    MatButtonModule, 
    MatButtonToggleModule, 
    GoogleMapsModule,
    NeedCardComponent,
    NeedBottomSheetComponent
  ],
  template: `
    <div class="map-container">
      <div class="map-overlay-top">
        <div class="search-bar">
          <mat-icon>search</mat-icon>
          <input type="text" placeholder="Search locations or needs...">
        </div>
        <div class="filters">
          <button class="filter-chip" [class.active]="filter() === 'all'" (click)="setFilter('all')">All</button>
          <button class="filter-chip" [class.active]="filter() === 'critical'" (click)="setFilter('critical')">Critical</button>
          <button class="filter-chip" [class.active]="filter() === 'medical'" (click)="setFilter('medical')">Medical</button>
          <button class="filter-chip" [class.active]="filter() === 'food'" (click)="setFilter('food')">Food</button>
        </div>
      </div>
      
      <google-map height="100%" width="100%" [center]="center" [zoom]="zoom" [options]="mapOptions">
        @for (need of filteredNeeds(); track need.id) {
          <map-marker 
            [position]="{lat: need.lat, lng: need.lng}"
            [options]="getMarkerOptions(need)"
            (mapClick)="openNeedDetails(need)">
          </map-marker>
        }
      </google-map>
      
      <button mat-fab class="my-location-btn" (click)="goToMyLocation()">
        <mat-icon>my_location</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      height: calc(100vh - 64px); /* Subtract bottom nav */
      width: 100%;
      overflow: hidden;
    }
    .map-overlay-top {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .search-bar {
      display: flex;
      align-items: center;
      background: var(--color-card);
      padding: 0 16px;
      height: 48px;
      border-radius: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .search-bar input {
      border: none;
      outline: none;
      width: 100%;
      padding: 0 12px;
      font-family: var(--font-ui);
      font-size: 1rem;
    }
    .search-bar mat-icon {
      color: var(--color-text-secondary);
    }
    
    .filters {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none; /* Firefox */
    }
    .filters::-webkit-scrollbar {
      display: none; /* Chrome */
    }
    .filter-chip {
      background: var(--color-card);
      border: 1px solid var(--color-border);
      padding: 6px 16px;
      border-radius: 20px;
      font-family: var(--font-ui);
      font-size: 0.85rem;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
    }
    .filter-chip.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }
    
    .my-location-btn {
      position: absolute;
      bottom: 24px;
      right: 16px;
      z-index: 10;
      background: var(--color-card) !important;
      color: var(--color-primary) !important;
    }
  `]
})
export class NeedsMapComponent {
  private firestore = inject(FirestoreService);
  private bottomSheet = inject(MatBottomSheet);

  needs = toSignal(this.firestore.getOpenNeeds(), { initialValue: [] });
  filter = signal<string>('all');

  center: google.maps.LatLngLiteral = { lat: 19.0760, lng: 72.8777 }; // Mumbai
  zoom = 12;
  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    mapId: '8e0a97af9386fef1' // Note: A valid map ID might be needed for advanced markers/styling
  };

  get filteredNeeds() {
    return () => {
      const currentFilter = this.filter();
      const allNeeds = this.needs();
      if (currentFilter === 'all') return allNeeds;
      if (currentFilter === 'critical') return allNeeds.filter(n => n.urgency === 'critical');
      if (currentFilter === 'medical') return allNeeds.filter(n => n.category === 'medical');
      if (currentFilter === 'food') return allNeeds.filter(n => n.category === 'food');
      return allNeeds;
    };
  }

  setFilter(f: string) {
    this.filter.set(f);
  }

  getMarkerOptions(need: Need): google.maps.marker.AdvancedMarkerElementOptions | google.maps.MarkerOptions {
    let url = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    if (need.urgency === 'critical') url = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
    else if (need.urgency === 'high') url = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
    else if (need.urgency === 'medium') url = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    else if (need.urgency === 'low') url = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

    return {
      icon: {
        url: url
      },
      title: need.title
    };
  }

  openNeedDetails(need: Need) {
    this.bottomSheet.open(NeedBottomSheetComponent, {
      data: { need }
    });
  }

  goToMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.zoom = 15;
      });
    }
  }
}
