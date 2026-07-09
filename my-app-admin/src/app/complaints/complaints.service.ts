import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Complaint {
  _id: string;
  orderId: string;
  orderCode: string;
  reason: string;
  description: string;
  photoUrl: string;
  status: string;
  adminReply?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/complaints`;

  complaints = signal<Complaint[]>([]);

  fetchAll() {
    this.http.get<Complaint[]>(this.apiUrl).subscribe({
      next: data => this.complaints.set(data),
      error: err => console.error('Fetch complaints error:', err)
    });
  }

  markStatus(id: string, status: string, adminReply?: string) {
    const body: any = { status };
    if (adminReply !== undefined) body.adminReply = adminReply;
    return this.http.patch<Complaint>(`${this.apiUrl}/${id}/status`, body);
  }
}
