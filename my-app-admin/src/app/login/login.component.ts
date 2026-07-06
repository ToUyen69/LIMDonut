import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class AdminLoginComponent {
  private auth = inject(AdminAuthService);
  private router = inject(Router);

  username = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  login() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.username(), this.password()).subscribe({
      next: (res) => {
        const err = this.auth.handleLoginSuccess(res);
        if (err) {
          this.error.set(err);
          this.loading.set(false);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Đăng nhập thất bại.');
        this.loading.set(false);
      }
    });
  }
}
