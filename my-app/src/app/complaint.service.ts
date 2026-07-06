import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface Complaint {
  _id?: string;
  orderId: string;
  orderCode: string;
  reason: string;
  description: string;
  photoUrl: string;
  status: 'Chờ xử lý' | 'Đã xử lý';
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/complaints`;

  postComplaint(data: { orderId: string; reason: string; description?: string; photoUrl?: string }) {
    return this.http.post<Complaint>(this.apiUrl, data);
  }

  uploadPhoto(file: File) {
    const form = new FormData();
    form.append('photo', file);
    return this.http.post<{ url: string }>(`${environment.apiBase}/api/upload`, form);
  }
}
