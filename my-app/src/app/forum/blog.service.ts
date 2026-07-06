import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  mainImage: string;
  detailImages: string[];
  content: string;
  excerpt: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/blog`;

  getPosts(): BlogPost[] {
    return [];
  }

  getPostById(id: string): BlogPost | undefined {
    return undefined;
  }

  fetchPosts() {
    return this.http.get<BlogPost[]>(this.apiUrl);
  }

  fetchPostById(id: string) {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }
}
