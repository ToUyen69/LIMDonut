import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface Review {
  _id?: string;
  productId: number;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/reviews`;

  addReview(data: { productId: number; rating: number; comment: string }) {
    return this.http.post<Review>(this.apiUrl, data);
  }

  getReviews(productId: number) {
    return this.http.get<Review[]>(`${this.apiUrl}/${productId}`);
  }
}
