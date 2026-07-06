import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Customer {
  _id: string;
  username: string;
  email: string;
  phone: string;
  stars: number;
  avatar: string;
  active: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/users`;

  customers = signal<Customer[]>([]);

  fetchAll() {
    this.http.get<Customer[]>(this.apiUrl).subscribe({
      next: data => this.customers.set(data),
      error: err => console.error('Fetch customers error:', err)
    });
  }

  adjustStars(id: string, amount: number, reason: string) {
    return this.http.patch<{ stars: number }>(`${this.apiUrl}/${id}/stars`, { amount, reason });
  }

  toggleActive(id: string) {
    return this.http.patch<{ active: boolean }>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
