import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Branch {
  _id?: string;
  name: string;
  address: string;
  phone: string;
  openHours: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/branches`;

  branches = signal<Branch[]>([]);

  fetchAll() {
    this.http.get<Branch[]>(this.apiUrl).subscribe({
      next: data => this.branches.set(data),
      error: err => console.error('Fetch branches error:', err)
    });
  }

  create(data: Partial<Branch>) {
    return this.http.post<Branch>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Branch>) {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
