import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../cart.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  router = inject(Router);
  
  shippingFee = 10000;
  discount = 0;
  
  // Form data
  address = signal('107-B9 P. Tô Hiệu, Nghĩa Tân, Cầu Giấy, Hà Nội');
  recipient = signal('siêu trộm kid');
  phoneNumber = signal('');
  deliveryTime = signal('Nhận hàng ngày 29/10/2025 - Vào lúc 19:30');
  notes = signal('Không có ghi chú');
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

  get subtotal() {
    return this.cartService.totalPrice();
  }

  get total() {
    return this.subtotal + this.shippingFee - this.discount;
  }

  get isFormValid(): boolean {
    const phoneValid = /^\d{10}$/.test(this.phoneNumber());
    const addressValid = this.address().length > 0;
    const recipientValid = this.recipient().length > 0;
    const branchValid = this.branch().length > 0;
    const timeValid = this.deliveryTime().length > 0 && this.timeError() === '';
    
    return phoneValid && addressValid && recipientValid && branchValid && timeValid && this.cartService.items().length > 0;
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
    this.cartService.updateQuantity(id, currentQty - 1);
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
  }

  removeOption(id: string, type: 'heating' | 'topping', topping?: string) {
    this.cartService.removeOption(id, type, topping);
  }

  openTimeModal() {
    this.showTimeModal.set(true);
  }

  closeTimeModal() {
    this.showTimeModal.set(false);
  }

  confirmTime() {
    const now = new Date();
    const chosen = new Date(`${this.selectedDate()}T${this.selectedHour()}:${this.selectedMinute()}:00`);

    if (chosen <= now) {
      this.timeError.set('Thời gian nhận hàng phải sau thời gian hiện tại');
      return;
    }

    this.timeError.set('');
    const date = new Date(this.selectedDate());
    const formattedDate = `${(date.getDate()).toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    this.deliveryTime.set(`Nhận hàng ngày ${formattedDate} - Vào lúc ${this.selectedHour()}:${this.selectedMinute()}`);
    this.closeTimeModal();
  }

  placeOrder() {
    if (!this.isFormValid) return;

    const newOrder: any = {
      orderId: 'DH-' + Math.floor(1000000 + Math.random() * 9000000),
      totalAmount: this.total,
      status: 'Chờ xác nhận',
      customerInfo: {
        name: this.recipient(),
        phone: this.phoneNumber(),
        address: this.address() + (this.branch() ? ` (Chi nhánh: ${this.branch()})` : ''),
        deliveryTime: this.deliveryTime(),
        notes: this.notes()
      },
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

    this.orderService.addOrder(newOrder).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        alert('Lỗi khi đặt hàng! Vui lòng thử lại.');
      }
    });
  }
}
