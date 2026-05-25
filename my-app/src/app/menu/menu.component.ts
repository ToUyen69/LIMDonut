import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  rating: number;
  reviews: string;
  image: string;
  categories: string[];
}

import { RouterModule, ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  selectedCategory: string = 'Tất cả';
  private cartService = inject(CartService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
    });
  }

  products: Product[] = [
    { id: 1, name: 'Carabana', description: 'Caramel Chuối', price: '32.000', rating: 5, reviews: '1.1k', image: 'new_product_carabana.jpg', categories: ['Món mới'] },
    { id: 2, name: 'Cheefy Hotdog', description: 'Xúc xích phô mai (bản mới)', price: '35.000', rating: 4, reviews: '500', image: 'new_product_cheefy hotdog.jpg', categories: ['Món mới', 'Bất ngờ Lịm'] },
    { id: 3, name: 'Truffle Bacon', description: 'Bacon Nấm Truffle', price: '40.000', rating: 5, reviews: '1.5k', image: 'new_product_trufle-bacon.jpg', categories: ['Món mới', 'Bất ngờ Lịm'] },
    { id: 4, name: 'Vietnamese Coffee', description: 'Cà phê sữa đá Việt Nam', price: '28.000', rating: 5, reviews: '2k', image: 'new_product_vietnamese-coffee.jpg', categories: ['Món mới', 'Cà phê & Cacao', 'Donut hot'] },
    { id: 5, name: 'Thai Tea Creme Brulee', description: 'Trà Thái Creme Brulee', price: '35.000', rating: 5, reviews: '850', image: 'product_Thai-tea-creme-brulee.jpg', categories: ['Trà & Quả'] },
    { id: 6, name: 'Burnt Mentaiko', description: 'Trứng cá tuyết khò lửa', price: '38.000', rating: 4, reviews: '650', image: 'product_burnt-mentaiko.jpg', categories: ['Bất ngờ Lịm'] },
    { id: 7, name: 'Cacao Passion', description: 'Cacao chanh dây', price: '32.000', rating: 5, reviews: '1.2k', image: 'product_cacao-passion.jpg', categories: ['Cà phê & Cacao'] },
    { id: 8, name: 'Caramel Butter Cream', description: 'Kem bơ Caramel', price: '34.000', rating: 5, reviews: '900', image: 'product_caramel-butter-cream.jpg', categories: ['Nguyên Bản'] },
    { id: 9, name: 'Caramel Crack', description: 'Caramel giòn', price: '30.000', rating: 4, reviews: '750', image: 'product_caramel-crack.jpg', categories: ['Cà phê & Cacao'] },
    { id: 10, name: 'Castella Bom', description: 'Bánh bông lan Castella', price: '35.000', rating: 5, reviews: '1k', image: 'product_castella-bom.jpg', categories: ['Nguyên Bản'] },
    { id: 11, name: 'Cheezy Hotdog', description: 'Xúc xích phô mai', price: '35.000', rating: 4, reviews: '400', image: 'product_cheezy-hotdog.jpg', categories: ['Bất ngờ Lịm'] },
    { id: 12, name: 'Cho-Vi-Be', description: 'Chocolate Vị Bé', price: '25.000', rating: 5, reviews: '3k', image: 'product_cho-vi-be.jpg', categories: ['Nguyên Bản'] },
    { id: 13, name: 'Chocoyogo', description: 'Chocolate Yogurt', price: '32.000', rating: 5, reviews: '1.1k', image: 'product_chocoyogo.jpg', categories: ['Cà phê & Cacao'] },
    { id: 14, name: 'Coco Pandan', description: 'Dừa lá dứa', price: '30.000', rating: 5, reviews: '800', image: 'product_coco-pandan.jpg', categories: ['Trà & Quả'] },
    { id: 15, name: 'Coconut Drift', description: 'Dừa nướng', price: '33.000', rating: 4, reviews: '950', image: 'product_coconut-drirt.jpg', categories: ['Trà & Quả'] },
    { id: 16, name: 'Corn Flirt', description: 'Bắp phô mai', price: '28.000', rating: 4, reviews: '600', image: 'product_corn-flirt.jpg', categories: ['Bất ngờ Lịm'] },
    { id: 17, name: 'Creamy Mushroom', description: 'Sốt nấm kem ngậy', price: '38.000', rating: 5, reviews: '700', image: 'product_creamy-mushroom.jpg', categories: ['Bất ngờ Lịm'] },
    { id: 18, name: 'Crucolate', description: 'Cruller phủ socola', price: '36.000', rating: 5, reviews: '1.3k', image: 'product_crucolate.jpg', categories: ['Cà phê & Cacao'] },
    { id: 19, name: 'Cruller', description: 'Bánh vòng Cruller trơn', price: '30.000', rating: 4, reviews: '500', image: 'product_cruller.jpg', categories: ['Nguyên Bản'] },
    { id: 20, name: 'Crumel', description: 'Cruller Caramel', price: '34.000', rating: 5, reviews: '800', image: 'product_crumel.jpg', categories: ['Cà phê & Cacao'] },
    { id: 21, name: 'Crumon', description: 'Cruller vị chanh thơm', price: '34.000', rating: 4, reviews: '650', image: 'product_crumon.jpg', categories: ['Trà & Quả'] },
    { id: 22, name: 'Crunnemon', description: 'Cruller Quế', price: '34.000', rating: 5, reviews: '900', image: 'product_crunnemon.jpg', categories: ['Nguyên Bản'] },
    { id: 23, name: 'Cruramel', description: 'Cruller Caramel mặn', price: '36.000', rating: 5, reviews: '1k', image: 'product_cruramel.jpg', categories: ['Cà phê & Cacao'] },
    { id: 24, name: 'Cốm Hương Mộc', description: 'Cốm mùa thu', price: '35.000', rating: 5, reviews: '1.2k', image: 'product_cốm-hương-mộc.jpg', categories: ['Trà & Quả', 'Donut hot'] },
    { id: 25, name: 'Dubai Chocolate', description: 'Socola Dubai - đang rất trend', price: '45.000', rating: 5, reviews: '2.5k', image: 'product_dubai-chocolate.jpg', categories: ['Cà phê & Cacao'] },
    { id: 26, name: 'Dứa Ngọc Dừa Ngà', description: 'Dứa dừa', price: '36.000', rating: 5, reviews: '1.1k', image: 'product_dứa-ngọc-dừa-ngà.jpg', categories: ['Trà & Quả'] },
    { id: 27, name: 'Honey Lemon Medovik', description: 'Mật ong chanh', price: '35.000', rating: 5, reviews: '950', image: 'product_honey-lemon-medovik.jpg', categories: ['Trà & Quả'] },
    { id: 28, name: 'Hot Gochujang', description: 'Sốt cay Hàn Quốc Gochujang', price: '32.000', rating: 4, reviews: '550', image: 'product_hot-gochujang.jpg', categories: ['Bất ngờ Lịm', 'Donut hot'] },
    { id: 29, name: 'Miso Earl Grey', description: 'Miso Bá tước Bá tước', price: '38.000', rating: 5, reviews: '1.4k', image: 'product_miso-earl-grey-milk-cream.jpg', categories: ['Bất ngờ Lịm'] },
    { id: 30, name: 'Nutty Caramel', description: 'Caramel hạt rang', price: '36.000', rating: 5, reviews: '1.2k', image: 'product_nutty-caramel.jpg', categories: ['Cà phê & Cacao'] },
    { id: 31, name: 'Oreo Milkshake', description: 'Oreo sữa lắc', price: '32.000', rating: 5, reviews: '2k', image: 'product_oreo-milkshake.jpg', categories: ['Cà phê & Cacao'] },
    { id: 32, name: 'Pina Colada', description: 'Dứa dừa Pina Colada', price: '35.000', rating: 4, reviews: '750', image: 'product_pina-colada.jpg', categories: ['Trà & Quả'] },
    { id: 33, name: 'Sa Tế Mayo', description: 'Sa tế Mayo độc lạ', price: '32.000', rating: 4, reviews: '600', image: 'product_sa-tế-mayo.jpg', categories: ['Bất ngờ Lịm'] },
    { id: 34, name: 'Thu Trà Mochi', description: 'Trà Mochi', price: '35.000', rating: 5, reviews: '800', image: 'product_thu-tra-mochi.jpg', categories: ['Trà & Quả'] },
    { id: 35, name: 'Toasted Mocha', description: 'Mocha nướng', price: '32.000', rating: 5, reviews: '1k', image: 'product_toasted-mocha.jpg', categories: ['Cà phê & Cacao', 'Donut hot'] },
    { id: 36, name: 'Trứng Muối Chà Bông', description: 'Vị mặn ngọt hài hòa', price: '30.000', rating: 5, reviews: '1k', image: 'product_trứng-muối-chà-bông.jpg', categories: ['Donut hot', 'Bất ngờ Lịm'] },
    { id: 37, name: 'Ube Creme Brulee', description: 'Khoai lang tím Ube', price: '36.000', rating: 5, reviews: '1.2k', image: 'product_ube-creme-brulee.jpg', categories: ['Bất ngờ Lịm'] },
    { id: 38, name: 'Young Coconut Glazed', description: 'Dừa non phủ men đường', price: '30.000', rating: 4, reviews: '850', image: 'product_young-coconut-glazed.jpg', categories: ['Nguyên Bản'] }
  ];

  get filteredProducts() {
    if (this.selectedCategory === 'Tất cả') {
      return this.products;
    }
    return this.products.filter(p => p.categories.includes(this.selectedCategory));
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

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
    this.cartService.addToCart(product);
  }
}
