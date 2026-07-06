import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../cart.service';
import { ProductService, Product } from '../product.service';
import { AuthService } from '../auth.service';
import { ImgUrlPipe } from '../img-url.pipe';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImgUrlPipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {
  selectedCategory: string = 'Tất cả';
  searchTerm: string = '';
  sortBy: string = 'featured'; // featured | newest | price-asc | price-desc | rating
  selectedDiets: string[] = []; // 'Chay', 'Không gluten', 'Ít ngọt', 'Cho trẻ em'
  priceRange: string = 'all';   // all | lt30 | 30-40 | gt40
  calorieRange: string = 'all'; // all | lt300 | 300-380 | gt380

  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);
  authService = inject(AuthService);

  // Bộ lọc nhu cầu hiển thị dưới dạng chip
  readonly dietOptions = ['Chay', 'Không gluten', 'Ít ngọt', 'Cho trẻ em'];

  // Sản phẩm bán cho menu (loại bỏ combo box, vốn được chọn ở trang chi tiết)
  // Dùng getter vì danh sách giờ tải async từ API
  private get products(): Product[] {
    return this.productService.getProducts().filter(p => p.id < 99);
  }

  constructor(private route: ActivatedRoute) {}

  // Giờ vàng: tick mỗi giây để cập nhật đồng hồ đếm ngược
  readonly flashTick = signal(0);
  private flashTimer: any = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
    });
    this.flashTimer = setInterval(() => this.flashTick.update(v => v + 1), 1000);
  }

  ngOnDestroy() {
    if (this.flashTimer) clearInterval(this.flashTimer);
  }

  // ---- Giờ vàng ----
  isFlashSale(p: Product): boolean {
    this.flashTick();
    return this.productService.isFlashSaleActive(p);
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

  get activeFlashProduct(): Product | null {
    this.flashTick();
    return this.products.find(p => this.productService.isFlashSaleActive(p)) ?? null;
  }

  focusFlashProduct() {
    const p = this.activeFlashProduct;
    if (!p) return;
    this.selectedCategory = 'Tất cả';
    this.searchTerm = p.name;
  }

  // ---- Gợi ý an toàn cho khách mới: top bán chạy hôm nay ----
  get hotPicks(): Product[] {
    return [...this.products]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);
  }

  get filteredProducts(): Product[] {
    let list = [...this.products];

    // Lọc theo danh mục
    if (this.selectedCategory !== 'Tất cả') {
      list = list.filter(p => p.categories.includes(this.selectedCategory));
    }

    // Tìm kiếm theo tên / mô tả
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    // Lọc theo nhu cầu (tất cả nhu cầu đã chọn đều phải thỏa)
    if (this.selectedDiets.length) {
      list = list.filter(p => this.selectedDiets.every(d => p.dietary.includes(d)));
    }

    // Lọc theo giá
    if (this.priceRange !== 'all') {
      list = list.filter(p => {
        const price = this.productService.getPriceValue(p);
        if (this.priceRange === 'lt30') return price < 30000;
        if (this.priceRange === '30-40') return price >= 30000 && price <= 40000;
        if (this.priceRange === 'gt40') return price > 40000;
        return true;
      });
    }

    // Lọc theo calo
    if (this.calorieRange !== 'all') {
      list = list.filter(p => {
        const cal = p.nutrition.calories;
        if (this.calorieRange === 'lt300') return cal < 300;
        if (this.calorieRange === '300-380') return cal >= 300 && cal <= 380;
        if (this.calorieRange === 'gt380') return cal > 380;
        return true;
      });
    }

    // Sắp xếp
    switch (this.sortBy) {
      case 'newest':
        list.sort((a, b) => Number(this.isNew(b)) - Number(this.isNew(a)));
        break;
      case 'price-asc':
        list.sort((a, b) => this.productService.getPriceValue(a) - this.productService.getPriceValue(b));
        break;
      case 'price-desc':
        list.sort((a, b) => this.productService.getPriceValue(b) - this.productService.getPriceValue(a));
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating || b.sold - a.sold);
        break;
      default: // featured = bán chạy nhất
        list.sort((a, b) => b.sold - a.sold);
    }

    return list;
  }

  get activeFilterCount(): number {
    let n = this.selectedDiets.length;
    if (this.priceRange !== 'all') n++;
    if (this.calorieRange !== 'all') n++;
    return n;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  toggleDiet(diet: string) {
    if (this.selectedDiets.includes(diet)) {
      this.selectedDiets = this.selectedDiets.filter(d => d !== diet);
    } else {
      this.selectedDiets = [...this.selectedDiets, diet];
    }
  }

  isDietActive(diet: string): boolean {
    return this.selectedDiets.includes(diet);
  }

  clearFilters() {
    this.selectedDiets = [];
    this.priceRange = 'all';
    this.calorieRange = 'all';
    this.searchTerm = '';
  }

  // ---- Helpers nhãn ----
  isNew(p: Product): boolean { return this.productService.isNew(p); }
  isHot(p: Product): boolean { return this.productService.isHot(p); }
  isBestSeller(p: Product): boolean { return this.productService.isBestSeller(p); }
  isLowStock(p: Product): boolean { return this.productService.isLowStock(p); }
  isOutOfStock(p: Product): boolean { return this.productService.isOutOfStock(p); }

  getCategoryDesc(category: string): string {
    const descs: { [key: string]: string } = {
      'Nguyên Bản': 'Những chiếc bánh có hương vị cơ bản, dễ ăn, cốt bánh truyền thống.',
      'Trà & Quả': 'Sự kết hợp nhẹ nhàng của trái cây nhiệt đới, các loại trà thảo mộc.',
      'Cà phê & Cacao': 'Dành cho tín đồ hảo ngọt, thích vị đắng nhẹ của cà phê, socola và béo ngậy của caramel.',
      'Bất ngờ Lịm': 'Đất diễn cho các dòng Donut mặn (Savory) và sự giao thoa ẩm thực cực lạ (Fusion).',
      'Món mới': 'Những hương vị mới nhất vừa được LIM Donut ra mắt.',
      'Donut hot': 'Những sản phẩm "quốc dân" được yêu thích nhất tại cửa hàng.'
    };
    return descs[category] || '';
  }

  addToCart(product: Product) {
    if (this.productService.isOutOfStock(product)) {
      alert(`"${product.name}" đã hết hàng hôm nay!`);
      return;
    }
    this.cartService.addToCart(product);
    this.productService.decreaseStock(product.id, 1);
  }

  buyNow(product: Product) {
    if (this.productService.isOutOfStock(product)) {
      alert(`"${product.name}" đã hết hàng hôm nay!`);
      return;
    }
    this.cartService.addToCart(product);
    this.productService.decreaseStock(product.id, 1);
    this.router.navigate(['/checkout']);
  }

  toggleFavorite(product: Product) {
    const obs = this.authService.toggleFavorite(product.id);
    if (obs) obs.subscribe();
  }

  isFavorite(product: Product): boolean {
    return this.authService.isFavorite(product.id);
  }
}
