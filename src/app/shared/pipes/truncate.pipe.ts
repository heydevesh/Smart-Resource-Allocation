import { Pipe, PipeTransform } from '@angular/core';

/**
 * Truncates a string to a specified length with an ellipsis.
 * Usage: {{ longText | truncate:80 }}
 * Usage with custom suffix: {{ longText | truncate:80:'...' }}
 */
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 100, suffix: string = '…'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    
    // Try to break at the last space within the limit to avoid cutting words
    const truncated = value.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > limit * 0.7) {
      return truncated.substring(0, lastSpace) + suffix;
    }
    
    return truncated + suffix;
  }
}
