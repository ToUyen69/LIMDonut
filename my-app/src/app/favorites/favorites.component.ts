import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { ProductService, Product } from '../product.service';
import { CartService } from '../cart.service';
import { ImgUrlPipe } from '../img-url.pipe';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ImgUrlPipe],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  authService = inject(AuthService);
  productService = inject(ProductService);
  private cartService = inject(CartService);

  get favoriteProducts(): Product[] {
    const ids = this.authService.getFavorites();
    return this.productService.getProducts().filter(p => ids.includes(p.id));
  }

  removeFavorite(product: Product) {
    const obs = this.authService.toggleFavorite(product.id);
    if (obs) obs.subscribe();
  }

  addToCart(product: Product) {
    if (this.productService.isOutOfStock(product)) {
      alert(`"${product.name}" đã hết hàng hôm nay!`);
      return;
    }
    this.cartService.addToCart(product);
    this.productService.decreaseStock(product.id, 1);
  }
}
