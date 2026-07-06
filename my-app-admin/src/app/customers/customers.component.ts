import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomersService, Customer } from './customers.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  service = inject(CustomersService);
  search = signal('');
  starModal = signal<Customer | null>(null);
  starAmount = 0;
  starReason = '';

  ngOnInit() { this.service.fetchAll(); }

  get filtered(): Customer[] {
    const term = this.search().trim().toLowerCase();
    const list = this.service.customers();
    if (!term) return list;
    return list.filter(c => c.username.toLowerCase().includes(term) || c.email.toLowerCase().includes(term));
  }

  toggleActive(c: Customer) {
    this.service.toggleActive(c._id).subscribe({
      next: res => { c.active = res.active; },
      error: err => alert(err.error?.message || 'Lỗi')
    });
  }

  openStarModal(c: Customer) {
    this.starModal.set(c);
    this.starAmount = 0;
    this.starReason = '';
  }

  submitStars() {
    const c = this.starModal();
    if (!c || !this.starAmount || !this.starReason.trim()) { alert('Nhập số sao và lý do.'); return; }
    this.service.adjustStars(c._id, this.starAmount, this.starReason.trim()).subscribe({
      next: res => { c.stars = res.stars; this.starModal.set(null); },
      error: err => alert(err.error?.message || 'Lỗi')
    });
  }

  formatDate(d: string): string { return new Date(d).toLocaleDateString('vi-VN'); }
}
