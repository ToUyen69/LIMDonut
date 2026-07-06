import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  ordersByStatus: Record<string, number>;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  topProducts: { id: number; name: string; image: string; sold: number; price: string }[];
  pendingComplaints: number;
  unreadContacts: number;
  lowStockProducts: { id: number; name: string; stock: number; image: string }[];
  outOfStockCount: number;
  recentOrders: { orderId: string; customerInfo: { name: string }; totalAmount: number; status: string; createdAt: string }[];
  dailyRevenue: { _id: string; revenue: number; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  stats = signal<DashboardStats | null>(null);
  loading = signal(false);

  fetch() {
    this.loading.set(true);
    this.http.get<DashboardStats>(`${environment.apiBase}/api/orders/stats`).subscribe({
      next: data => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
