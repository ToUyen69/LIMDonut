import { Component, inject, OnInit, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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

  // Interactive Chart Points
  private chartPoints: { x: number; y: number; label: string; value: number }[] = [];
  activeTooltip: typeof this.chartPoints[0] | null = null;

  // Interactive Donut Slice State
  activeDonutTooltip: { name: string; value: number; percent: number } | null = null;

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

  // Dynamic calculation of categories based on actual database sales
  get donutSlicesInfo() {
    const stats = this.stats;
    if (!stats) return [];

    const sales = stats.categorySales || {};
    let rawData = Object.entries(sales)
      .map(([name, value]) => ({ name, value: value as number }))
      .filter(item => item.value > 0);

    // Sort descending by sold count
    rawData.sort((a, b) => b.value - a.value);

    const colors = ['#71acd0', '#a5c2cb', '#ddd170', '#b9dbe2', '#daefee'];
    const total = rawData.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
      // Fallback matching LỊM Donut categories
      return [
        { name: 'Nguyên Bản', value: 0, color: '#71acd0', percent: 45 },
        { name: 'Mochi', value: 0, color: '#a5c2cb', percent: 30 },
        { name: 'Món mới', value: 0, color: '#ddd170', percent: 15 },
        { name: 'Khác', value: 0, color: '#b9dbe2', percent: 10 }
      ];
    }

    if (rawData.length > 4) {
      const topThree = rawData.slice(0, 3).map((item, index) => ({
        name: item.name,
        value: item.value,
        color: colors[index],
        percent: Math.round((item.value / total) * 100)
      }));

      const othersValue = rawData.slice(3).reduce((sum, item) => sum + item.value, 0);
      topThree.push({
        name: 'Khác',
        value: othersValue,
        color: colors[3],
        percent: Math.round((othersValue / total) * 100)
      });

      return topThree;
    } else {
      return rawData.map((item, index) => ({
        name: item.name,
        value: item.value,
        color: colors[index % colors.length],
        percent: Math.round((item.value / total) * 100)
      }));
    }
  }

  formatPrice(n: number): string {
    return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('vi-VN');
  }

  onChartMouseMove(event: MouseEvent) {
    if (!this.chartCanvas) return;
    const canvas = this.chartCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let nearest: typeof this.activeTooltip = null;
    let minDist = 25;

    this.chartPoints.forEach(p => {
      const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    });

    if (JSON.stringify(nearest) !== JSON.stringify(this.activeTooltip)) {
      this.activeTooltip = nearest;
      this.drawChart();
    }
  }

  onChartMouseLeave() {
    if (this.activeTooltip) {
      this.activeTooltip = null;
      this.drawChart();
    }
  }

  onDonutMouseMove(event: MouseEvent) {
    if (!this.donutChartCanvas) return;
    const canvas = this.donutChartCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const dist = Math.hypot(dx, dy);

    const outerRadius = Math.min(canvas.clientWidth, canvas.clientHeight) / 2 - 15;
    const innerRadius = outerRadius * 0.65;

    let hoveredSlice: typeof this.activeDonutTooltip = null;

    if (dist >= innerRadius && dist <= outerRadius) {
      let angle = Math.atan2(dy, dx);
      if (angle < -Math.PI / 2) {
        angle += Math.PI * 2;
      }

      // Reconstruct slices mapping dynamically
      const slices = this.donutSlicesInfo;
      const totalPercent = slices.reduce((sum, s) => sum + s.percent, 0) || 100;
      
      let currentAngle = -Math.PI / 2;
      for (const slice of slices) {
        const sliceAngle = (slice.percent / totalPercent) * (Math.PI * 2);
        const endAngle = currentAngle + sliceAngle;
        
        if (angle >= currentAngle && angle <= endAngle) {
          hoveredSlice = {
            name: slice.name,
            value: slice.value,
            percent: slice.percent
          };
          break;
        }
        currentAngle = endAngle;
      }
    }

    if (JSON.stringify(hoveredSlice) !== JSON.stringify(this.activeDonutTooltip)) {
      this.activeDonutTooltip = hoveredSlice;
      this.drawDonutChart();
    }
  }

  onDonutMouseLeave() {
    if (this.activeDonutTooltip) {
      this.activeDonutTooltip = null;
      this.drawDonutChart();
    }
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
    this.chartPoints = values.map((v, i) => {
      const valH = (v / maxVal) * chartH;
      const x = padL + gap * i;
      const y = padT + chartH - valH;
      const parts = days[i].split('-');
      return { x, y, label: `${parts[2]}/${parts[1]}`, value: v };
    });

    // Draw area gradient
    const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    areaGrad.addColorStop(0, 'rgba(113, 172, 208, 0.35)');
    areaGrad.addColorStop(1, 'rgba(113, 172, 208, 0.01)');

    ctx.beginPath();
    ctx.moveTo(this.chartPoints[0].x, padT + chartH);
    this.chartPoints.forEach((p, i) => {
      if (i === 0) {
        ctx.lineTo(p.x, p.y);
      } else {
        const prev = this.chartPoints[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        ctx.bezierCurveTo(cpX1, prev.y, cpX1, p.y, p.x, p.y);
      }
    });
    ctx.lineTo(this.chartPoints[this.chartPoints.length - 1].x, padT + chartH);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#71acd0';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    this.chartPoints.forEach((p, i) => {
      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        const prev = this.chartPoints[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        ctx.bezierCurveTo(cpX1, prev.y, cpX1, p.y, p.x, p.y);
      }
    });
    ctx.stroke();

    // Draw dots
    this.chartPoints.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#71acd0';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Day label
      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, h - 12);
    });

    // Draw interactive tooltip
    if (this.activeTooltip) {
      const t = this.activeTooltip;
      
      // Draw vertical indicator line
      ctx.strokeStyle = 'rgba(113, 172, 208, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(t.x, padT);
      ctx.lineTo(t.x, padT + chartH);
      ctx.stroke();
      ctx.setLineDash([]); 

      // Highlight active dot
      ctx.beginPath();
      ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(113, 172, 208, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#71acd0';
      ctx.fill();

      // Tooltip Box
      const text = this.formatPrice(t.value);
      ctx.font = 'bold 11px Montserrat';
      const textW = ctx.measureText(text).width + 20;
      const boxW = Math.max(textW, 70);
      const boxH = 36;
      let boxX = t.x - boxW / 2;
      let boxY = t.y - boxH - 10;

      if (boxX < padL) boxX = padL;
      if (boxX + boxW > w - padR) boxX = w - padR - boxW;
      if (boxY < padT) boxY = t.y + 10;

      // Draw box
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Texts
      ctx.fillStyle = '#64748b';
      ctx.font = '600 9px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillText(t.label, boxX + boxW / 2, boxY + 13);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px Montserrat';
      ctx.fillText(text, boxX + boxW / 2, boxY + 27);
    }
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

    const centerX = w / 2;
    const centerY = h / 2;
    const outerRadius = Math.min(w, h) / 2 - 15;
    const innerRadius = outerRadius * 0.65;

    const slices = this.donutSlicesInfo;
    const totalPercent = slices.reduce((sum, s) => sum + s.percent, 0) || 100;

    let startAngle = -Math.PI / 2;

    slices.forEach(slice => {
      const sliceAngle = (slice.percent / totalPercent) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      // Draw Slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Inner circle cutout
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Text details inside center
    if (this.activeDonutTooltip) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px Montserrat';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${this.activeDonutTooltip.percent}%`, centerX, centerY - 12);
      
      ctx.font = '600 9px Montserrat';
      ctx.fillStyle = '#64748b';
      
      // Handle display of name safely
      let displayName = this.activeDonutTooltip.name;
      if (displayName.length > 12) displayName = displayName.slice(0, 10) + '...';
      ctx.fillText(displayName, centerX, centerY + 3);
      
      ctx.font = 'bold 9px Montserrat';
      ctx.fillStyle = '#71acd0';
      ctx.fillText(`${this.activeDonutTooltip.value} cái`, centerX, centerY + 14);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Montserrat';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('100%', centerX, centerY - 8);
      ctx.font = '600 9px Montserrat';
      ctx.fillStyle = '#64748b';
      ctx.fillText('TỔNG SỐ', centerX, centerY + 10);
    }
  }
}
