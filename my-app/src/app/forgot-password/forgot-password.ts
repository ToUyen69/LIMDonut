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

  step = signal<1 | 2>(1);
  email = signal('');
  otp = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  showOtpPopup = signal(false);
  otpCode = signal('');

  requestOtp() {
    const emailVal = this.email().trim();
    if (!emailVal) { alert('Vui lòng nhập email!'); return; }
    this.loading.set(true);
    this.authService.requestReset(emailVal).subscribe({
      next: (res: any) => {
        this.otpCode.set(res.otp || '');
        this.showOtpPopup.set(true);
        this.step.set(2);
        this.loading.set(false);
      },
      error: (err) => {
        alert(err.error?.message || 'Không tìm thấy email!');
        this.loading.set(false);
      }
    });
  }

  closeOtpPopup() {
    this.showOtpPopup.set(false);
  }

  copyOtp() {
    navigator.clipboard.writeText(this.otpCode());
    this.closeOtpPopup();
  }

  resetPassword() {
    const otpVal = this.otp().trim();
    const newPwd = this.newPassword().trim();
    const confirmPwd = this.confirmPassword().trim();
    if (!otpVal || !newPwd || !confirmPwd) { alert('Vui lòng điền đầy đủ thông tin!'); return; }
    if (newPwd !== confirmPwd) { alert('Mật khẩu mới và xác nhận không khớp!'); return; }
    this.loading.set(true);
    this.authService.resetPassword({ email: this.email(), otp: otpVal, newPassword: newPwd }).subscribe({
      next: (res) => {
        alert(res.message || 'Đặt lại mật khẩu thành công!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err.error?.message || 'Đặt lại mật khẩu thất bại!');
        this.loading.set(false);
      }
    });
  }
}
