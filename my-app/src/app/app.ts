import { Component, signal, ViewEncapsulation, inject, computed, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from './cart.service';
import { CommonModule } from '@angular/common';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  encapsulation: ViewEncapsulation.None
})
export class App {
  protected readonly title = signal('my-app');
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Auth state
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly user = this.authService.user;
  
  // Cart signals
  readonly cartTotal = this.cartService.totalPrice;
  readonly cartCount = this.cartService.totalItems;
  readonly notification = this.cartService.notification;
  
  // UI state
  readonly showUserMenu = signal(false);
  readonly showLogoutModal = signal(false);
  readonly cartAnimation = signal(false);

  logout() {
    this.showLogoutModal.set(true);
    this.showUserMenu.set(false);
  }

  confirmLogout() {
    this.authService.logout();
    this.showLogoutModal.set(false);
    this.router.navigate(['/']);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  constructor() {
    effect(() => {
      // Trigger animation when count changes
      if (this.cartCount() > 0) {
        this.cartAnimation.set(true);
        setTimeout(() => this.cartAnimation.set(false), 500);
      }
    });
  }

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }
}
