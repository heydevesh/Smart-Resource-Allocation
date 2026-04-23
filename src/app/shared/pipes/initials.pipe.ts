import { Pipe, PipeTransform } from '@angular/core';

/**
 * Extracts initials from a name for avatar display.
 * Usage: {{ 'Rahul Sharma' | initials }}    → 'RS'
 * Usage: {{ 'Priya Devi Kumar' | initials }} → 'PK' (first + last)
 */
@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, maxChars: number = 2): string {
    if (!value || !value.trim()) return '?';

    const parts = value.trim().split(/\s+/).filter(Boolean);
    
    if (parts.length === 1) {
      return parts[0].substring(0, maxChars).toUpperCase();
    }

    // Take first character of first and last name
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }
}
