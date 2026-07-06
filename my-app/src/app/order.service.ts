import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface Order {
  _id?: string;
  orderId: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    deliveryTime: string;
    notes: string;
    isGift?: boolean;
    giftMessage?: string;
    hideGiftPrice?: boolean;
  };
  items: any[];
  totalAmount: number;
  orderType?: string;
  depositPercent?: number;
  depositAmount?: number;
  remainingAmount?: number;
  deliveryMethod?: string;
  status: string;
  statusHistory?: { status: string; at: string }[];
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiBase}/api/orders`;

  private ordersSignal = signal<Order[]>([]);
  readonly orders = this.ordersSignal.asReadonly();

  fetchOrders() {
    if (!this.auth.isLoggedIn()) {
      this.ordersSignal.set([]);
      return;
    }
    this.http.get<Order[]>(`${this.apiUrl}?mine=true`).subscribe({
      next: orders => this.ordersSignal.set(orders),
      error: () => this.ordersSignal.set([]),
    });
  }

  lookupOrders(phone: string, name: string) {
    return this.http.get<Order[]>(`${this.apiUrl}/lookup`, { params: { phone, name } });
  }

  cancelOrder(id: string) {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  addOrder(order: Order) {
    return this.http.post<Order>(this.apiUrl, order).pipe(
      tap(newOrder => {
        this.ordersSignal.update(orders => [newOrder, ...orders]);
      })
    );
  }
}
