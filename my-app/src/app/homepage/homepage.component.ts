import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CartService } from '../cart.service';
import { ProductService, Product } from '../product.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private router = inject(Router);
  private productService = inject(ProductService);

  // Giờ vàng
  readonly flashTick = signal(0);
  private flashTimer: any = null;

  ngOnInit() {
    this.flashTimer = setInterval(() => this.flashTick.update(v => v + 1), 1000);
  }

  ngOnDestroy() {
    if (this.flashTimer) clearInterval(this.flashTimer);
  }

  get activeFlashProduct(): Product | null {
    this.flashTick();
    return this.productService.getProducts().find(p => this.productService.isFlashSaleActive(p)) ?? null;
  }

  flashPrice(p: Product): string {
    return this.productService.getFlashSalePrice(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  flashCountdown(p: Product): string {
    this.flashTick();
    const s = this.productService.flashSaleSecondsLeft(p);
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  addToCart(name: string, price: string, image: string, id: number) {
    // Truyền đủ product gốc để cart tự áp giá giờ vàng nếu đang active
    const product = this.productService.getById(id);
    this.cartService.addToCart(product ?? { name, price, image, id });
  }

  buyNow(name: string, price: string, image: string, id: number) {
    const product = this.productService.getById(id);
    const targetProduct = (product ?? { name, price, image, id }) as any;
    if (this.productService.isOutOfStock(targetProduct)) {
      alert(`"${targetProduct.name}" đã hết hàng hôm nay!`);
      return;
    }
    this.cartService.addToCart(targetProduct);
    this.productService.decreaseStock(targetProduct.id, 1);
    this.router.navigate(['/checkout']);
  }

  onCategoryClick(category: string) {
    this.router.navigate(['/menu'], { queryParams: { category } });
  }
}
