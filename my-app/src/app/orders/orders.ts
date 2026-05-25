import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  orderService = inject(OrderService);
  
  selectedStatus = signal<string>('all');

  filteredOrders = computed(() => {
    const status = this.selectedStatus();
    const allOrders = this.orderService.orders();
    
    if (status === 'all') return allOrders;
    return allOrders.filter(o => o.status === status);
  });

  statusCounts = computed(() => {
    const allOrders = this.orderService.orders();
    return {
      all: allOrders.length,
      pending: allOrders.filter(o => o.status === 'Chờ xác nhận').length,
      preparing: allOrders.filter(o => o.status === 'Chuẩn bị').length,
      shipping: allOrders.filter(o => o.status === 'Đang giao').length,
      completed: allOrders.filter(o => o.status === 'Hoàn thành').length
    };
  });

  formatPrice(price: number): string {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ' : '0đ';
  }

  cancelOrder(id: string) {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      // TODO: Implement cancelOrder in OrderService
      alert('Chức năng đang được cập nhật!');
    }
  }
}
