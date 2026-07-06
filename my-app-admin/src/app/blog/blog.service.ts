import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface BlogPost {
  _id?: string;
  id: string;
  title: string;
  date: string;
  mainImage: string;
  detailImages: string[];
  content: string;
  excerpt: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/blog`;

  posts = signal<BlogPost[]>([]);

  fetchAll() {
    this.http.get<BlogPost[]>(this.apiUrl).subscribe({
      next: data => this.posts.set(data),
      error: err => console.error('Fetch blog error:', err)
    });
  }

  create(data: Partial<BlogPost>) {
    return this.http.post<BlogPost>(this.apiUrl, data);
  }

  update(id: string, data: Partial<BlogPost>) {
    return this.http.put<BlogPost>(`${this.apiUrl}/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File) {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<{ url: string }>(`${environment.apiBase}/api/upload`, fd);
  }
}
