import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiBase}/api/auth`;

  isLoggedIn = signal(!!sessionStorage.getItem('admin_token'));

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password });
  }

  handleLoginSuccess(res: any): string | null {
    if (res.user.role !== 'admin') {
      return 'Tài khoản này không có quyền quản trị.';
    }
    sessionStorage.setItem('admin_token', res.token);
    this.isLoggedIn.set(true);
    return null;
  }

  logout() {
    sessionStorage.removeItem('admin_token');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem('admin_token');
  }
}
