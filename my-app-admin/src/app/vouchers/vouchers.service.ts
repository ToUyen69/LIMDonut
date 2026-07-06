import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Voucher {
  _id: string;
  code: string;
  type: 'percent' | 'amount';
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class VouchersService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiBase}/api/vouchers`;

  vouchers = signal<Voucher[]>([]);
  loading = signal(false);

  fetchAll() {
    this.loading.set(true);
    this.http.get<Voucher[]>(this.API).subscribe({
      next: data => { this.vouchers.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  create(data: Partial<Voucher>) {
    return this.http.post<Voucher>(this.API, data);
  }

  toggleActive(id: string, active: boolean) {
    return this.http.patch<Voucher>(`${this.API}/${id}`, { active });
  }
}
