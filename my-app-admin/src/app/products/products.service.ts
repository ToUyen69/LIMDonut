import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Topping { name: string; price: string; }

export interface FlashSale {
  discountPercent: number;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

export interface AdminProduct {
  _id?: string;
  id: number;
  name: string;
  description?: string;
  price: string;
  basePrice?: string;
  image?: string;
  categories?: string[];
  labels?: string[];
  dietary?: string[];
  allergens?: string[];
  nutrition?: { calories: number; sugar: number; fat: number; protein: number; };
  toppings?: Topping[];
  flashSale?: FlashSale | null;
  sold: number;
  stock: number;
  rating?: number;
  reviews?: string;
}

export interface Category {
  _id?: string;
  name: string;
  icon: string;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/products`;
  private catUrl = `${environment.apiBase}/api/categories`;

  products = signal<AdminProduct[]>([]);
  categories = signal<Category[]>([]);

  fetchAll() {
    this.http.get<AdminProduct[]>(this.apiUrl).subscribe({
      next: data => this.products.set(data),
      error: err => console.error('Fetch products error:', err)
    });
  }

  fetchCategories() {
    this.http.get<Category[]>(this.catUrl).subscribe({
      next: data => this.categories.set(data),
      error: err => console.error('Fetch categories error:', err)
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

  createCategory(data: Partial<Category>) {
    return this.http.post<Category>(this.catUrl, data);
  }

  updateCategory(id: string, data: Partial<Category>) {
    return this.http.put<Category>(`${this.catUrl}/${id}`, data);
  }

  deleteCategory(id: string) {
    return this.http.delete(`${this.catUrl}/${id}`);
  }

  uploadImage(file: File) {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<{ url: string }>(`${environment.apiBase}/api/upload`, fd);
  }
}
