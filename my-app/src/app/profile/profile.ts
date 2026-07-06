import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  authService = inject(AuthService);
  user = this.authService.user;
  
  activeTab = signal('personal');

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  get stars(): number {
    return this.user()?.stars || 0;
  }

  get tier(): { name: string; icon: string; color: string } {
    const s = this.stars;
    if (s >= 500_000) return { name: 'Kim Cương', icon: 'bi-gem', color: '#b9f2ff' };
    if (s >= 200_000) return { name: 'Vàng', icon: 'bi-award-fill', color: '#ffd700' };
    if (s >= 50_000) return { name: 'Bạc', icon: 'bi-award', color: '#c0c0c0' };
    return { name: 'Thành viên', icon: 'bi-person-fill', color: '#adb5bd' };
  }

  get nextTier(): { name: string; need: number } | null {
    const s = this.stars;
    if (s >= 500_000) return null;
    if (s >= 200_000) return { name: 'Kim Cương', need: 500_000 - s };
    if (s >= 50_000) return { name: 'Vàng', need: 200_000 - s };
    return { name: 'Bạc', need: 50_000 - s };
  }

  editing = signal(false);
  editPhone = signal('');
  editAddress = signal('');
  saving = signal(false);
  saveMsg = signal('');

  startEdit() {
    this.editPhone.set(this.user()?.phone || '');
    this.editAddress.set(this.user()?.address || '');
    this.editing.set(true);
    this.saveMsg.set('');
  }

  cancelEdit() {
    this.editing.set(false);
  }

  saveProfile() {
    this.saving.set(true);
    this.authService.updateProfile({ phone: this.editPhone(), address: this.editAddress() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.saveMsg.set('Cập nhật thành công!');
        setTimeout(() => this.saveMsg.set(''), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.saveMsg.set('Lỗi khi cập nhật!');
      }
    });
  }

  // ---- Ngày sinh (tối đa đổi 2 lần) ----
  editBirthday = signal('');
  birthdayMsg = signal('');

  get birthdayChangesLeft(): number {
    return Math.max(0, 2 - (this.user()?.birthdayUpdateCount || 0));
  }

  get birthdayDisplay(): string {
    const b = this.user()?.birthday;
    if (!b) return '';
    const d = new Date(b);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  saveBirthday() {
    if (!this.editBirthday()) return;
    this.authService.updateBirthday(this.editBirthday()).subscribe({
      next: () => {
        this.editBirthday.set('');
        this.birthdayMsg.set('Cập nhật ngày sinh thành công!');
        setTimeout(() => this.birthdayMsg.set(''), 3000);
      },
      error: (err: any) => {
        this.birthdayMsg.set(err.error?.message || 'Lỗi khi cập nhật ngày sinh!');
      }
    });
  }

  // ---- Mã giới thiệu ----
  copied = signal(false);

  copyReferralCode() {
    const code = this.user()?.referralCode;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  logout() {
    this.authService.logout();
  }
}
