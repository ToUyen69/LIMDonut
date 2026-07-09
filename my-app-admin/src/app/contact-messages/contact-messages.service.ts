import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ContactMessage {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  branch: string;
  subject: string;
  message: string;
  status: string;
  adminReply?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactMessagesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/contact`;

  messages = signal<ContactMessage[]>([]);

  fetchAll() {
    this.http.get<ContactMessage[]>(this.apiUrl).subscribe({
      next: data => this.messages.set(data),
      error: err => console.error('Fetch contact messages error:', err)
    });
  }

  markStatus(id: string, status: string, adminReply?: string) {
    const body: any = { status };
    if (adminReply !== undefined) body.adminReply = adminReply;
    return this.http.patch<ContactMessage>(`${this.apiUrl}/${id}/status`, body);
  }
}
