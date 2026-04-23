import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'line' | 'card' | 'stat-card' | 'task-card' | 'volunteer-card' | 'circle' | 'paragraph' | 'need-row';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant()) {
      @case ('stat-card') {
        @for (_ of items(); track $index) {
          <div class="skeleton-stat-card">
            <div class="shimmer icon-box"></div>
            <div class="stat-text">
              <div class="shimmer text-sm"></div>
              <div class="shimmer text-lg"></div>
            </div>
          </div>
        }
      }

      @case ('task-card') {
        @for (_ of items(); track $index) {
          <div class="skeleton-task-card">
            <div class="sk-row between">
              <div class="shimmer text-xs" style="width: 60px"></div>
              <div class="shimmer badge"></div>
            </div>
            <div class="shimmer text-md" style="margin-top: 12px"></div>
            <div class="shimmer text-sm" style="margin-top: 8px; width: 70%"></div>
            <div class="sk-row between" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--color-border);">
              <div class="sk-row">
                <div class="shimmer circle-sm"></div>
                <div class="shimmer circle-sm" style="margin-left: -8px"></div>
                <div class="shimmer text-xs" style="width: 60px; margin-left: 8px"></div>
              </div>
              <div class="shimmer text-xs" style="width: 50px"></div>
            </div>
          </div>
        }
      }

      @case ('need-row') {
        @for (_ of items(); track $index) {
          <div class="skeleton-need-row">
            <div class="shimmer icon-box-lg"></div>
            <div class="need-text">
              <div class="sk-row" style="gap: 12px; margin-bottom: 6px">
                <div class="shimmer text-md" style="width: 60%"></div>
                <div class="shimmer badge"></div>
              </div>
              <div class="shimmer text-sm" style="width: 50%"></div>
            </div>
            <div class="shimmer btn-sm"></div>
          </div>
        }
      }

      @case ('volunteer-card') {
        @for (_ of items(); track $index) {
          <div class="skeleton-volunteer-card">
            <div class="sk-row" style="gap: 16px; margin-bottom: 16px">
              <div class="shimmer circle-lg"></div>
              <div style="flex: 1">
                <div class="shimmer text-md" style="width: 50%; margin-bottom: 8px"></div>
                <div class="shimmer text-sm" style="width: 35%"></div>
              </div>
              <div class="shimmer badge"></div>
            </div>
            <div class="sk-row" style="gap: 6px">
              <div class="shimmer chip"></div>
              <div class="shimmer chip"></div>
              <div class="shimmer chip"></div>
            </div>
          </div>
        }
      }

      @case ('paragraph') {
        <div class="skeleton-paragraph">
          <div class="shimmer text-md" style="width: 100%"></div>
          <div class="shimmer text-md" style="width: 95%"></div>
          <div class="shimmer text-md" style="width: 88%"></div>
          <div class="shimmer text-md" style="width: 60%"></div>
        </div>
      }

      @case ('circle') {
        <div class="shimmer" [style.width]="width()" [style.height]="height()" style="border-radius: 50%"></div>
      }

      @case ('card') {
        @for (_ of items(); track $index) {
          <div class="skeleton-generic-card">
            <div class="shimmer text-md" style="width: 60%; margin-bottom: 12px"></div>
            <div class="shimmer text-sm" style="width: 100%; margin-bottom: 8px"></div>
            <div class="shimmer text-sm" style="width: 80%"></div>
          </div>
        }
      }

      @default {
        <!-- line (default) -->
        <div class="shimmer" [style.height]="height()" [style.width]="width()" [style.border-radius]="radius()"></div>
      }
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    .shimmer {
      background: var(--skeleton-base, rgba(0, 0, 0, 0.06));
      position: relative;
      overflow: hidden;
      border-radius: 6px;
    }

    .shimmer::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--skeleton-shine, rgba(255, 255, 255, 0.4)) 50%,
        transparent 100%
      );
      animation: shimmer 1.8s ease-in-out infinite;
    }

    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }

    /* ---------- Primitives ---------- */
    .text-xs  { height: 10px; width: 100%; }
    .text-sm  { height: 12px; width: 100%; }
    .text-md  { height: 16px; width: 100%; }
    .text-lg  { height: 28px; width: 100%; }
    .badge    { height: 18px; width: 52px; border-radius: 20px; }
    .chip     { height: 24px; width: 64px; border-radius: 12px; }
    .btn-sm   { height: 32px; width: 72px; border-radius: 8px; }

    .icon-box    { width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; }
    .icon-box-lg { width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0; }
    .circle-sm   { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; }
    .circle-lg   { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; }

    .sk-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sk-row.between {
      justify-content: space-between;
    }

    /* ---------- Stat Card ---------- */
    .skeleton-stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid var(--color-border);
    }
    .stat-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .stat-text .text-sm { width: 60%; }
    .stat-text .text-lg { width: 40%; }

    /* ---------- Task Card ---------- */
    .skeleton-task-card {
      background: var(--color-card);
      border-radius: 14px;
      padding: 16px;
      border: 1px solid var(--color-border);
      margin-bottom: 12px;
    }

    /* ---------- Need Row ---------- */
    .skeleton-need-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px;
      border-radius: 18px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.4);
    }
    .need-text { flex: 1; }

    /* ---------- Volunteer Card ---------- */
    .skeleton-volunteer-card {
      background: var(--color-card);
      border-radius: 14px;
      padding: 16px;
      border: 1px solid var(--color-border);
      margin-bottom: 12px;
    }

    /* ---------- Paragraph ---------- */
    .skeleton-paragraph {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ---------- Generic Card ---------- */
    .skeleton-generic-card {
      background: var(--color-card);
      border-radius: 14px;
      padding: 20px;
      border: 1px solid var(--color-border);
      margin-bottom: 12px;
    }

    /* ---------- Dark Theme ---------- */
    :host-context(.dark-theme) .shimmer {
      --skeleton-base: rgba(255, 255, 255, 0.08);
      --skeleton-shine: rgba(255, 255, 255, 0.12);
    }
    :host-context(.dark-theme) .skeleton-stat-card,
    :host-context(.dark-theme) .skeleton-need-row {
      background: rgba(255, 255, 255, 0.04);
    }
  `]
})
export class SkeletonLoaderComponent {
  variant = input<SkeletonVariant>('line');
  count = input<number>(1);
  height = input<string>('20px');
  width = input<string>('100%');
  radius = input<string>('6px');

  items(): number[] {
    return Array.from({ length: this.count() });
  }
}
