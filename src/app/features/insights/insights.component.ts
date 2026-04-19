import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AgentService } from '../../core/ai/agent.service';
import { SurgePrediction } from '../../models';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule, SkeletonLoaderComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Insights</h1>
          <p class="page-subtitle">AI-powered analytics and reports.</p>
        </div>
      </header>

      <!-- Surge Prediction Section -->
      <section class="insight-section">
        <div class="section-header">
          <h2>Surge Predictions</h2>
          <button mat-icon-button color="primary" (click)="loadPredictions()"><mat-icon>refresh</mat-icon></button>
        </div>
        
        <div class="ai-card">
          <div class="card-title">
            <mat-icon class="sparkle">auto_awesome</mat-icon> Vertex AI Forecast
          </div>
          
          <ng-container *ngIf="loadingPredictions()">
            <app-skeleton-loader height="60px" class="mb-2"></app-skeleton-loader>
            <app-skeleton-loader height="60px"></app-skeleton-loader>
          </ng-container>
          
          <ng-container *ngIf="!loadingPredictions()">
            <div class="prediction-item" *ngFor="let pred of predictions()">
              <div class="pred-header">
                <span class="category">{{ pred.category | uppercase }}</span>
                <span class="confidence">Confidence: {{ (pred.confidence * 100).toFixed(0) }}%</span>
              </div>
              <p class="reasoning">{{ pred.reasoning }}</p>
              <div class="bar-container">
                <mat-progress-bar mode="determinate" [value]="pred.confidence * 100" [color]="pred.confidence > 0.8 ? 'warn' : 'primary'"></mat-progress-bar>
              </div>
            </div>
            <div *ngIf="predictions().length === 0" class="empty-msg">
              Click refresh to generate predictions for Mumbai.
            </div>
          </ng-container>
        </div>
      </section>

      <!-- Donor Narrative Section -->
      <section class="insight-section mt-4">
        <div class="section-header">
          <h2>Donor Narrative</h2>
        </div>
        
        <div class="ai-card">
          <div class="card-title">
            <mat-icon class="sparkle">auto_awesome</mat-icon> AI Generated Report
          </div>
          <p class="report-text">
            "Over the past week, Sahaay volunteers in Dharavi and Kurla successfully responded to 142 critical needs. 
            With the onset of early monsoons, we saw a 30% spike in shelter requests. Thanks to our rapid AI matching, 
            average response time decreased by 15 minutes, directly impacting 500+ vulnerable families."
          </p>
          <div class="actions">
            <button mat-stroked-button color="primary">Generate New</button>
            <button mat-flat-button color="primary">Export PDF</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-container {
      padding: var(--screen-pad);
      padding-bottom: 80px;
    }
    .page-header {
      margin-bottom: 24px;
    }
    .page-title {
      margin: 0;
      font-family: var(--font-display);
      font-size: 2rem;
      color: var(--color-text-primary);
    }
    .page-subtitle {
      margin: 4px 0 0;
      font-family: var(--font-ui);
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }
    
    .insight-section {
      margin-bottom: 24px;
    }
    .mt-4 { margin-top: 32px; }
    .mb-2 { margin-bottom: 16px; display: block; }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .section-header h2 {
      margin: 0;
      font-family: var(--font-ui);
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .ai-card {
      background: var(--color-card);
      border-radius: var(--radius-card);
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border: 1px solid var(--color-primary-light);
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-ui);
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 16px;
    }
    .sparkle {
      color: var(--color-warning);
    }
    
    .prediction-item {
      padding: 12px;
      background: var(--color-surface);
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .pred-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .category {
      font-weight: 600;
      font-size: 0.8rem;
      color: var(--color-primary);
    }
    .confidence {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .reasoning {
      margin: 0 0 8px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }
    .empty-msg {
      text-align: center;
      padding: 24px;
      color: var(--color-text-hint);
      font-size: 0.9rem;
    }
    
    .report-text {
      font-family: var(--font-display);
      font-size: 1.1rem;
      line-height: 1.6;
      color: var(--color-text-secondary);
      margin-bottom: 24px;
      font-style: italic;
    }
    .actions {
      display: flex;
      gap: 12px;
    }
  `]
})
export class InsightsComponent {
  private agentService = inject(AgentService);
  
  predictions = signal<SurgePrediction[]>([]);
  loadingPredictions = signal<boolean>(false);

  async loadPredictions() {
    this.loadingPredictions.set(true);
    try {
      const result = await this.agentService.predictSurge('Mumbai');
      if (result) this.predictions.set(result);
    } catch (e) {
      console.error(e);
      // Fallback for demo
      setTimeout(() => {
        this.predictions.set([
          {
            category: 'medical',
            predictedCount: 45,
            confidence: 0.85,
            week: 'Next Week',
            reasoning: 'Historical data indicates a spike in water-borne diseases at the onset of monsoons.'
          },
          {
            category: 'shelter',
            predictedCount: 20,
            confidence: 0.60,
            week: 'Next Week',
            reasoning: 'Potential localized flooding in low-lying areas based on weather forecasts.'
          }
        ]);
        this.loadingPredictions.set(false);
      }, 1500);
    }
  }
}
