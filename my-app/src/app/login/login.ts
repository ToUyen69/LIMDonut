import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isLoginMode = signal(true);
  username = signal('');
  email = signal('');
  password = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') {
        this.isLoginMode.set(false);
      } else {
        this.isLoginMode.set(true);
      }
    });
  }

  toggleMode() {
    this.isLoginMode.update(val => !val);
  }

  onSubmit() {
    if (this.isLoginMode()) {
      if (this.username() && this.password()) {
        this.authService.login({
          username: this.username(),
          password: this.password()
        }).subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
          },
          error: (err) => {
            alert(err.error?.message || 'Đăng nhập thất bại!');
          }
        });
      } else {
        alert('Vui lòng nhập đầy đủ thông tin');
      }
    } else {
      if (this.username() && this.email() && this.password()) {
        this.authService.register({
          username: this.username(),
          email: this.email(),
          password: this.password()
        }).subscribe({
          next: () => {
            alert('Đăng ký thành công! Hãy đăng nhập.');
            this.isLoginMode.set(true);
          },
          error: (err) => {
            alert(err.error?.message || 'Đăng ký thất bại!');
          }
        });
      } else {
        alert('Vui lòng nhập đầy đủ thông tin');
      }
    }
  }
}
