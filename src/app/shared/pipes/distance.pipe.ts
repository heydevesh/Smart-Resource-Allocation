import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance',
  standalone: true
})
export class DistancePipe implements PipeTransform {
  transform(distanceInMeters: number | undefined): string {
    if (distanceInMeters === undefined || distanceInMeters === null) return '';
    
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    }
    
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  }
}
