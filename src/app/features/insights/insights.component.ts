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
          <button mat-icon-button color="primary" (click)="loadPredictions()"><mat-icon>sync</mat-icon></button>
        </div>
        
        <div class="ai-card">
          <div class="card-title">
            <mat-icon class="sparkle">magic_button</mat-icon> Vertex AI Forecast
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
            <mat-icon class="sparkle">magic_button</mat-icon> {{ reportHeadline() }}
          </div>
          <div *ngIf="generatingReport()">
            <app-skeleton-loader height="100px" class="mb-4"></app-skeleton-loader>
          </div>
          <p class="report-text" *ngIf="!generatingReport()">
            "{{ reportNarrative() }}"
          </p>
          <div class="actions">
            <button mat-stroked-button color="primary" (click)="generateReport()" [disabled]="generatingReport()">
              {{ generatingReport() ? 'Generating...' : 'Generate New' }}
            </button>
            <button mat-flat-button color="primary" [disabled]="generatingReport()">Export PDF</button>
          </div>
        </div>
      </section>

      <!-- Impact Chart Section -->
      <section class="insight-section mt-4">
        <div class="section-header">
          <h2>Operational Impact</h2>
        </div>
        
        <div class="ai-card">
          <div class="chart-container">
            <div class="chart-y-axis">
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>
            <div class="chart-content">
              <div class="bar-group" *ngFor="let month of monthlyData">
                <div class="bar-wrapper">
                  <div class="bar missions" [style.height.%]="(month.missions / 200) * 100" [title]="'Missions: ' + month.missions"></div>
                  <div class="bar impact" [style.height.%]="(month.impact / 200) * 100" [title]="'Impact Score: ' + month.impact"></div>
                </div>
                <span class="month-label">{{ month.name }}</span>
              </div>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item"><span class="dot missions"></span> Missions Resolved</div>
            <div class="legend-item"><span class="dot impact"></span> Impact Score</div>
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

    .chart-container {
      display: flex;
      height: 200px;
      gap: 16px;
      margin-bottom: 16px;
    }
    .chart-y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: var(--color-text-hint);
      font-size: 10px;
      padding-bottom: 24px;
    }
    .chart-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 4px;
    }
    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    .bar-wrapper {
      height: 160px;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 4px;
    }
    .bar {
      width: 12px;
      border-radius: 4px 4px 0 0;
      transition: height 0.6s ease-out;
    }
    .bar.missions { background: var(--color-primary); }
    .bar.impact { background: var(--color-info); opacity: 0.6; }
    .month-label {
      margin-top: 8px;
      font-size: 10px;
      color: var(--color-text-secondary);
      font-weight: 600;
    }
    .chart-legend {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--color-text-secondary);
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.missions { background: var(--color-primary); }
    .dot.impact { background: var(--color-info); opacity: 0.6; }
  `]
})
export class InsightsComponent {
  private agentService = inject(AgentService);
  
  predictions = signal<SurgePrediction[]>([]);
  loadingPredictions = signal<boolean>(false);

  monthlyData = [
    { name: 'Jan', missions: 120, impact: 85 },
    { name: 'Feb', missions: 145, impact: 98 },
    { name: 'Mar', missions: 130, impact: 92 },
    { name: 'Apr', missions: 165, impact: 115 },
    { name: 'May', missions: 190, impact: 140 },
    { name: 'Jun', missions: 155, impact: 110 }
  ];

  reportHeadline = signal<string>('Operational Impact Report');
  reportNarrative = signal<string>('Over the past week, Sahaay volunteers in Dharavi and Kurla successfully responded to 142 critical needs. With the onset of early monsoons, we saw a 30% spike in shelter requests. Thanks to our rapid AI matching, average response time decreased by 15 minutes, directly impacting 500+ vulnerable families.');
  generatingReport = signal<boolean>(false);

  async generateReport() {
    this.generatingReport.set(true);
    try {
      // Mock stats for narration
      const stats = {
        totalNeeds: 142,
        resolvedNeeds: 128,
        activeVolunteers: 45,
        region: 'Mumbai'
      };
      
      const result = await this.agentService.narrateReport(stats as any);
      if (result && typeof result !== 'string') {
        const typedResult = result as { narrative: string, headline: string, keyStats: string[] };
        this.reportNarrative.set(typedResult.narrative);
        this.reportHeadline.set(typedResult.headline);
      } else if (typeof result === 'string') {
        this.reportNarrative.set(result);
      }
    } catch (e) {
      console.error('Failed to generate report:', e);
    } finally {
      this.generatingReport.set(false);
    }
  }

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
