import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintsService, Complaint } from './complaints.service';
import { AdminAuthService } from '../admin-auth.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, FormsModule],
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.css'
})
export class ComplaintsComponent implements OnInit {
  service = inject(ComplaintsService);
  private auth = inject(AdminAuthService);

  getPhotoUrl(photo: string): string {
    if (!photo) return '';
    if (photo.startsWith('http')) return photo;
    const base = environment.apiBase;
    if (photo.startsWith('/')) return base + photo;
    return base + '/' + photo;
  }

  filter = signal<'all' | 'Chờ xử lý' | 'Đã xử lý'>('all');
  detail = signal<Complaint | null>(null);

  ngOnInit() {
    this.service.fetchAll();
  }

  logout() { this.auth.logout(); }

  get filtered(): Complaint[] {
    const f = this.filter();
    if (f === 'all') return this.service.complaints();
    return this.service.complaints().filter(c => c.status === f);
  }

  countByStatus(status: string): number {
    return this.service.complaints().filter(c => c.status === status).length;
  }

  toggleStatus(c: Complaint) {
    const newStatus = c.status === 'Chờ xử lý' ? 'Đã xử lý' : 'Chờ xử lý';
    this.service.markStatus(c._id, newStatus).subscribe({
      next: () => this.service.fetchAll(),
      error: err => alert(err.error?.message || 'Lỗi cập nhật trạng thái')
    });
  }

  replyText = '';

  openDetail(c: Complaint) {
    this.detail.set(c);
    this.replyText = c.adminReply || '';
  }

  closeDetail() {
    this.detail.set(null);
    this.replyText = '';
  }

  submitResponse(c: Complaint) {
    this.service.markStatus(c._id, 'Đã xử lý', this.replyText).subscribe({
      next: () => {
        this.service.fetchAll();
        this.closeDetail();
      },
      error: err => alert(err.error?.message || 'Lỗi gửi phản hồi')
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('vi-VN');
  }
}
