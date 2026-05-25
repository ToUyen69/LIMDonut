import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:3000/api/auth';

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

  forgotPassword(data: any) {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, data);
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

  logout() {
    this.loggedIn.set(false);
    this.currentUser.set(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}
