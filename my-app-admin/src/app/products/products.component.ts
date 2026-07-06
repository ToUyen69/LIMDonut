import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, AdminProduct } from './products.service';
import { AdminAuthService } from '../admin-auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  service = inject(ProductsService);
  private auth = inject(AdminAuthService);

  search = signal('');
  savingId = signal<number | null>(null);
  showAddForm = signal(false);
  newProduct = { name: '', price: '', image: '', stock: 50, description: '' };

  ngOnInit() {
    this.service.fetchAll();
  }

  logout() { this.auth.logout(); }

  get filtered(): AdminProduct[] {
    const term = this.search().trim().toLowerCase();
    const list = this.service.products();
    if (!term) return list;
    return list.filter(p => p.name.toLowerCase().includes(term));
  }

  save(p: AdminProduct) {
    this.savingId.set(p.id);
    this.service.update(p.id, { price: p.price, stock: Number(p.stock) }).subscribe({
      next: () => {
        this.savingId.set(null);
        this.service.fetchAll();
      },
      error: err => {
        this.savingId.set(null);
        alert(err.error?.message || 'Lỗi khi lưu sản phẩm.');
      }
    });
  }

  remove(p: AdminProduct) {
    if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
    this.service.remove(p.id).subscribe({
      next: () => this.service.fetchAll(),
      error: err => alert(err.error?.message || 'Lỗi khi xoá sản phẩm.')
    });
  }

  addProduct() {
    if (!this.newProduct.name.trim() || !this.newProduct.price.trim()) {
      alert('Vui lòng nhập tên và giá.');
      return;
    }
    this.service.create({
      name: this.newProduct.name.trim(),
      price: this.newProduct.price.trim(),
      image: this.newProduct.image.trim(),
      stock: Number(this.newProduct.stock) || 0,
      description: this.newProduct.description.trim(),
      categories: ['Món mới'],
      sold: 0
    } as any).subscribe({
      next: () => {
        this.showAddForm.set(false);
        this.newProduct = { name: '', price: '', image: '', stock: 50, description: '' };
        this.service.fetchAll();
      },
      error: err => alert(err.error?.message || 'Lỗi khi thêm sản phẩm.')
    });
  }
}
