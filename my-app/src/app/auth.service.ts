import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/auth`;

  private loggedIn = signal<boolean>(localStorage.getItem('isLoggedIn') === 'true');
  private currentUser = signal<any>(this.loadUser());

  readonly isLoggedIn = this.loggedIn.asReadonly();
  readonly user = this.currentUser.asReadonly();

  private loadUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  changePassword(data: any) {
    return this.http.post<any>(`${this.apiUrl}/change-password`, data);
  }

  requestReset(email: string) {
    return this.http.post<any>(`${this.apiUrl}/request-reset`, { email });
  }

  resetPassword(data: { email: string; otp: string; newPassword: string }) {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, data);
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        this.loggedIn.set(true);
        this.currentUser.set(res.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
      })
    );
  }

  updateProfile(data: { phone?: string; address?: string }) {
    return this.http.patch<any>(`${this.apiUrl}/me`, data).pipe(
      tap(res => {
        this.currentUser.set(res);
        localStorage.setItem('user', JSON.stringify(res));
      })
    );
  }

  updateBirthday(birthday: string) {
    return this.http.patch<any>(`${this.apiUrl}/birthday`, { birthday }).pipe(
      tap(res => {
        const u = { ...this.currentUser(), birthday: res.birthday, birthdayUpdateCount: res.birthdayUpdateCount };
        this.currentUser.set(u);
        localStorage.setItem('user', JSON.stringify(u));
      })
    );
  }

  fetchMe() {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        this.currentUser.set(res);
        localStorage.setItem('user', JSON.stringify(res));
      })
    );
  }

  toggleFavorite(productId: number) {
    if (this.isLoggedIn()) {
      return this.http.post<number[]>(`${this.apiUrl}/favorites/toggle`, { productId }).pipe(
        tap(favorites => {
          const u = { ...this.currentUser(), favorites };
          this.currentUser.set(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
      );
    }
    // Guest: localStorage
    const saved: number[] = JSON.parse(localStorage.getItem('guestFavorites') || '[]');
    const idx = saved.indexOf(productId);
    if (idx >= 0) saved.splice(idx, 1); else saved.push(productId);
    localStorage.setItem('guestFavorites', JSON.stringify(saved));
    return null;
  }

  getFavorites(): number[] {
    if (this.isLoggedIn()) {
      return this.currentUser()?.favorites || [];
    }
    return JSON.parse(localStorage.getItem('guestFavorites') || '[]');
  }

  isFavorite(productId: number): boolean {
    return this.getFavorites().includes(productId);
  }

  logout() {
    this.loggedIn.set(false);
    this.currentUser.set(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}
