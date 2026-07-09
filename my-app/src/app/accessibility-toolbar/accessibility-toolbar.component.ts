import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accessibility-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="accessibility-widget" [class.expanded]="isOpen()">
      <!-- Toggle Button -->
      <button class="widget-toggle-btn" (click)="toggleOpen()" title="Hỗ trợ tiếp cận">
        <i class="bi bi-person-fill-gear"></i>
      </button>

      <!-- Expandable Panel -->
      <div class="widget-panel" *ngIf="isOpen()">
        <div class="panel-header">
          <span>Hỗ trợ tiếp cận</span>
          <button class="close-btn" (click)="toggleOpen()">&times;</button>
        </div>
        <div class="panel-body">
          <!-- Font Size Adjustment -->
          <div class="setting-item">
            <span class="setting-label">Cỡ chữ ({{ fontPercent() }}%)</span>
            <div class="btn-group-scale">
              <button class="btn-scale" (click)="decreaseFont()" [disabled]="fontScale() <= 0.8">A-</button>
              <button class="btn-scale" (click)="resetFont()">A</button>
              <button class="btn-scale" (click)="increaseFont()" [disabled]="fontScale() >= 1.6">A+</button>
            </div>
          </div>

          <!-- High Contrast Toggle -->
          <div class="setting-item">
            <span class="setting-label">Tương phản cao</span>
            <div class="form-check form-switch m-0">
              <input class="form-check-input" type="checkbox" role="switch" id="contrastSwitch" 
                     [checked]="highContrast()" (change)="toggleHighContrast()">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accessibility-widget {
      position: fixed;
      bottom: 85px;
      right: 20px;
      z-index: 1040;
      font-family: var(--font-primary);
    }
    .widget-toggle-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--color-blue);
      color: white;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      border: none;
      transition: all 0.3s ease;
    }
    .widget-toggle-btn:hover {
      transform: scale(1.05);
      background-color: #5d8e99;
    }
    .widget-panel {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 250px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      overflow: hidden;
      color: var(--text-color);
      animation: slideUp 0.2s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .panel-header {
      padding: 10px 15px;
      background: var(--color-pale-cyan);
      font-weight: 600;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #333;
    }
    :root.dark-mode .panel-header {
      background: #3a4b4f;
      color: #fff;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
      padding: 0;
      line-height: 1;
    }
    .panel-body {
      padding: 15px;
    }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .setting-item:last-child {
      margin-bottom: 0;
    }
    .setting-label {
      font-size: 13px;
      font-weight: 500;
    }
    .btn-group-scale {
      display: flex;
      gap: 4px;
    }
    .btn-scale {
      padding: 3px 8px;
      font-size: 12px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-color);
      font-weight: 600;
      cursor: pointer;
    }
    .btn-scale:hover:not(:disabled) {
      background: var(--color-pale-cyan);
    }
    .btn-scale:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .form-check-input {
      cursor: pointer;
    }
  `]
})
export class AccessibilityToolbarComponent implements OnInit {
  isOpen = signal(false);
  fontScale = signal(1.0);
  highContrast = signal(false);

  fontPercent(): number {
    return Math.round(this.fontScale() * 100);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const widget = document.querySelector('.accessibility-widget');
    if (this.isOpen() && widget && !widget.contains(target)) {
      this.isOpen.set(false);
    }
  }

  toggleOpen() {
    this.isOpen.update(v => !v);
  }

  ngOnInit() {
    // Load config
    const savedScale = localStorage.getItem('fontScale');
    if (savedScale) {
      const scale = parseFloat(savedScale);
      this.fontScale.set(scale);
      this.applyFontScale(scale);
    }

    const savedContrast = localStorage.getItem('highContrast');
    if (savedContrast === 'true') {
      this.highContrast.set(true);
      this.applyHighContrast(true);
    }
  }

  increaseFont() {
    let scale = this.fontScale();
    if (scale < 1.6) {
      scale = Math.min(1.6, scale + 0.2);
      this.updateFontScale(scale);
    }
  }

  decreaseFont() {
    let scale = this.fontScale();
    if (scale > 0.8) {
      scale = Math.max(0.8, scale - 0.2);
      this.updateFontScale(scale);
    }
  }

  resetFont() {
    this.updateFontScale(1.0);
  }

  private updateFontScale(scale: number) {
    this.fontScale.set(scale);
    localStorage.setItem('fontScale', scale.toString());
    this.applyFontScale(scale);
  }

  private applyFontScale(scale: number) {
    document.documentElement.style.setProperty('--user-font-scale', scale.toString());
  }

  toggleHighContrast() {
    const active = !this.highContrast();
    this.highContrast.set(active);
    localStorage.setItem('highContrast', active ? 'true' : 'false');
    this.applyHighContrast(active);
  }

  private applyHighContrast(active: boolean) {
    if (active) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }
}
