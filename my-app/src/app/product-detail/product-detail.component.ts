import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../cart.service';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  basePrice?: string;
  rating: number;
  reviews: string;
  image: string;
  categories: string[];
  toppings: { name: string, price: string }[];
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  productImages: string[] = [];
  currentImageIndex: number = 0;
  relatedProducts: Product[] = [];
  activeTab: string = 'description'; 
  public cartService = inject(CartService);
  
  // Selections
  selectedHeating: string = 'Không';
  selectedToppings: { name: string, price: number, quantity: number }[] = [];
  quantity: number = 1;
  
  reviewComment: string = '';
  suggestedReviews: string[] = ['Donut rất ngon', 'Trang trí đẹp mắt', 'Giao hàng nhanh', 'Đóng gói cẩn thận', 'Sẽ ủng hộ tiếp'];
  
  extraToppingsList = [
    { name: 'Sốt Socola', price: '5.000' },
    { name: 'Sốt Caramel', price: '5.000' },
    { name: 'Hạt điều rang', price: '10.000' },
    { name: 'Vụn bánh quy', price: '5.000' }
  ];

  products: Product[] = [
    { id: 1, name: 'Carabana', description: 'Caramel Chuối', price: '32.000', rating: 5, reviews: '1.1k', image: 'new_product_carabana.jpg', categories: ['Món mới'], toppings: [{ name: 'Chuối sấy', price: '5.000' }, { name: 'Sốt Caramel', price: '5.000' }, { name: 'Hạt điều', price: '7.000' }] },
    { id: 2, name: 'Cheefy Hotdog', description: 'Xúc xích phô mai (bản mới)', price: '35.000', rating: 4, reviews: '500', image: 'new_product_cheefy hotdog.jpg', categories: ['Món mới', 'Bất ngờ Lịm'], toppings: [{ name: 'Phô mai bột', price: '7.000' }, { name: 'Hành phi', price: '3.000' }, { name: 'Sốt Mayo', price: '3.000' }] },
    { id: 3, name: 'Truffle Bacon', description: 'Bacon Nấm Truffle', price: '40.000', rating: 5, reviews: '1.5k', image: 'new_product_trufle-bacon.jpg', categories: ['Món mới', 'Bất ngờ Lịm'], toppings: [{ name: 'Vụn Truffle', price: '15.000' }, { name: 'Bacon giòn', price: '10.000' }, { name: 'Phô mai bào', price: '8.000' }] },
    { id: 4, name: 'Vietnamese Coffee', description: 'Cà phê sữa đá Việt Nam', price: '28.000', rating: 5, reviews: '2k', image: 'new_product_vietnamese-coffee.jpg', categories: ['Món mới', 'Cà phê & Cacao', 'Donut hot'], toppings: [{ name: 'Hạt cafe vụn', price: '5.000' }, { name: 'Sốt sữa đặc', price: '5.000' }, { name: 'Vụn bánh quy', price: '5.000' }] },
    { id: 5, name: 'Thai Tea Creme Brulee', description: 'Trà Thái Creme Brulee', price: '35.000', rating: 5, reviews: '850', image: 'product_Thai-tea-creme-brulee.jpg', categories: ['Trà & Quả'], toppings: [{ name: 'Vụn đường cháy', price: '5.000' }, { name: 'Bột trà Thái', price: '5.000' }, { name: 'Hạnh nhân', price: '7.000' }] },
    { id: 6, name: 'Burnt Mentaiko', description: 'Trứng cá tuyết khò lửa', price: '38.000', rating: 4, reviews: '650', image: 'product_burnt-mentaiko.jpg', categories: ['Bất ngờ Lịm'], toppings: [{ name: 'Rong biển', price: '5.000' }, { name: 'Trứng cá tuyết thêm', price: '15.000' }, { name: 'Sốt Mayo', price: '3.000' }] },
    { id: 7, name: 'Cacao Passion', description: 'Cacao chanh dây', price: '32.000', rating: 5, reviews: '1.2k', image: 'product_cacao-passion.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Sốt Socola', price: '5.000' }, { name: 'Vụn Chocolate', price: '5.000' }, { name: 'Bột cacao', price: '5.000' }] },
    { id: 8, name: 'Caramel Butter Cream', description: 'Kem bơ Caramel', price: '34.000', rating: 5, reviews: '900', image: 'product_caramel-butter-cream.jpg', categories: ['Nguyên Bản'], toppings: [{ name: 'Sốt Caramel', price: '5.000' }, { name: 'Hạt hạnh nhân', price: '7.000' }, { name: 'Vụn bánh quy', price: '5.000' }] },
    { id: 9, name: 'Caramel Crack', description: 'Caramel giòn', price: '30.000', rating: 4, reviews: '750', image: 'product_caramel-crack.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Sốt Caramel', price: '5.000' }, { name: 'Muối biển', price: '3.000' }, { name: 'Hạt điều', price: '7.000' }] },
    { id: 10, name: 'Castella Bom', description: 'Bánh bông lan Castella', price: '35.000', rating: 5, reviews: '1k', image: 'product_castella-bom.jpg', categories: ['Nguyên Bản'], toppings: [{ name: 'Vụn bánh bông lan', price: '5.000' }, { name: 'Sốt trứng muối', price: '8.000' }, { name: 'Cơm dừa', price: '5.000' }] },
    { id: 11, name: 'Cheezy Hotdog', description: 'Xúc xích phô mai', price: '35.000', rating: 4, reviews: '400', image: 'product_cheezy-hotdog.jpg', categories: ['Bất ngờ Lịm'], toppings: [{ name: 'Phô mai bột', price: '7.000' }, { name: 'Xúc xích cắt nhỏ', price: '10.000' }, { name: 'Tương ớt', price: '2.000' }] },
    { id: 12, name: 'Cho-Vi-Be', description: 'Chocolate Vị Bé', price: '25.000', rating: 5, reviews: '3k', image: 'product_cho-vi-be.jpg', categories: ['Nguyên Bản'], toppings: [{ name: 'Sốt Socola', price: '5.000' }, { name: 'Vụn bánh quy', price: '5.000' }, { name: 'Bột Cacao', price: '5.000' }] },
    { id: 13, name: 'Chocoyogo', description: 'Chocolate Yogurt', price: '32.000', rating: 5, reviews: '1.1k', image: 'product_chocoyogo.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Vụn bánh Oreo', price: '5.000' }, { name: 'Sốt Yogurt', price: '5.000' }, { name: 'Trái cây tươi', price: '10.000' }] },
    { id: 14, name: 'Coco Pandan', description: 'Dừa lá dứa', price: '30.000', rating: 5, reviews: '800', image: 'product_coco-pandan.jpg', categories: ['Trà & Quả'], toppings: [{ name: 'Dừa sợi', price: '5.000' }, { name: 'Mứt lá dứa', price: '7.000' }, { name: 'Cốm rắc', price: '3.000' }] },
    { id: 15, name: 'Coconut Drift', description: 'Dừa nướng', price: '33.000', rating: 4, reviews: '950', image: 'product_coconut-drirt.jpg', categories: ['Trà & Quả'], toppings: [{ name: 'Dừa sợi', price: '5.000' }, { name: 'Nước cốt dừa', price: '5.000' }, { name: 'Hạt hạnh nhân', price: '7.000' }] },
    { id: 16, name: 'Corn Flirt', description: 'Bắp phô mai', price: '28.000', rating: 4, reviews: '600', image: 'product_corn-flirt.jpg', categories: ['Bất ngờ Lịm'], toppings: [{ name: 'Bắp hạt', price: '5.000' }, { name: 'Phô mai bột', price: '7.000' }, { name: 'Sốt Mayo', price: '3.000' }] },
    { id: 17, name: 'Creamy Mushroom', description: 'Sốt nấm kem ngậy', price: '38.000', rating: 5, reviews: '700', image: 'product_creamy-mushroom.jpg', categories: ['Bất ngờ Lịm'], toppings: [{ name: 'Nấm thêm', price: '10.000' }, { name: 'Phô mai parmesan', price: '10.000' }, { name: 'Tiêu đen', price: '2.000' }] },
    { id: 18, name: 'Crucolate', description: 'Cruller phủ socola', price: '36.000', rating: 5, reviews: '1.3k', image: 'product_crucolate.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Sốt Socola', price: '5.000' }, { name: 'Vụn Chocolate', price: '5.000' }, { name: 'Bột cacao', price: '5.000' }] },
    { id: 19, name: 'Cruller', description: 'Bánh vòng Cruller trơn', price: '30.000', rating: 4, reviews: '500', image: 'product_cruller.jpg', categories: ['Nguyên Bản'], toppings: [{ name: 'Đường bột', price: '3.000' }, { name: 'Sốt mật ong', price: '5.000' }, { name: 'Hạt hạnh nhân', price: '7.000' }] },
    { id: 20, name: 'Crumel', description: 'Cruller Caramel', price: '34.000', rating: 5, reviews: '800', image: 'product_crumel.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Sốt Caramel', price: '5.000' }, { name: 'Hạt điều', price: '7.000' }, { name: 'Vụn bánh quy', price: '5.000' }] },
    { id: 21, name: 'Crumon', description: 'Cruller vị chanh thơm', price: '34.000', rating: 4, reviews: '650', image: 'product_crumon.jpg', categories: ['Trà & Quả'], toppings: [{ name: 'Vụn bánh quy', price: '5.000' }, { name: 'Vỏ chanh bào', price: '3.000' }, { name: 'Sốt bơ', price: '5.000' }] },
    { id: 22, name: 'Crunnemon', description: 'Cruller Quế', price: '34.000', rating: 5, reviews: '900', image: 'product_crunnemon.jpg', categories: ['Nguyên Bản'], toppings: [{ name: 'Hạnh nhân lát', price: '7.000' }, { name: 'Vỏ chanh bào', price: '3.000' }, { name: 'Sốt Caramel', price: '5.000' }] },
    { id: 23, name: 'Cruramel', description: 'Cruller Caramel mặn', price: '36.000', rating: 5, reviews: '1k', image: 'product_cruramel.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Sốt Caramel', price: '5.000' }, { name: 'Hạt điều rang', price: '7.000' }, { name: 'Đường cháy', price: '5.000' }] },
    { id: 24, name: 'Cốm Hương Mộc', description: 'Cốm mùa thu', price: '35.000', rating: 5, reviews: '1.2k', image: 'product_cốm-hương-mộc.jpg', categories: ['Trà & Quả', 'Donut hot'], toppings: [{ name: 'Cốm dẹt', price: '5.000' }, { name: 'Dừa sợi', price: '5.000' }, { name: 'Nước cốt dừa', price: '5.000' }] },
    { id: 25, name: 'Dubai Chocolate', description: 'Socola Dubai - đang rất trend', price: '45.000', rating: 5, reviews: '2.5k', image: 'product_dubai-chocolate.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Sốt Pistachio', price: '15.000' }, { name: 'Vụn Chocolate', price: '10.000' }, { name: 'Hạt dẻ cười', price: '15.000' }] },
    { id: 26, name: 'Dứa Ngọc Dừa Ngà', description: 'Dứa dừa', price: '36.000', rating: 5, reviews: '1.1k', image: 'product_dứa-ngọc-dừa-ngà.jpg', categories: ['Trà & Quả'], toppings: [{ name: 'Mứt dứa', price: '5.000' }, { name: 'Dừa vụn', price: '5.000' }, { name: 'Sốt cốt dừa', price: '5.000' }] },
    { id: 27, name: 'Honey Lemon Medovik', description: 'Mật ong chanh', price: '35.000', rating: 5, reviews: '950', image: 'product_honey-lemon-medovik.jpg', categories: ['Trà & Quả'], toppings: [{ name: 'Mật ong nguyên chất', price: '10.000' }, { name: 'Vỏ chanh bào', price: '3.000' }, { name: 'Hạt hạnh nhân', price: '7.000' }] },
    { id: 28, name: 'Hot Gochujang', description: 'Sốt cay Hàn Quốc Gochujang', price: '32.000', rating: 4, reviews: '550', image: 'product_hot-gochujang.jpg', categories: ['Bất ngờ Lịm', 'Donut hot'], toppings: [{ name: 'Hành phi', price: '3.000' }, { name: 'Rong biển vụn', price: '5.000' }, { name: 'Sốt Mayo cay', price: '5.000' }] },
    { id: 29, name: 'Miso Earl Grey', description: 'Miso Bá tước Bá tước', price: '38.000', rating: 5, reviews: '1.4k', image: 'product_miso-earl-grey-milk-cream.jpg', categories: ['Bất ngờ Lịm'], toppings: [{ name: 'Hạt hạnh nhân', price: '7.000' }, { name: 'Bột trà', price: '5.000' }, { name: 'Sốt kem sữa', price: '7.000' }] },
    { id: 30, name: 'Nutty Caramel', description: 'Caramel hạt rang', price: '36.000', rating: 5, reviews: '1.2k', image: 'product_nutty-caramel.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Hạt điều rang', price: '7.000' }, { name: 'Sốt Caramel', price: '5.000' }, { name: 'Hạnh nhân lát', price: '7.000' }] },
    { id: 31, name: 'Oreo Milkshake', description: 'Oreo sữa lắc', price: '32.000', rating: 5, reviews: '2k', image: 'product_oreo-milkshake.jpg', categories: ['Cà phê & Cacao'], toppings: [{ name: 'Vụn bánh Oreo', price: '5.000' }, { name: 'Sốt sữa đặc', price: '5.000' }, { name: 'Kem tươi', price: '10.000' }] },
    { id: 32, name: 'Pina Colada', description: 'Dứa dừa Pina Colada', price: '35.000', rating: 4, reviews: '750', image: 'product_pina-colada.jpg', categories: ['Trà & Quả'], toppings: [{ name: 'Mứt dứa', price: '5.000' }, { name: 'Dừa sợi', price: '5.000' }, { name: 'Hạt hạnh nhân', price: '7.000' }] },
    { id: 33, name: 'Sa Tế Mayo', description: 'Sa tế Mayo độc lạ', price: '32.000', rating: 4, reviews: '600', image: 'product_sa-tế-mayo.jpg', categories: ['Bất ngờ Lịm'], toppings: [{ name: 'Hành phi', price: '3.000' }, { name: 'Ớt bột', price: '2.000' }, { name: 'Sốt Mayo thêm', price: '3.000' }] },
    { id: 34, name: 'Thu Trà Mochi', description: 'Trà Mochi', price: '35.000', rating: 5, reviews: '800', image: 'product_thu-tra-mochi.jpg', categories: ['Trà & Quả'], toppings: [{ name: 'Bột trà xanh', price: '5.000' }, { name: 'Miếng Mochi nhỏ', price: '10.000' }, { name: 'Vụn bánh quy bơ', price: '5.000' }] },
    { id: 35, name: 'Toasted Mocha', description: 'Mocha nướng', price: '32.000', rating: 5, reviews: '1k', image: 'product_toasted-mocha.jpg', categories: ['Cà phê & Cacao', 'Donut hot'], toppings: [{ name: 'Sốt Cà phê', price: '5.000' }, { name: 'Kẹo dẻo nướng', price: '10.000' }, { name: 'Hạt cafe vụn', price: '5.000' }] },
    { id: 36, name: 'Trứng Muối Chà Bông', description: 'Vị mặn ngọt hài hòa', price: '30.000', rating: 5, reviews: '1k', image: 'product_trứng-muối-chà-bông.jpg', categories: ['Donut hot', 'Bất ngờ Lịm'], toppings: [{ name: 'Chà bông thêm', price: '10.000' }, { name: 'Sốt phô mai', price: '5.000' }, { name: 'Trứng muối vụn', price: '10.000' }] },
    { id: 37, name: 'Ube Creme Brulee', description: 'Khoai lang tím Ube', price: '36.000', rating: 5, reviews: '1.2k', image: 'product_ube-creme-brulee.jpg', categories: ['Bất ngờ Lịm'], toppings: [{ name: 'Mứt khoai môn', price: '10.000' }, { name: 'Vụn đường khò', price: '5.000' }, { name: 'Cơm dừa', price: '5.000' }] },
    { id: 38, name: 'Young Coconut Glazed', description: 'Dừa non phủ men đường', price: '30.000', rating: 4, reviews: '850', image: 'product_young-coconut-glazed.jpg', categories: ['Nguyên Bản'], toppings: [{ name: 'Dừa sợi', price: '5.000' }, { name: 'Cốm rắc', price: '3.000' }, { name: 'Sốt cốt dừa', price: '5.000' }] },
    { id: 99, name: 'Combo Box 4', description: 'Hộp 4 bánh tự chọn vị tùy thích', price: 'Tự tính', rating: 5, reviews: '250', image: 'box4.jpg', categories: ['Món mới'], toppings: [{ name: 'Sốt Socola', price: '5.000' }, { name: 'Sốt Caramel', price: '5.000' }, { name: 'Hạt điều rang', price: '10.000' }, { name: 'Vụn bánh quy', price: '5.000' }] },
    { id: 100, name: 'Combo Box 6', description: 'Hộp 6 bánh tự chọn vị tùy thích', price: 'Tự tính', rating: 5, reviews: '380', image: 'box6.jpg', categories: ['Món mới'], toppings: [{ name: 'Sốt Socola', price: '5.000' }, { name: 'Sốt Caramel', price: '5.000' }, { name: 'Hạt điều rang', price: '10.000' }, { name: 'Vụn bánh quy', price: '5.000' }] }
  ];

  selectedBoxDonuts: {
    productId?: number;
    name?: string;
    price?: number;
    image?: string;
    heating: string;
    toppings: { name: string, price: number, quantity: number }[];
    selectableToppings?: { name: string, price: string }[];
  }[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.product = this.products.find(p => p.id === id);
      if (this.product) {
        this.productImages = [this.product.image, this.product.image, this.product.image];
        this.currentImageIndex = 0;
        this.loadRelatedProducts();
        window.scrollTo(0, 0);
        this.selectedHeating = 'Không';
        this.selectedToppings = [];
        this.quantity = 1;
        this.initializeBoxSlots();
      }
    });
  }

  initializeBoxSlots(): void {
    const capacity = this.maxBoxDonutsCapacity;
    this.selectedBoxDonuts = Array.from({ length: capacity }, () => ({
      productId: undefined,
      name: undefined,
      price: undefined,
      image: undefined,
      heating: 'Không',
      toppings: [],
      selectableToppings: []
    }));
  }

  get maxBoxDonutsCapacity(): number {
    if (!this.product) return 0;
    if (this.product.id === 99) return 4;
    if (this.product.id === 100) return 6;
    return 0;
  }

  get totalBoxDonutsCount(): number {
    return this.selectedBoxDonuts.filter(s => s.productId !== undefined).length;
  }

  get selectableDonuts(): Product[] {
    return this.products.filter(p => p.id !== 99 && p.id !== 100);
  }

  getBoxDonutQuantity(productId: number): number {
    return this.selectedBoxDonuts.filter(s => s.productId === productId).length;
  }

  addBoxDonut(donut: Product): void {
    const emptySlot = this.selectedBoxDonuts.find(s => s.productId === undefined);
    if (!emptySlot) {
      alert(`Hộp đã đầy! Bạn chỉ có thể chọn tối đa ${this.maxBoxDonutsCapacity} bánh.`);
      return;
    }
    const priceNum = parseInt(donut.price.replace(/\./g, ''));
    emptySlot.productId = donut.id;
    emptySlot.name = donut.name;
    emptySlot.price = priceNum;
    emptySlot.image = donut.image;
    emptySlot.heating = 'Không';
    emptySlot.toppings = [];
    emptySlot.selectableToppings = donut.toppings || [];
  }

  removeBoxDonut(productId: number): void {
    const lastIndex = this.selectedBoxDonuts.map(s => s.productId).lastIndexOf(productId);
    if (lastIndex > -1) {
      this.clearSlot(lastIndex);
    }
  }

  clearSlot(index: number): void {
    this.selectedBoxDonuts[index] = {
      productId: undefined,
      name: undefined,
      price: undefined,
      image: undefined,
      heating: 'Không',
      toppings: [],
      selectableToppings: []
    };
  }

  selectSlotHeating(index: number, level: string): void {
    this.selectedBoxDonuts[index].heating = level;
  }

  getSlotToppingQuantity(slotIndex: number, toppingName: string): number {
    const topping = this.selectedBoxDonuts[slotIndex].toppings.find(t => t.name === toppingName);
    return topping ? topping.quantity : 0;
  }

  addSlotTopping(slotIndex: number, toppingName: string, toppingPrice: string): void {
    const priceNum = parseInt(toppingPrice.replace('.', ''));
    const slot = this.selectedBoxDonuts[slotIndex];
    const existing = slot.toppings.find(t => t.name === toppingName);
    if (existing) {
      existing.quantity++;
    } else {
      slot.toppings.push({ name: toppingName, price: priceNum, quantity: 1 });
    }
  }

  removeSlotTopping(slotIndex: number, toppingName: string): void {
    const slot = this.selectedBoxDonuts[slotIndex];
    const index = slot.toppings.findIndex(t => t.name === toppingName);
    if (index > -1) {
      if (slot.toppings[index].quantity > 1) {
        slot.toppings[index].quantity--;
      } else {
        slot.toppings.splice(index, 1);
      }
    }
  }

  get mainImage(): string {
    return this.productImages[this.currentImageIndex] || '';
  }

  nextImage(): void {
    if (this.productImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.productImages.length;
    }
  }

  prevImage(): void {
    if (this.productImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.productImages.length) % this.productImages.length;
    }
  }

  setMainImageIndex(index: number): void {
    this.currentImageIndex = index;
  }

  loadRelatedProducts(): void {
    if (!this.product) return;
    
    // Filter products in the same categories, excluding the current one
    const sameCategory = this.products.filter(p => 
      p.id !== this.product?.id && 
      p.categories.some(cat => this.product?.categories.includes(cat))
    );

    // Shuffle and pick 4
    this.relatedProducts = sameCategory
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
      
    // If not enough related products in the same category, add some random ones
    if (this.relatedProducts.length < 4) {
      const others = this.products.filter(p => 
        p.id !== this.product?.id && 
        !this.relatedProducts.find(rp => rp.id === p.id)
      );
      const extra = others
        .sort(() => Math.random() - 0.5)
        .slice(0, 4 - this.relatedProducts.length);
      this.relatedProducts = [...this.relatedProducts, ...extra];
    }
  }

  selectHeating(level: string): void {
    this.selectedHeating = level;
  }

  getToppingQuantity(name: string): number {
    const topping = this.selectedToppings.find(t => t.name === name);
    return topping ? topping.quantity : 0;
  }

  addTopping(name: string, price: string): void {
    const priceNum = parseInt(price.replace('.', ''));
    const existing = this.selectedToppings.find(t => t.name === name);
    if (existing) {
      existing.quantity++;
    } else {
      this.selectedToppings.push({ name, price: priceNum, quantity: 1 });
    }
  }

  removeTopping(name: string): void {
    const index = this.selectedToppings.findIndex(t => t.name === name);
    if (index > -1) {
      if (this.selectedToppings[index].quantity > 1) {
        this.selectedToppings[index].quantity--;
      } else {
        this.selectedToppings.splice(index, 1);
      }
    }
  }

  toggleTopping(name: string, price: string): void {
    const existing = this.selectedToppings.find(t => t.name === name);
    if (existing) {
      this.selectedToppings = this.selectedToppings.filter(t => t.name !== name);
    } else {
      const priceNum = parseInt(price.replace('.', ''));
      this.selectedToppings.push({ name, price: priceNum, quantity: 1 });
    }
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  get currentPrice(): string {
    if (!this.product) return '0';
    
    if (this.product.id === 99 || this.product.id === 100) {
      let baseSum = 0;
      this.selectedBoxDonuts.forEach(slot => {
        if (slot.productId !== undefined && slot.price !== undefined) {
          baseSum += slot.price;
          const toppingsSum = slot.toppings.reduce((sum, t) => sum + (t.price * t.quantity), 0);
          baseSum += toppingsSum;
        }
      });
      const total = Math.round(baseSum * 0.9);
      return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    const basePrice = parseInt(this.product.price.replace('.', ''));
    const toppingsPrice = this.selectedToppings.reduce((acc, t) => acc + (t.price * t.quantity), 0);
    const total = (basePrice + toppingsPrice);
    return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  get vipPrice(): string {
    if (!this.product) return '0';
    const total = parseInt(this.currentPrice.replace(/\./g, ''));
    const vip = Math.round(total * 0.85);
    return vip.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  addSuggestion(suggestion: string): void {
    if (this.reviewComment) {
      this.reviewComment += ', ' + suggestion;
    } else {
      this.reviewComment = suggestion;
    }
  }

  addToCart() {
    if (this.product) {
      const options: any = {
        heating: this.selectedHeating,
        toppings: this.selectedToppings
      };
      
      let productToSend = { ...this.product };
      
      if (this.product.id === 99 || this.product.id === 100) {
        if (this.totalBoxDonutsCount !== this.maxBoxDonutsCapacity) {
          alert(`Vui lòng chọn đủ ${this.maxBoxDonutsCapacity} vị bánh cho hộp của bạn.`);
          return;
        }
        options.boxDonuts = this.selectedBoxDonuts.map(d => ({
          productId: d.productId,
          name: d.name,
          price: d.price,
          image: d.image,
          heating: d.heating,
          toppings: d.toppings.map(t => ({
            name: t.name,
            price: t.price,
            quantity: t.quantity
          }))
        }));
        
        // Calculate undiscounted base sum of all donuts and toppings inside the slots to send to cart
        let baseSum = 0;
        this.selectedBoxDonuts.forEach(slot => {
          if (slot.productId !== undefined && slot.price !== undefined) {
            baseSum += slot.price;
            const toppingsSum = slot.toppings.reduce((sum, t) => sum + (t.price * t.quantity), 0);
            baseSum += toppingsSum;
          }
        });
        
        productToSend.price = baseSum.toString();
        productToSend.basePrice = baseSum.toString();
      }
      
      this.cartService.addToCart(productToSend, this.quantity, options);
    }
  }
}
