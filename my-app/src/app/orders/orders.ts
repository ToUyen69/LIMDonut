import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../order.service';
import { AuthService } from '../auth.service';
import { CartService } from '../cart.service';
import { ComplaintService } from '../complaint.service';
import { environment } from '../../environments/environment';
import { ImgUrlPipe } from '../img-url.pipe';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImgUrlPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orderService = inject(OrderService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private complaintService = inject(ComplaintService);

  selectedStatus = signal<string>('all');
  lookupPhone = signal('');
  lookupName = signal('');
  lookupResults = signal<Order[]>([]);
  lookupDone = signal(false);
  justPlacedOrderId = signal('');
  showSuccessBanner = signal(false);
  detailOrder = signal<Order | null>(null);

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.orderService.fetchOrders();
    }

    const params = this.route.snapshot.queryParams;
    if (params['justPlaced']) {
      this.justPlacedOrderId.set(params['justPlaced']);
      this.showSuccessBanner.set(true);
      setTimeout(() => this.showSuccessBanner.set(false), 5000);
    }
    if (!this.authService.isLoggedIn() && params['phone'] && params['name']) {
      this.lookupPhone.set(params['phone']);
      this.lookupName.set(params['name']);
      this.searchByPhone();
    }
  }

  private readonly PROCESSING = ['Đã đặt', 'Đã xác nhận', 'Đang chuẩn bị', 'Đã đóng gói'];
  private readonly SHIPPING = ['Đang giao', 'Sẵn sàng lấy'];

  filteredOrders = computed(() => {
    const status = this.selectedStatus();
    const allOrders = this.authService.isLoggedIn() ? this.orderService.orders() : this.lookupResults();
    if (status === 'all') return allOrders;
    if (status === 'processing') return allOrders.filter(o => this.PROCESSING.includes(o.status));
    if (status === 'shipping') return allOrders.filter(o => this.SHIPPING.includes(o.status));
    return allOrders.filter(o => o.status === status);
  });

  statusCounts = computed(() => {
    const allOrders = this.authService.isLoggedIn() ? this.orderService.orders() : this.lookupResults();
    return {
      all: allOrders.length,
      processing: allOrders.filter(o => this.PROCESSING.includes(o.status)).length,
      shipping: allOrders.filter(o => this.SHIPPING.includes(o.status)).length,
      completed: allOrders.filter(o => o.status === 'Hoàn thành').length
    };
  });

  getProgressPercent(status: string): number {
    const map: Record<string, number> = {
      'Đã đặt': 10, 'Đã xác nhận': 30, 'Đang chuẩn bị': 50,
      'Đã đóng gói': 60, 'Đang giao': 70, 'Sẵn sàng lấy': 70, 'Hoàn thành': 100
    };
    return map[status] ?? 0;
  }

  searchByPhone() {
    const phone = this.lookupPhone().trim();
    const name = this.lookupName().trim();
    if (!phone || !name) return;
    this.orderService.lookupOrders(phone, name).subscribe({
      next: orders => { this.lookupResults.set(orders); this.lookupDone.set(true); },
      error: () => { this.lookupResults.set([]); this.lookupDone.set(true); },
    });
  }

  formatPrice(price: number): string {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ' : '0đ';
  }

  canCancel(order: any): boolean {
    if (['Đã hủy', 'Hoàn thành', 'Đã hoàn tiền', 'Giao thất bại', 'Không tới lấy', 'Thanh toán thất bại'].includes(order.status)) return false;
    if (order.orderType === 'custom') {
      return order.cancelDeadline ? new Date() < new Date(order.cancelDeadline) : false;
    }
    return order.status === 'Đã đặt';
  }

  openDetail(order: Order) { this.detailOrder.set(order); }
  closeDetail() { this.detailOrder.set(null); }

  getPaymentLabel(method?: string): string {
    const map: Record<string, string> = { cash: 'Tiền mặt', momo: 'MoMo', zalopay: 'ZaloPay', wallet: 'Ví điện tử' };
    return map[method || 'cash'] || method || 'Tiền mặt';
  }

  reorder(order: Order) {
    let count = 0;
    for (const item of order.items || []) {
      // item.id có dạng "12_{...options}" — lấy lại productId gốc từ tiền tố
      const productId = parseInt(String(item.id).split('_')[0], 10) || 0;
      const toppings = item.options?.toppings || [];
      const toppingsPrice = toppings.reduce((acc: number, t: any) => acc + (t.price * t.quantity), 0);
      // Dùng giá LƯU TRONG ĐƠN: suy ngược basePrice để addToCart tính ra đúng giá cũ
      // (hộp 99/100 bị addToCart nhân 0.9 nên phải chia ngược lại)
      let basePrice = item.price - toppingsPrice;
      if (productId === 99 || productId === 100) {
        basePrice = Math.round(item.price / 0.9) - toppingsPrice;
      }
      const fakeProduct = {
        id: productId,
        name: item.name,
        price: basePrice,
        basePrice: basePrice,
        image: item.image
      };
      this.cartService.addToCart(fakeProduct, item.quantity, {
        heating: item.options?.heating || 'Không',
        toppings: toppings
      });
      count++;
    }
    alert(`Đã thêm ${count} món vào giỏ hàng từ đơn cũ!`);
    this.router.navigate(['/checkout']);
  }

  // ---- Khiếu nại trong 2 giờ kể từ khi "Hoàn thành" ----
  private readonly COMPLAINT_WINDOW_MS = 2 * 60 * 60 * 1000;

  complaintOrder = signal<Order | null>(null);
  complaintReason = signal('Thiếu sản phẩm');
  complaintDesc = signal('');
  complaintPhoto = signal('');
  complaintSending = signal(false);
  complaintError = signal('');
  complaintUploading = signal(false);

  onComplaintPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.complaintUploading.set(true);
    this.complaintError.set('');
    this.complaintService.uploadPhoto(file).subscribe({
      next: res => {
        this.complaintPhoto.set(environment.apiBase + res.url);
        this.complaintUploading.set(false);
      },
      error: (err: any) => {
        this.complaintUploading.set(false);
        this.complaintError.set(err.error?.message || 'Upload ảnh thất bại.');
      }
    });
  }
  readonly complaintReasons = ['Thiếu sản phẩm', 'Sai vị', 'Sai topping', 'Móp vỡ', 'Không đảm bảo vệ sinh', 'Khác'];

  private completedAt(order: any): number | null {
    const entry = (order.statusHistory || []).find((h: any) => h.status === 'Hoàn thành');
    return entry?.at ? new Date(entry.at).getTime() : null;
  }

  canComplain(order: any): boolean {
    if (order.status !== 'Hoàn thành') return false;
    const at = this.completedAt(order);
    if (at === null) return false;
    return Date.now() - at <= this.COMPLAINT_WINDOW_MS;
  }

  complaintMinutesLeft(order: any): number {
    const at = this.completedAt(order);
    if (at === null) return 0;
    return Math.max(0, Math.ceil((at + this.COMPLAINT_WINDOW_MS - Date.now()) / 60000));
  }

  openComplaint(order: Order) {
    this.complaintOrder.set(order);
    this.complaintReason.set('Thiếu sản phẩm');
    this.complaintDesc.set('');
    this.complaintPhoto.set('');
    this.complaintError.set('');
  }

  closeComplaint() { this.complaintOrder.set(null); }

  submitComplaint() {
    const order = this.complaintOrder();
    if (!order || this.complaintSending()) return;
    this.complaintSending.set(true);
    this.complaintError.set('');
    this.complaintService.postComplaint({
      orderId: order._id!,
      reason: this.complaintReason(),
      description: this.complaintDesc().trim(),
      photoUrl: this.complaintPhoto().trim()
    }).subscribe({
      next: () => {
        this.complaintSending.set(false);
        this.complaintOrder.set(null);
        alert('Đã gửi khiếu nại! Cửa hàng sẽ liên hệ với bạn sớm nhất.');
      },
      error: (err) => {
        this.complaintSending.set(false);
        this.complaintError.set(err.error?.message || 'Không thể gửi khiếu nại.');
      }
    });
  }

  cancelOrder(id: string) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Tiền cọc (nếu có) sẽ KHÔNG được hoàn.')) return;
    this.orderService.cancelOrder(id).subscribe({
      next: () => {
        if (this.authService.isLoggedIn()) this.orderService.fetchOrders();
        else if (this.lookupDone()) this.searchByPhone();
      },
      error: (err) => alert(err.error?.message || 'Không thể hủy đơn hàng.')
    });
  }
}
