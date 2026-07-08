import { Component, signal, ViewEncapsulation, inject, computed, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CartService } from './cart.service';
import { CommonModule } from '@angular/common';

import { AuthService } from './auth.service';
import { TasteQuizComponent } from './taste-quiz/taste-quiz.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, TasteQuizComponent],
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
  readonly isMenuOpen = signal(false);
  readonly isPaymentPage = signal(false);

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
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.isMenuOpen.set(false);
        this.isPaymentPage.set(this.router.url.includes('/payment/'));
      }
    });

    if (this.authService.isLoggedIn()) {
      this.authService.fetchMe().subscribe({ error: () => {} });
    }
    effect(() => {
      if (this.cartCount() > 0) {
        this.cartAnimation.set(true);
        setTimeout(() => this.cartAnimation.set(false), 500);
      }
    });

    // Show location request pop-up on first load
    setTimeout(() => {
      const storedLoc = sessionStorage.getItem('userGeoLocation');
      const hasSeenPopup = sessionStorage.getItem('hasSeenGeoLocationPopup');
      if (!storedLoc && !hasSeenPopup) {
        this.showGeoModal.set(true);
      }
    }, 1500);
  }

  readonly showGeoModal = signal(false);

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  allowGeolocation() {
    this.showGeoModal.set(false);
    sessionStorage.setItem('hasSeenGeoLocationPopup', 'true');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            sessionStorage.setItem('userGeoLocation', JSON.stringify({ lat, lng }));
            this.cartService.showNotification("Định vị thành công! Đã tự động chọn chi nhánh gần nhất cho bạn.");
          } catch (_) {}
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }

  closeGeoModal() {
    this.showGeoModal.set(false);
    sessionStorage.setItem('hasSeenGeoLocationPopup', 'true');
  }
}
