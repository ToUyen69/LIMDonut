import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactMessagesService, ContactMessage } from './contact-messages.service';
import { AdminAuthService } from '../admin-auth.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-contact-messages',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './contact-messages.component.html',
  styleUrl: './contact-messages.component.css'
})
export class ContactMessagesComponent implements OnInit {
  service = inject(ContactMessagesService);
  private auth = inject(AdminAuthService);

  filter = signal<'all' | 'Chưa xử lý' | 'Đã xử lý'>('all');
  detail = signal<ContactMessage | null>(null);

  ngOnInit() {
    this.service.fetchAll();
  }

  logout() { this.auth.logout(); }

  get filtered(): ContactMessage[] {
    const f = this.filter();
    if (f === 'all') return this.service.messages();
    return this.service.messages().filter(m => m.status === f);
  }

  countByStatus(status: string): number {
    return this.service.messages().filter(m => m.status === status).length;
  }

  toggleStatus(msg: ContactMessage) {
    const newStatus = msg.status === 'Chưa xử lý' ? 'Đã xử lý' : 'Chưa xử lý';
    this.service.markStatus(msg._id, newStatus).subscribe({
      next: () => this.service.fetchAll(),
      error: err => alert(err.error?.message || 'Lỗi cập nhật trạng thái')
    });
  }

  openDetail(msg: ContactMessage) { this.detail.set(msg); }
  closeDetail() { this.detail.set(null); }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('vi-VN');
  }
}
