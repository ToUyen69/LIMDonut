import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VouchersService, Voucher } from './vouchers.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './vouchers.component.html',
  styleUrl: './vouchers.component.css'
})
export class VouchersComponent implements OnInit {
  service = inject(VouchersService);
  showForm = signal(false);
  saving = signal(false);

  form = {
    code: '',
    type: 'percent' as 'percent' | 'amount',
    value: 0,
    minOrderValue: 0,
    maxDiscount: null as number | null,
    expiresAt: '',
    usageLimit: null as number | null,
  };

  ngOnInit() {
    this.service.fetchAll();
  }

  toggleActive(v: Voucher) {
    this.service.toggleActive(v._id, !v.active).subscribe({
      next: () => this.service.fetchAll(),
      error: err => alert(err.error?.message || 'Lỗi cập nhật')
    });
  }

  resetForm() {
    this.form = { code: '', type: 'percent', value: 0, minOrderValue: 0, maxDiscount: null, expiresAt: '', usageLimit: null };
  }

  createVoucher() {
    if (!this.form.code.trim() || !this.form.value) {
      alert('Vui lòng nhập mã và giá trị giảm.');
      return;
    }
    this.saving.set(true);
    const body: any = { ...this.form };
    if (!body.expiresAt) body.expiresAt = null;
    if (!body.maxDiscount) body.maxDiscount = null;
    if (!body.usageLimit) body.usageLimit = null;
    this.service.create(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.resetForm();
        this.service.fetchAll();
      },
      error: err => {
        this.saving.set(false);
        alert(err.error?.message || 'Lỗi tạo voucher.');
      }
    });
  }

  formatPrice(n: number): string {
    return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN');
  }

  isExpired(d: string | null): boolean {
    if (!d) return false;
    return new Date(d) < new Date();
  }
}
