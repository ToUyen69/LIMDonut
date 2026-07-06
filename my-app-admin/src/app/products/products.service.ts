import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AdminProduct {
  _id?: string;
  id: number;
  name: string;
  description?: string;
  price: string;
  image?: string;
  categories?: string[];
  sold: number;
  stock: number;
  rating?: number;
  reviews?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/products`;

  products = signal<AdminProduct[]>([]);

  fetchAll() {
    this.http.get<AdminProduct[]>(this.apiUrl).subscribe({
      next: data => this.products.set(data),
      error: err => console.error('Fetch products error:', err)
    });
  }

  update(id: number, data: Partial<AdminProduct>) {
    return this.http.put<AdminProduct>(`${this.apiUrl}/${id}`, data);
  }

  create(data: Partial<AdminProduct>) {
    return this.http.post<AdminProduct>(this.apiUrl, data);
  }

  remove(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
