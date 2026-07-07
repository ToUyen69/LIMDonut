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
  @ViewChild('donutChartCanvas') donutChartCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.service.fetch();
  }

  ngAfterViewInit() {
    const check = setInterval(() => {
      if (this.service.stats() && this.chartCanvas && this.donutChartCanvas) {
        clearInterval(check);
        this.drawChart();
        this.drawDonutChart();
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

    const padL = 70, padR = 20, padT = 30, padB = 40;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#eef2f5';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 11px Montserrat';
      ctx.textAlign = 'right';
      const label = this.formatPrice(Math.round(maxVal * (4 - i) / 4));
      ctx.fillText(label, padL - 10, y + 4);
    }

    const gap = chartW / (days.length - 1 || 1);
    const points: { x: number; y: number }[] = [];
    values.forEach((v, i) => {
      const valH = (v / maxVal) * chartH;
      const x = padL + gap * i;
      const y = padT + chartH - valH;
      points.push({ x, y });
    });

    // Draw area gradient
    const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    areaGrad.addColorStop(0, 'rgba(113, 172, 208, 0.35)');
    areaGrad.addColorStop(1, 'rgba(113, 172, 208, 0.01)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padT + chartH);
    points.forEach((p, i) => {
      if (i === 0) {
        ctx.lineTo(p.x, p.y);
      } else {
        const prev = points[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        ctx.bezierCurveTo(cpX1, prev.y, cpX1, p.y, p.x, p.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, padT + chartH);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#71acd0';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        const prev = points[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        ctx.bezierCurveTo(cpX1, prev.y, cpX1, p.y, p.x, p.y);
      }
    });
    ctx.stroke();

    // Draw dots
    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#71acd0';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Day label
      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px Montserrat';
      ctx.textAlign = 'center';
      const parts = days[i].split('-');
      const dayLabel = `${parts[2]}/${parts[1]}`;
      ctx.fillText(dayLabel, p.x, h - 12);
    });
  }

  private drawDonutChart() {
    if (!this.donutChartCanvas) return;
    const canvas = this.donutChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Sales breakdown by category using brand colors
    const data = [
      { name: 'Donut Men', value: 45, color: '#71acd0' },
      { name: 'Nhân Kem', value: 30, color: '#a5c2cb' },
      { name: 'Mochi Donut', value: 15, color: '#ddd170' },
      { name: 'Custom Party', value: 10, color: '#b9dbe2' }
    ];

    const centerX = w / 2;
    const centerY = h / 2;
    const outerRadius = Math.min(w, h) / 2 - 15;
    const innerRadius = outerRadius * 0.65;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = -Math.PI / 2;

    data.forEach(item => {
      const sliceAngle = (item.value / total) * (Math.PI * 2);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Inner circle hole overlay to look crisp
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px Montserrat';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('100%', centerX, centerY - 8);
    ctx.font = '600 10px Montserrat';
    ctx.fillStyle = '#64748b';
    ctx.fillText('TỔNG SỐ', centerX, centerY + 10);
  }
}
