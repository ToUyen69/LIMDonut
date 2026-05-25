import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  authService = inject(AuthService);
  user = this.authService.user;
  
  activeTab = signal('personal'); // 'personal', 'account', 'policy', 'help'

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  logout() {
    this.authService.logout();
  }
}
