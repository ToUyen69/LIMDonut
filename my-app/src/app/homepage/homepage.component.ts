import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  addToCart(name: string, price: string, image: string, id: number) {
    this.cartService.addToCart({ name, price, image, id });
  }

  onCategoryClick(category: string) {
    this.router.navigate(['/menu'], { queryParams: { category } });
  }
}
