import { Component, inject, OnInit, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  service = inject(DashboardService);
  imageBase = environment.apiBase + '/';
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.service.fetch();
  }

  ngAfterViewInit() {
    const check = setInterval(() => {
      if (this.service.stats() && this.chartCanvas) {
        clearInterval(check);
        this.drawChart();
      }
    }, 200);
    setTimeout(() => clearInterval(check), 10000);
  }

  get stats() { return this.service.stats(); }

  get activeOrders(): number {
    if (!this.stats) return 0;
    const terminal = ['Hoàn thành', 'Đã hủy', 'Đã hoàn tiền'];
    return Object.entries(this.stats.ordersByStatus)
      .filter(([k]) => !terminal.includes(k))
      .reduce((sum, [, v]) => sum + v, 0);
  }

  formatPrice(n: number): string {
    return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('vi-VN');
  }

  private drawChart() {
    const stats = this.stats;
    if (!stats || !this.chartCanvas) return;

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const days: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(d.toISOString().split('T')[0]);
    }

    const dataMap: Record<string, number> = {};
    stats.dailyRevenue.forEach(d => dataMap[d._id] = d.revenue);
    const values = days.map(d => dataMap[d] || 0);
    const maxVal = Math.max(...values, 1);

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const padL = 70, padR = 20, padT = 20, padB = 40;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = '#999';
      ctx.font = '11px Montserrat';
      ctx.textAlign = 'right';
      const label = this.formatPrice(Math.round(maxVal * (4 - i) / 4));
      ctx.fillText(label, padL - 8, y + 4);
    }

    // Bars
    const barW = Math.min(chartW / days.length * 0.6, 40);
    const gap = chartW / days.length;

    values.forEach((v, i) => {
      const barH = (v / maxVal) * chartH;
      const x = padL + gap * i + (gap - barW) / 2;
      const y = padT + chartH - barH;

      const grad = ctx.createLinearGradient(x, y, x, padT + chartH);
      grad.addColorStop(0, '#71acd0');
      grad.addColorStop(1, '#b9dbe2');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Day label
      ctx.fillStyle = '#666';
      ctx.font = '11px Montserrat';
      ctx.textAlign = 'center';
      const dayLabel = days[i].slice(5);
      ctx.fillText(dayLabel, padL + gap * i + gap / 2, h - 10);
    });
  }
}
