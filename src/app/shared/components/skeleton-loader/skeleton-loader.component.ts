import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [style.height]="height()" [style.width]="width()" [style.border-radius]="radius()"></div>
  `,
  styles: [`
    .skeleton-wrapper {
      background: var(--color-border);
      opacity: 0.5;
      position: relative;
      overflow: hidden;
    }
    .skeleton-wrapper::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.2) 20%,
        rgba(255, 255, 255, 0.5) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 2s infinite;
    }
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  height = input<string>('20px');
  width = input<string>('100%');
  radius = input<string>('4px');
}
