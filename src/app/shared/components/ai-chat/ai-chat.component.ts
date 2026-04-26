import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../../core/ai/agent.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule, FormsModule, MatProgressSpinnerModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <mat-icon class="sparkle">magic_button</mat-icon>
        <h3>Coordinator Assistant</h3>
      </div>
      
      <div class="chat-messages" #scrollContainer>
        @for (msg of messages(); track $index) {
          <div class="message" [ngClass]="msg.role">
            <div class="bubble" [innerHTML]="msg.content"></div>
          </div>
        }
        @if (isLoading()) {
          <div class="message assistant">
            <div class="bubble typing">
              <mat-spinner diameter="16"></mat-spinner>
              <span>Agent is thinking...</span>
            </div>
          </div>
        }
      </div>

      <div class="chat-input-area">
        <input 
          type="text" 
          [(ngModel)]="currentQuery" 
          (keyup.enter)="sendMessage()" 
          placeholder="Ask about missions, volunteers..." 
          [disabled]="isLoading()"
        />
        <button mat-icon-button color="primary" (click)="sendMessage()" [disabled]="!currentQuery.trim() || isLoading()">
          <mat-icon>send</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-surface);
    }
    .chat-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);
      h3 { margin: 0; font-family: var(--font-display); color: var(--color-primary); font-size: 1.2rem; }
      .sparkle { color: var(--color-warning); }
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .message {
      display: flex;
      &.user { justify-content: flex-end; }
      &.assistant { justify-content: flex-start; }
    }
    .bubble {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 0.95rem;
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .user .bubble {
      background: var(--color-primary);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .assistant .bubble {
      background: var(--color-card);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
      border-bottom-left-radius: 4px;
    }
    .typing {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-text-secondary);
      font-style: italic;
    }
    .chat-input-area {
      padding: 16px;
      display: flex;
      gap: 8px;
      background: var(--color-card);
      border-top: 1px solid var(--color-border);
      input {
        flex: 1;
        border: 1px solid var(--color-border);
        border-radius: 24px;
        padding: 0 16px;
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.2s;
        &:focus { border-color: var(--color-primary); }
      }
    }
  `]
})
export class AiChatComponent {
  private agentService = inject(AgentService);
  
  messages = signal<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am the Sahaay AI Coordinator. How can I help you manage operations today?' }
  ]);
  
  currentQuery = '';
  isLoading = signal<boolean>(false);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  async sendMessage() {
    if (!this.currentQuery.trim() || this.isLoading()) return;
    
    const query = this.currentQuery.trim();
    this.currentQuery = '';
    
    // Add user message
    this.messages.update(m => [...m, { role: 'user', content: query }]);
    this.isLoading.set(true);
    this.scrollToBottom();

    try {
      const context = { dashboardState: 'home_view' };
      const response = await this.agentService.queryAssistant(query, context);
      
      this.messages.update(m => [...m, { 
        role: 'assistant', 
        content: typeof response === 'string' ? response : JSON.stringify(response)
      }]);
    } catch (e) {
      console.error('Chat error:', e);
      // Fallback
      this.messages.update(m => [...m, { 
        role: 'assistant', 
        content: "I'm currently unable to reach the reasoning engine. Please ensure Vertex AI endpoints are configured in agents.go."
      }]);
    } finally {
      this.isLoading.set(false);
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
