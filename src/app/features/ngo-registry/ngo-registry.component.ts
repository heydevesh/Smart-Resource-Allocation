import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FirestoreService } from '../../core/firebase/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';

interface NGO {
  id: string;
  name: string;
  ward: string;
  expertise: string[];
  contact: string;
  capacity: number;
  status: 'active' | 'pending' | 'inactive';
  verified: boolean;
}

@Component({
  selector: 'app-ngo-registry',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="ngo-registry-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-text">
          <p class="directory-label">Directory</p>
          <h1 class="page-title">Partner Registry</h1>
        </div>
        <button class="btn-primary">
          <mat-icon>add</mat-icon>
          New Registration
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-indicator"></div>
          <p class="stat-label">Total Verified NGOs</p>
          <div class="stat-value">
            <h2>{{ totalVerified() }}</h2>
            <span class="stat-trend positive">
              <mat-icon>trending_up</mat-icon>
              +12 this month
            </span>
          </div>
        </div>

        <div class="stat-card active">
          <div class="stat-indicator"></div>
          <p class="stat-label">Active (Last 24h)</p>
          <div class="stat-value">
            <h2>{{ activeCount() }}</h2>
            <span class="stat-trend">
              <mat-icon>bolt</mat-icon>
              High deployment
            </span>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-indicator"></div>
          <p class="stat-label">Pending Verifications</p>
          <div class="stat-value">
            <h2>{{ pendingCount() }}</h2>
            <span class="stat-trend warning">
              Requires review
            </span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input
            type="text"
            placeholder="Search NGO name or contact..."
            (input)="onSearch($event)"
          />
        </div>

        <div class="filter-select">
          <mat-icon>location_on</mat-icon>
          <select (change)="onWardChange($event)">
            <option value="">Select Ward</option>
            <option value="all">All Wards</option>
            <option value="G/N">Dharavi (Ward G/N)</option>
            <option value="L">Kurla (Ward L)</option>
            <option value="K/E">Andheri (Ward K/E)</option>
          </select>
        </div>

        <div class="filter-select">
          <mat-icon>category</mat-icon>
          <select (change)="onExpertiseChange($event)">
            <option value="">Expertise Area</option>
            <option value="all">All Areas</option>
            <option value="Medical Aid">Medical Aid</option>
            <option value="Food Distribution">Food Distribution</option>
            <option value="Evacuation">Evacuation</option>
            <option value="Flood Rescue">Flood Rescue</option>
          </select>
        </div>

        <button class="btn-secondary">
          <mat-icon>tune</mat-icon>
          Advanced
        </button>
      </div>

      <!-- NGO Grid -->
      <div class="ngo-grid">
        @for (ngo of filteredNGOs(); track ngo.id) {
          <div class="ngo-card" [class]="ngo.status">
            <div class="card-indicator" [class]="ngo.status"></div>
            <div class="card-header">
              <div class="ngo-info">
                <div class="ngo-name-row">
                  <h3>{{ ngo.name }}</h3>
                  @if (ngo.verified) {
                    <mat-icon class="verified-icon">verified</mat-icon>
                  }
                </div>
                <p class="ngo-ward">
                  <mat-icon>location_on</mat-icon>
                  {{ ngo.ward }}
                </p>
              </div>
              <span class="status-badge" [class]="ngo.status">{{ ngo.status }}</span>
            </div>

            <div class="expertise-tags">
              @for (tag of ngo.expertise; track tag) {
                <span class="expertise-tag" [class]="ngo.status">{{ tag }}</span>
              }
            </div>

            <div class="card-footer">
              <div class="footer-col">
                <p class="footer-label">Contact</p>
                <p class="footer-value">
                  <mat-icon>person</mat-icon>
                  {{ ngo.contact }}
                </p>
              </div>
              <div class="footer-col">
                <p class="footer-label">Capacity</p>
                <p class="footer-value">
                  <mat-icon>groups</mat-icon>
                  {{ ngo.capacity }} Volunteers
                </p>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <mat-icon>search_off</mat-icon>
            <p>No NGOs found matching your criteria</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .ngo-registry-container {
      padding: 0 0 40px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;

      .directory-label {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--color-primary, #005147);
        opacity: 0.7;
        margin-bottom: 4px;
      }

      .page-title {
        font-family: var(--font-display), serif;
        font-size: 40px;
        font-weight: 700;
        color: var(--color-on-surface, #1a1c1c);
        letter-spacing: -0.02em;
        margin: 0;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--color-primary, #005147), var(--color-primary-container, #0a6b5e));
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 81, 71, 0.15);
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 6px 20px rgba(0, 81, 71, 0.2);
      }

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .btn-secondary {
      background: var(--color-surface-container-lowest, #ffffff);
      border: 1px solid var(--color-outline-variant, #bec9c5);
      color: var(--color-on-surface, #1a1c1c);
      padding: 10px 16px;
      border-radius: 9px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--color-surface-container-high, #e8e8e7);
      }

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      padding: 24px;
      border-radius: 14px;
      border: 1px solid rgba(111, 121, 118, 0.15);
      box-shadow: 0 12px 32px rgba(0, 81, 71, 0.04);
      position: relative;
      overflow: hidden;

      .stat-indicator {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }

      .stat-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--color-outline, #6f7976);
        margin-bottom: 12px;
      }

      .stat-value {
        display: flex;
        align-items: baseline;
        gap: 12px;

        h2 {
          font-family: var(--font-display), serif;
          font-size: 48px;
          font-weight: 700;
          color: var(--color-on-surface, #1a1c1c);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .stat-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 12px;

          mat-icon { font-size: 14px; width: 14px; height: 14px; }

          &.positive {
            color: var(--color-primary, #005147);
            background: rgba(0, 81, 71, 0.1);
          }

          &.warning {
            color: #d97706;
            background: rgba(217, 119, 6, 0.1);
          }
        }
      }

      &.primary .stat-indicator { background: var(--color-primary, #005147); }
      &.active .stat-indicator { background: var(--color-secondary-fixed-dim, #68dbae); }
      &.pending .stat-indicator { background: #d97706; }
    }

    .filters-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px;
      background: var(--color-surface-container-low, #f3f4f3);
      border-radius: 14px;
      border: 1px solid rgba(111, 121, 118, 0.1);
      margin-bottom: 24px;

      .search-box {
        flex: 1;
        min-width: 250px;
        position: relative;

        mat-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-outline, #6f7976);
          font-size: 20px;
        }

        input {
          width: 100%;
          background: var(--color-surface-container-lowest, #ffffff);
          border: 1px solid rgba(111, 121, 118, 0.2);
          border-radius: 9px;
          padding: 10px 16px 10px 44px;
          font-size: 14px;
          color: var(--color-on-surface, #1a1c1c);
          outline: none;
          transition: all 0.2s ease;

          &:focus {
            border-color: var(--color-primary, #005147);
            box-shadow: 0 0 0 3px rgba(0, 81, 71, 0.1);
          }

          &::placeholder {
            color: var(--color-outline, #6f7976);
          }
        }
      }

      .filter-select {
        min-width: 180px;
        position: relative;

        mat-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-outline, #6f7976);
          font-size: 18px;
          z-index: 1;
        }

        select {
          width: 100%;
          background: var(--color-surface-container-lowest, #ffffff);
          border: 1px solid rgba(111, 121, 118, 0.2);
          border-radius: 9px;
          padding: 10px 40px 10px 44px;
          font-size: 14px;
          color: var(--color-on-surface, #1a1c1c);
          outline: none;
          cursor: pointer;
          appearance: none;
          transition: all 0.2s ease;

          &:focus {
            border-color: var(--color-primary, #005147);
            box-shadow: 0 0 0 3px rgba(0, 81, 71, 0.1);
          }
        }

        &::after {
          content: 'expand_more';
          font-family: 'Material Symbols Outlined';
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: var(--color-outline, #6f7976);
          pointer-events: none;
        }
      }
    }

    .ngo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    .ngo-card {
      background: var(--color-surface-container-lowest, #ffffff);
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 12px 32px rgba(0, 81, 71, 0.03);
      border: 1px solid rgba(111, 121, 118, 0.15);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 16px 40px rgba(0, 81, 71, 0.06);
      }

      .card-indicator {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 6px;

        &.active { background: #16a34a; }
        &.pending { background: #d97706; }
        &.inactive { background: var(--color-outline, #6f7976); }
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        padding-left: 8px;

        .ngo-info {
          .ngo-name-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;

            h3 {
              font-family: var(--font-display), serif;
              font-size: 24px;
              font-weight: 700;
              color: var(--color-on-surface, #1a1c1c);
              margin: 0;
            }

            .verified-icon {
              color: var(--color-primary, #005147);
              font-size: 20px;
            }
          }

          .ngo-ward {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--color-outline, #6f7976);
            margin: 0;

            mat-icon { font-size: 14px; width: 14px; height: 14px; }
          }
        }

        .status-badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 4px 10px;
          border-radius: 12px;

          &.active {
            background: rgba(22, 163, 74, 0.1);
            color: #16a34a;
          }

          &.pending {
            background: rgba(217, 119, 6, 0.1);
            color: #d97706;
            display: flex;
            align-items: center;
            gap: 4px;

            &::before {
              content: 'schedule';
              font-family: 'Material Symbols Outlined';
              font-size: 12px;
            }
          }
        }
      }

      .expertise-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 24px;
        padding-left: 8px;

        .expertise-tag {
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid;

          &.active {
            background: rgba(0, 81, 71, 0.05);
            color: var(--color-primary, #005147);
            border-color: rgba(0, 81, 71, 0.2);
          }

          &.pending {
            background: rgba(116, 47, 229, 0.1);
            color: var(--color-on-tertiary-fixed-variant, #5a00c6);
            border-color: rgba(116, 47, 229, 0.2);
            display: flex;
            align-items: center;
            gap: 4px;

            &::before {
              content: 'auto_awesome';
              font-family: 'Material Symbols Outlined';
              font-size: 14px;
            }
          }
        }
      }

      .card-footer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(111, 121, 118, 0.15);
        padding-left: 8px;

        .footer-col {
          .footer-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--color-outline, #6f7976);
            margin-bottom: 4px;
          }

          .footer-value {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 14px;
            font-weight: 500;
            color: var(--color-on-surface, #1a1c1c);
            margin: 0;

            mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--color-outline, #6f7976); }
          }
        }
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 64px 16px;
      color: var(--color-text-secondary);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--color-outline, #6f7976);
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        color: var(--color-text-secondary);
      }
    }
  `]
})
export class NgoRegistryComponent {
  private firestore = inject(FirestoreService);

  searchQuery = signal<string>('');
  selectedWard = signal<string>('');
  selectedExpertise = signal<string>('');

  ngos: NGO[] = [
    {
      id: '1',
      name: 'Sanjivani Trust',
      ward: 'Dharavi (Ward G/N)',
      expertise: ['Medical Aid', 'Ambulance'],
      contact: 'Dr. Meera Desai',
      capacity: 45,
      status: 'active',
      verified: true
    },
    {
      id: '2',
      name: 'Aahar Foundation',
      ward: 'Kurla (Ward L)',
      expertise: ['Food Distribution', 'Logistics'],
      contact: 'Rahul Sharma',
      capacity: 120,
      status: 'active',
      verified: true
    },
    {
      id: '3',
      name: 'Jal Relief Squad',
      ward: 'Andheri (Ward K/E)',
      expertise: ['Flood Rescue'],
      contact: 'Sarah Khan',
      capacity: 30,
      status: 'pending',
      verified: false
    },
    {
      id: '4',
      name: 'Paws & Claws Rescue',
      ward: 'Citywide',
      expertise: ['Animal Rescue'],
      contact: 'Amit Patel',
      capacity: 15,
      status: 'active',
      verified: true
    }
  ];

  filteredNGOs = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const ward = this.selectedWard();
    const expertise = this.selectedExpertise();

    return this.ngos.filter(ngo => {
      const matchesSearch = ngo.name.toLowerCase().includes(query) ||
                           ngo.contact.toLowerCase().includes(query);
      const matchesWard = !ward || ward === 'all' || ngo.ward.includes(ward);
      const matchesExpertise = !expertise || expertise === 'all' ||
                               ngo.expertise.some(e => e.toLowerCase().includes(expertise.toLowerCase()));
      return matchesSearch && matchesWard && matchesExpertise;
    });
  });

  totalVerified = computed(() => this.ngos.filter(n => n.verified).length);
  activeCount = computed(() => this.ngos.filter(n => n.status === 'active').length);
  pendingCount = computed(() => this.ngos.filter(n => n.status === 'pending').length);

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onWardChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedWard.set(select.value);
  }

  onExpertiseChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedExpertise.set(select.value);
  }
}
