import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface NutritionInfo {
  calories: number; // kcal
  sugar: number;    // g (đường)
  fat: number;      // g (chất béo)
  protein: number;  // g (đạm)
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  basePrice?: string;
  rating: number;
  reviews: string;
  image: string;
  categories: string[];
  toppings: { name: string; price: string }[];
  /** Nhãn mô tả nhanh để khách quét mắt: 'Nhân chảy', 'Cay', 'Mặn'... */
  labels: string[];
  /** Nhu cầu ăn uống – dùng cho bộ lọc: 'Chay', 'Không gluten', 'Ít ngọt', 'Cho trẻ em' */
  dietary: string[];
  /** Thông tin dinh dưỡng cho 1 chiếc (combo = 0, tính theo từng bánh bên trong) */
  nutrition: NutritionInfo;
  /** Thành phần gây dị ứng: 'Gluten', 'Sữa', 'Trứng', 'Hạt cây', 'Đậu nành', 'Hải sản' */
  allergens: string[];
  /** Số lượng đã bán – dùng để xếp hạng "Bán chạy" / "Hot hôm nay" */
  sold: number;
  /** Tồn kho hiện tại (giả lập realtime trong phiên) */
  stock: number;
  /** Giờ vàng: giảm giá theo khung giờ cố định trong tuần (dayOfWeek: 0=CN...6=T7) */
  flashSale?: { discountPercent: number; dayOfWeek: number; startHour: number; endHour: number };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/api/products`;

  /** Danh sách sản phẩm tải từ backend (MongoDB) — cache bằng signal */
  private productsSig = signal<Product[]>([]);

  constructor() {
    this.refresh();
  }

  /** Tải lại danh sách sản phẩm từ API */
  refresh(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: data => this.productsSig.set(data),
      error: err => console.error('Không tải được danh sách sản phẩm:', err)
    });
  }

  /** Ngưỡng số lượng bán để gắn nhãn "Bán chạy" */
  static readonly BEST_SELLER_THRESHOLD = 1500;

  getProducts(): Product[] {
    return this.productsSig();
  }

  getById(id: number): Product | undefined {
    return this.productsSig().find(p => p.id === id);
  }

  /** Giá dạng số (vnđ). Combo trả về 0 vì giá tính động. */
  getPriceValue(p: Product): number {
    const n = parseInt(p.price.replace(/\./g, ''), 10);
    return isNaN(n) ? 0 : n;
  }

  isNew(p: Product): boolean {
    return p.categories.includes('Món mới');
  }

  isHot(p: Product): boolean {
    return p.categories.includes('Donut hot');
  }

  isBestSeller(p: Product): boolean {
    return p.sold >= ProductService.BEST_SELLER_THRESHOLD;
  }

  isLowStock(p: Product): boolean {
    return p.stock >= 1 && p.stock <= 5;
  }

  isOutOfStock(p: Product): boolean {
    return p.stock === 0;
  }

  /** Giờ vàng có đang diễn ra cho sản phẩm này không */
  isFlashSaleActive(p: Product): boolean {
    if (!p.flashSale) return false;
    const now = new Date();
    return now.getDay() === p.flashSale.dayOfWeek
      && now.getHours() >= p.flashSale.startHour
      && now.getHours() < p.flashSale.endHour;
  }

  /** Giá đã giảm trong giờ vàng (vnđ dạng số); ngoài giờ trả giá gốc */
  getFlashSalePrice(p: Product): number {
    const base = this.getPriceValue(p);
    if (!this.isFlashSaleActive(p)) return base;
    return Math.round(base * (100 - p.flashSale!.discountPercent) / 100);
  }

  /** Số giây còn lại tới khi hết giờ vàng (0 nếu không active) */
  flashSaleSecondsLeft(p: Product): number {
    if (!this.isFlashSaleActive(p)) return 0;
    const end = new Date();
    end.setHours(p.flashSale!.endHour, 0, 0, 0);
    return Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
  }

  decreaseStock(productId: number, qty: number): void {
    this.productsSig.update(list => list.map(p =>
      p.id === productId ? { ...p, stock: Math.max(0, p.stock - qty) } : p
    ));
  }
}
