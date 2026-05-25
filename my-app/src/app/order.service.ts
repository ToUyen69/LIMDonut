import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface Order {
  _id?: string;
  orderId: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    deliveryTime: string;
    notes: string;
  };
  items: any[];
  totalAmount: number;
  status: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:3000/api/orders';

  private ordersSignal = signal<Order[]>([]);
  readonly orders = this.ordersSignal.asReadonly();

  constructor() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.http.get<Order[]>(this.apiUrl).subscribe(orders => {
      this.ordersSignal.set(orders);
    });
  }

  addOrder(order: Order) {
    return this.http.post<Order>(this.apiUrl, order).pipe(
      tap(newOrder => {
        this.ordersSignal.update(orders => [newOrder, ...orders]);
      })
    );
  }
}
