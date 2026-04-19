import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  needs = [
    { type: 'Food', urgency: 'high' },
    { type: 'Medical', urgency: 'medium' }
  ];
}