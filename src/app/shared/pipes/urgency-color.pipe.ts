import { Pipe, PipeTransform } from '@angular/core';

/**
 * Maps urgency/priority levels to CSS color variables.
 * Usage: [style.color]="need.urgency | urgencyColor"
 */
@Pipe({
  name: 'urgencyColor',
  standalone: true
})
export class UrgencyColorPipe implements PipeTransform {
  private readonly colorMap: Record<string, string> = {
    critical: 'var(--color-danger)',
    high: 'var(--color-warning)',
    medium: 'var(--color-info)',
    low: 'var(--color-text-hint)',
    
    // Task status colors
    pending: 'var(--color-warning)',
    active: 'var(--color-info)',
    completed: 'var(--color-success)',
    escalated: 'var(--color-danger)',
    
    // Inventory status
    optimal: 'var(--color-success)',
    out_of_stock: 'var(--color-danger)',
    
    // NGO status
    pending_review: 'var(--color-warning)',
    suspended: 'var(--color-danger)',
    deactivated: 'var(--color-text-hint)',
    
    // Default
    open: 'var(--color-info)',
    assigned: 'var(--color-primary)',
    in_progress: 'var(--color-primary-mid)',
    resolved: 'var(--color-success)',
    dismissed: 'var(--color-text-hint)',
  };

  transform(value: string | null | undefined): string {
    if (!value) return 'var(--color-text-secondary)';
    return this.colorMap[value.toLowerCase()] || 'var(--color-text-secondary)';
  }
}
