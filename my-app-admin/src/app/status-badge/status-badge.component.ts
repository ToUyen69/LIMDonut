import { Component, Input } from '@angular/core';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'Đã đặt': { bg: '#e3f2fd', color: '#1565c0' },
  'Đã xác nhận': { bg: '#e8f5e9', color: '#2e7d32' },
  'Đang chuẩn bị': { bg: '#fff3e0', color: '#e65100' },
  'Đã đóng gói': { bg: '#f3e5f5', color: '#7b1fa2' },
  'Đang giao': { bg: '#e0f7fa', color: '#00838f' },
  'Sẵn sàng lấy': { bg: '#fce4ec', color: '#c2185b' },
  'Hoàn thành': { bg: '#e8f5e9', color: '#1b5e20' },
  'Đã hủy': { bg: '#ffebee', color: '#c62828' },
  'Đã hoàn tiền': { bg: '#fce4ec', color: '#ad1457' },
  'Giao thất bại': { bg: '#ffebee', color: '#b71c1c' },
  'Không tới lấy': { bg: '#fff8e1', color: '#f57f17' },
  'Thanh toán thất bại': { bg: '#ffebee', color: '#c62828' },
  'Chờ xử lý': { bg: '#fff3e0', color: '#e65100' },
  'Đã xử lý': { bg: '#e8f5e9', color: '#2e7d32' },
  'Chưa xử lý': { bg: '#fff3e0', color: '#e65100' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge" [style.background]="bg" [style.color]="textColor">{{ status }}</span>`,
  styles: [`.status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }`]
})
export class StatusBadgeComponent {
  @Input() status = '';

  get bg() { return STATUS_COLORS[this.status]?.bg || '#f5f5f5'; }
  get textColor() { return STATUS_COLORS[this.status]?.color || '#616161'; }
}
