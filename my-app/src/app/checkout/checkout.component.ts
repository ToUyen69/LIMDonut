import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../cart.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../order.service';
import { Router } from '@angular/router';
import { classifyOrder, calculateShipping, applyDiscountCap } from '../pricing.util';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ImgUrlPipe } from '../img-url.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImgUrlPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  router = inject(Router);

  // Giảm 15% đơn đầu cho tài khoản đăng ký bằng mã giới thiệu
  referralActive = signal(localStorage.getItem('pendingReferralDiscount') === 'true');
  get discount(): number {
    return this.referralActive() ? Math.floor(this.subtotal * 0.15) : 0;
  }
  starsInput = signal(0);
  starWarning = signal('');

  // Chế độ quà tặng
  isGift = signal(false);
  giftMessage = signal('');
  hideGiftPrice = signal(false);

  // Mã giảm giá (voucher)
  private http = inject(HttpClient);
  voucherInput = signal('');
  appliedVoucherCode = signal('');
  voucherDiscount = signal(0);
  voucherMsg = signal('');
  voucherChecking = signal(false);

  applyVoucher() {
    const code = this.voucherInput().trim().toUpperCase();
    if (!code || this.voucherChecking()) return;
    this.voucherChecking.set(true);
    this.voucherMsg.set('');
    this.http.post<{ code: string; discount: number }>(`${environment.apiBase}/api/vouchers/validate`, {
      code, orderTotal: this.subtotal
    }).subscribe({
      next: res => {
        this.appliedVoucherCode.set(res.code);
        this.voucherDiscount.set(res.discount);
        this.voucherMsg.set(`Áp dụng mã ${res.code} thành công!`);
        this.voucherChecking.set(false);
      },
      error: err => {
        this.appliedVoucherCode.set('');
        this.voucherDiscount.set(0);
        this.voucherMsg.set(err.error?.message || 'Mã giảm giá không hợp lệ.');
        this.voucherChecking.set(false);
      }
    });
  }

  removeVoucher() {
    this.appliedVoucherCode.set('');
    this.voucherDiscount.set(0);
    this.voucherInput.set('');
    this.voucherMsg.set('');
  }

  deliveryMethod = signal<'delivery' | 'pickup'>('delivery');
  distanceKm = signal(3);
  
  // Form data
  address = signal('');
  recipient = signal('');
  phoneNumber = signal('');
  deliveryTime = signal('');
  notes = signal('');
  branch = signal('');
  
  // Validation messages
  phoneError = signal('');
  timeError = signal('');
  
  // Modal state
  showTimeModal = signal(false);
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  selectedHour = signal(new Date().getHours().toString().padStart(2, '0'));
  selectedMinute = signal(new Date().getMinutes().toString().padStart(2, '0'));
  
  minDate = new Date().toISOString().split('T')[0];
  
  hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
  minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
  
  paymentMethod = signal('cash');
  agreedToTerms = signal(false);
  paymentSplit = signal<'deposit' | 'full'>('deposit');

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      const u = this.authService.user();
      if (u) {
        this.recipient.set(u.username || '');
        this.phoneNumber.set(u.phone || '');
        this.address.set(u.address || '');
      }
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem('guestCheckoutInfo') || '{}');
        if (saved.name) this.recipient.set(saved.name);
        if (saved.phone) this.phoneNumber.set(saved.phone);
        if (saved.address) this.address.set(saved.address);
      } catch (_) {}
    }
  }

  // QR modal state
  showQrModal = signal(false);
  qrCountdown = signal(900); // 15 minutes in seconds
  qrExpired = signal(false);
  pendingOrder: any = null;
  private countdownInterval: any = null;

  get subtotal() {
    return this.cartService.totalPrice();
  }

  readonly shippingResult = computed(() => {
    if (this.deliveryMethod() === 'pickup') return { fee: 0, estimatedTime: '' };
    return calculateShipping(this.distanceKm(), this.subtotal);
  });

  get shippingFee(): number {
    return this.shippingResult().fee ?? 0;
  }

  get shippingOutOfRange(): boolean {
    return this.deliveryMethod() === 'delivery' && this.shippingResult().fee === null;
  }

  readonly starsDiscount = computed(() => {
    const cap = applyDiscountCap(this.subtotal, this.starsInput(), 0);
    return cap.stars;
  });

  get total() {
    return Math.max(0, this.subtotal + this.shippingFee - this.discount - this.starsDiscount() - this.voucherDiscount());
  }

  onStarsInputChange(val: number) {
    const userStars = this.authService.user()?.stars || 0;
    if (val > userStars) {
      val = userStars;
      this.starWarning.set(`Bạn chỉ có ${userStars.toLocaleString()} Star.`);
    } else {
      this.starWarning.set('');
    }
    this.starsInput.set(val);
    const capped = applyDiscountCap(this.subtotal, val, 0);
    if (capped.stars < val) {
      this.starWarning.set(`Tối đa 30% tạm tính = ${capped.stars.toLocaleString()}đ. Đã tự điều chỉnh.`);
    }
  }

  readonly orderClassification = computed(() => classifyOrder(this.total));

  get isFormValid(): boolean {
    const phoneValid = /^\d{10}$/.test(this.phoneNumber());
    const recipientValid = this.recipient().length > 0;
    const branchValid = this.branch().length > 0;
    const timeValid = this.deliveryTime().length > 0 && this.timeError() === '';
    const addressValid = this.deliveryMethod() === 'pickup' || this.address().length > 0;

    return phoneValid && addressValid && recipientValid && branchValid && timeValid
      && this.cartService.items().length > 0 && !this.shippingOutOfRange && this.agreedToTerms();
  }

  validatePhone() {
    if (this.phoneNumber() && !/^\d{10}$/.test(this.phoneNumber())) {
      this.phoneError.set('Số điện thoại phải bao gồm đúng 10 chữ số');
    } else {
      this.phoneError.set('');
    }
  }

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
  }

  increaseQty(id: string, currentQty: number) {
    this.cartService.updateQuantity(id, currentQty + 1);
  }

  decreaseQty(id: string, currentQty: number) {
    if (currentQty <= 1) {
      this.cartService.removeFromCart(id);
    } else {
      this.cartService.updateQuantity(id, currentQty - 1);
    }
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
  }

  removeOption(itemId: string, type: 'heating' | 'topping', name?: string) {
    this.cartService.removeOption(itemId, type, name);
  }

  openTimeModal() {
    this.showTimeModal.set(true);
  }

  closeTimeModal() {
    this.showTimeModal.set(false);
  }

  confirmTime() {
    const now = new Date();
    const selDate = new Date(this.selectedDate());
    
    // Đơn lớn đặt trước tối thiểu 3 ngày (Party L, bánh tiệc)
    const cls = this.orderClassification();
    const minDays = cls.orderType === 'custom' ? 3 : 0;
    
    const minDate = new Date();
    minDate.setDate(now.getDate() + minDays);
    minDate.setHours(0,0,0,0);
    selDate.setHours(0,0,0,0);

    if (selDate < minDate) {
      const minDateStr = `${minDate.getDate().toString().padStart(2, '0')}/${(minDate.getMonth() + 1).toString().padStart(2, '0')}/${minDate.getFullYear()}`;
      this.timeError.set(`Đơn lớn cần đặt trước tối thiểu ${minDays} ngày. Vui lòng chọn từ ngày ${minDateStr}`);
      return;
    }

    this.timeError.set('');
    const date = new Date(this.selectedDate());
    const formattedDate = `${(date.getDate()).toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    this.deliveryTime.set(`Nhận hàng ngày ${formattedDate} - Vào lúc ${this.selectedHour()}:${this.selectedMinute()}`);
    this.closeTimeModal();
  }

  private buildOrder(): any {
    const cls = this.orderClassification();
    const split = this.paymentSplit();
    const isFull = cls.orderType === 'small' || split === 'full';
    
    const depositPercent = isFull ? 100 : cls.depositPercent;
    const depositAmount = isFull ? this.total : cls.depositAmount;
    const remainingAmount = isFull ? 0 : cls.remainingAmount;

    return {
      orderId: 'DH-' + Math.floor(1000000 + Math.random() * 9000000),
      totalAmount: this.total,
      orderType: cls.orderType,
      depositPercent,
      depositAmount,
      remainingAmount,
      deliveryMethod: this.deliveryMethod(),
      paymentMethod: this.paymentMethod(),
      paymentStatus: this.paymentMethod() === 'cash' ? 'pending' : 'pending',
      status: 'Đã đặt',
      customerInfo: {
        name: this.recipient(),
        phone: this.phoneNumber(),
        address: this.deliveryMethod() === 'pickup' ? `Lấy tại quầy (${this.branch()})` : this.address() + (this.branch() ? ` (Chi nhánh: ${this.branch()})` : ''),
        deliveryTime: this.deliveryTime(),
        notes: this.notes(),
        isGift: this.isGift(),
        giftMessage: this.isGift() ? this.giftMessage().trim() : '',
        hideGiftPrice: this.isGift() ? this.hideGiftPrice() : false
      },
      starsToUse: this.starsDiscount(),
      shippingFee: this.shippingFee,
      referralDiscount: this.discount,
      voucherCode: this.appliedVoucherCode() || undefined,
      items: this.cartService.items().map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        options: {
          heating: item.options.heating,
          toppings: item.options.toppings
        }
      }))
    };
  }

  placeOrder() {
    if (!this.isFormValid) return;

    if (this.paymentMethod() !== 'cash') {
      const order = this.buildOrder();
      localStorage.setItem('pendingOrder', JSON.stringify(order));
      if (this.paymentMethod() === 'momo') {
        window.open('/payment/momo', '_blank');
      } else if (this.paymentMethod() === 'vnpay') {
        window.open('/payment/vnpay', '_blank');
      }
      return;
    }

    const newOrder = this.buildOrder();
    this.submitOrder(newOrder);
  }

  private submitOrder(order: any) {
    this.orderService.addOrder(order).subscribe({
      next: () => {
        if (this.referralActive()) {
          localStorage.removeItem('pendingReferralDiscount');
          this.referralActive.set(false);
        }
        this.cartService.clearCart();
        if (this.authService.isLoggedIn()) {
          this.authService.fetchMe().subscribe({ error: () => {} });
          this.router.navigate(['/orders']);
        } else {
          localStorage.setItem('guestCheckoutInfo', JSON.stringify({ name: this.recipient(), phone: this.phoneNumber(), address: this.address() }));
          this.router.navigate(['/orders'], { queryParams: { phone: this.phoneNumber(), name: this.recipient(), justPlaced: order.orderId } });
        }
      },
      error: (err) => {
        console.error('Order error:', err);
        alert('Lỗi khi đặt hàng: ' + (err.error?.message || err.message || JSON.stringify(err.error)));
      }
    });
  }

  get qrPayAmount(): number {
    if (!this.pendingOrder) return 0;
    const cls = this.orderClassification();
    if (cls.orderType === 'small' || this.paymentSplit() === 'full') {
      return this.total;
    }
    return cls.depositAmount;
  }

  get qrCodeUrl(): string {
    const orderId = this.pendingOrder?.orderId || 'DEMO';
    const amount = this.qrPayAmount;
    const data = encodeURIComponent(`LIMDonut|${orderId}|${amount}VND`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
  }

  get qrMinutes(): string {
    return Math.floor(this.qrCountdown() / 60).toString().padStart(2, '0');
  }

  get qrSeconds(): string {
    return (this.qrCountdown() % 60).toString().padStart(2, '0');
  }

  get paymentMethodLabel(): string {
    const map: Record<string, string> = { momo: 'MoMo', vnpay: 'Vn Pay' };
    return map[this.paymentMethod()] || this.paymentMethod();
  }

  openQrModal() {
    this.qrCountdown.set(900);
    this.qrExpired.set(false);
    this.showQrModal.set(true);
    this.startCountdown();
  }

  closeQrModal() {
    this.showQrModal.set(false);
    this.stopCountdown();
    this.pendingOrder = null;
  }

  private startCountdown() {
    this.stopCountdown();
    this.countdownInterval = setInterval(() => {
      const val = this.qrCountdown() - 1;
      if (val <= 0) {
        this.qrCountdown.set(0);
        this.qrExpired.set(true);
        this.stopCountdown();
      } else {
        this.qrCountdown.set(val);
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  resetQr() {
    this.qrCountdown.set(900);
    this.qrExpired.set(false);
    this.startCountdown();
  }

  confirmQrPayment() {
    if (!this.pendingOrder) return;
    this.pendingOrder.paymentStatus = 'paid';
    this.stopCountdown();
    this.showQrModal.set(false);
    this.submitOrder(this.pendingOrder);
    this.pendingOrder = null;
  }
}
