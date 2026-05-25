import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  authService = inject(AuthService);
  router = inject(Router);

  username = signal('');
  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  onSubmit() {
    const usernameVal = this.username().trim();
    const oldPasswordVal = this.oldPassword().trim();
    const newPasswordVal = this.newPassword().trim();
    const confirmPasswordVal = this.confirmPassword().trim();

    if (!usernameVal || !oldPasswordVal || !newPasswordVal || !confirmPasswordVal) {
      alert('Vui lòng nhập đầy đủ tất cả thông tin!');
      return;
    }

    if (newPasswordVal !== confirmPasswordVal) {
      alert('Mật khẩu mới và xác nhận mật khẩu mới không khớp!');
      return;
    }

    this.authService.forgotPassword({
      username: usernameVal,
      oldPassword: oldPasswordVal,
      newPassword: newPasswordVal
    }).subscribe({
      next: (res) => {
        alert(res.message || 'Thay đổi mật khẩu thành công!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err.error?.message || 'Đổi mật khẩu thất bại!');
      }
    });
  }
}
