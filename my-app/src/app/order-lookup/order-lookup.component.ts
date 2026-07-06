import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../order.service';

@Component({
  selector: 'app-order-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-lookup.component.html',
  styleUrl: './order-lookup.component.css',
})
export class OrderLookupComponent {
  private orderService = inject(OrderService);

  phone = signal('');
  name = signal('');
  results = signal<Order[]>([]);
  searched = signal(false);
  loading = signal(false);

  search() {
    const phone = this.phone().trim();
    const name = this.name().trim();
    if (!phone || !name) return;
    this.loading.set(true);
    this.orderService.lookupOrders(phone, name).subscribe({
      next: orders => { this.results.set(orders); this.searched.set(true); this.loading.set(false); },
      error: () => { this.results.set([]); this.searched.set(true); this.loading.set(false); },
    });
  }

  canCancel(order: any): boolean {
    if (['Đã hủy', 'Hoàn thành', 'Đã hoàn tiền', 'Giao thất bại', 'Không tới lấy', 'Thanh toán thất bại'].includes(order.status)) return false;
    if (order.orderType === 'custom') {
      return order.cancelDeadline ? new Date() < new Date(order.cancelDeadline) : false;
    }
    return order.status === 'Đã đặt';
  }

  cancelOrder(id: string) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Tiền cọc (nếu có) sẽ KHÔNG được hoàn.')) return;
    this.orderService.cancelOrder(id).subscribe({
      next: () => this.search(),
      error: (err) => alert(err.error?.message || 'Không thể hủy đơn hàng.')
    });
  }

  formatPrice(price: number): string {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ' : '0đ';
  }
}
