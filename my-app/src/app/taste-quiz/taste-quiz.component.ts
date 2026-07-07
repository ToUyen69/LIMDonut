import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../product.service';
import { ImgUrlPipe } from '../img-url.pipe';

interface QuizAnswers {
  taste: string; // ngot_dam | ngot_nhe | man | chua_nhe
  diet: string;  // none | chay | it_duong | khong_gluten
  pref: string;  // nhan_chay | gion_rum | hot
  budget: string; // duoi_30 | 30_40 | none
}

@Component({
  selector: 'app-taste-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ImgUrlPipe],
  templateUrl: './taste-quiz.component.html',
  styleUrl: './taste-quiz.component.css'
})
export class TasteQuizComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  // Quiz visibility state
  showButton = signal(false);
  isOpen = signal(false);
  step = signal(1); // 1, 2, 3, 4 for questions, 5 for results

  // User answers
  answers: QuizAnswers = {
    taste: 'ngot_dam',
    diet: 'none',
    pref: 'nhan_chay',
    budget: 'none'
  };

  // Recommended products list
  recommendations = signal<(Product & { reason: string })[]>([]);

  ngOnInit() {
    this.updateVisibility(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateVisibility(event.urlAfterRedirects || event.url);
      }
    });

    // First time auto-popup logic for new visitors
    const hasSeen = localStorage.getItem('hasSeenTasteQuiz');
    if (!hasSeen) {
      setTimeout(() => {
        if (this.showButton()) {
          this.openQuiz();
        }
      }, 2000);
    }
  }

  private updateVisibility(url: string) {
    const cleanUrl = url.split('?')[0];
    const isAllowedPage = cleanUrl === '/' || cleanUrl === '/menu';
    this.showButton.set(isAllowedPage);
  }

  openQuiz() {
    this.isOpen.set(true);
    this.step.set(1);
    localStorage.setItem('hasSeenTasteQuiz', 'true');
  }

  closeQuiz() {
    this.isOpen.set(false);
  }

  selectTaste(val: string) {
    this.answers.taste = val;
    this.nextStep();
  }

  selectDiet(val: string) {
    this.answers.diet = val;
    this.nextStep();
  }

  selectPref(val: string) {
    this.answers.pref = val;
    this.nextStep();
  }

  selectBudget(val: string) {
    this.answers.budget = val;
    this.calculateResults();
  }

  nextStep() {
    this.step.update(s => s + 1);
  }

  prevStep() {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  calculateResults() {
    const products = this.productService.getProducts();
    const scored = this.scoreProducts(products, this.answers);
    this.recommendations.set(scored);
    this.step.set(5);
  }

  resetQuiz() {
    this.step.set(1);
    this.answers = {
      taste: 'ngot_dam',
      diet: 'none',
      pref: 'nhan_chay',
      budget: 'none'
    };
  }

  scoreProducts(products: Product[], answers: QuizAnswers): (Product & { reason: string })[] {
    const activeProducts = products.filter(p => p.stock > 0 && p.id !== 99 && p.id !== 100);

    const scored = activeProducts.map(p => {
      let score = 0;
      const cats = p.categories || [];
      const labels = p.labels || [];
      const name = p.name.toLowerCase();
      const dietTags = p.dietary || [];

      // Base sold tie-breaker
      score += (p.sold || 0) / 10000;

      // Question 1: Taste
      if (answers.taste === 'ngot_dam') {
        if (cats.includes('Cà phê & Cacao') || cats.includes('Nguyên Bản')) score += 3;
        if (labels.some(l => l.includes('Ngọt') || l.includes('Béo'))) score += 1.5;
      } else if (answers.taste === 'ngot_nhe') {
        if (cats.includes('Nguyên Bản')) score += 2;
        if (dietTags.some(d => d.includes('Ít đường') || d.includes('Ít ngọt') || d.includes('Nhẹ'))) score += 3;
      } else if (answers.taste === 'man') {
        if (cats.includes('Mặn') || name.includes('mặn') || name.includes('bacon') || name.includes('hotdog') || name.includes('chà bông')) score += 3;
      } else if (answers.taste === 'chua_nhe') {
        if (cats.includes('Trà & Quả') || name.includes('chanh') || name.includes('dứa') || name.includes('passion') || name.includes('quả')) score += 3;
      }

      // Question 2: Diet
      if (answers.diet !== 'none') {
        if (answers.diet === 'chay' && dietTags.some(d => d.toLowerCase().includes('chay'))) {
          score += 3;
        } else if (answers.diet === 'it_duong' && dietTags.some(d => d.toLowerCase().includes('đường') || d.toLowerCase().includes('ngọt'))) {
          score += 3;
        } else if (answers.diet === 'khong_gluten' && dietTags.some(d => d.toLowerCase().includes('gluten'))) {
          score += 3;
        }
      }

      // Question 3: Preference
      if (answers.pref === 'nhan_chay') {
        if (labels.some(l => l.includes('Nhân chảy')) || name.includes('chảy') || p.description.toLowerCase().includes('chảy')) {
          score += 2;
        }
      } else if (answers.pref === 'gion_rum') {
        if (cats.includes('Nguyên Bản') || name.includes('vụn') || name.includes('giòn')) {
          score += 2;
        }
      } else if (answers.pref === 'hot') {
        if (p.sold > 150) score += 2;
      }

      // Question 4: Budget
      const priceNum = parseInt(p.price.replace(/\./g, ''), 10) || 0;
      if (answers.budget === 'duoi_30') {
        if (priceNum < 30000) score += 2;
      } else if (answers.budget === '30_40') {
        if (priceNum >= 30000 && priceNum <= 40000) score += 2;
      }

      // Dynamic custom reason mapping (no emojis)
      const reasons: string[] = [];
      if (answers.taste === 'ngot_dam' && (cats.includes('Cà phê & Cacao') || cats.includes('Nguyên Bản'))) {
        reasons.push("vị ngọt đậm đà thơm béo");
      } else if (answers.taste === 'chua_nhe' && cats.includes('Trà & Quả')) {
        reasons.push("vị chua nhẹ thanh mát");
      } else if (answers.taste === 'man' && (cats.includes('Mặn') || name.includes('chà bông') || name.includes('hotdog'))) {
        reasons.push("vị mặn ngon lạ miệng");
      } else if (answers.taste === 'ngot_nhe') {
        reasons.push("vị thanh ngọt dễ chịu");
      }

      if (answers.diet !== 'none') {
        if (answers.diet === 'chay') reasons.push("ăn chay lành tính");
        if (answers.diet === 'it_duong') reasons.push("ít ngọt kiêng đường");
        if (answers.diet === 'khong_gluten') reasons.push("không gluten");
      }

      if (answers.pref === 'nhan_chay' && (labels.some(l => l.includes('Nhân chảy')) || name.includes('chảy'))) {
        reasons.push("nhân sốt chảy độc đáo");
      } else if (answers.pref === 'hot' && p.sold > 150) {
        reasons.push("bán chạy nhất tiệm");
      }

      let reason = "Món ngon đề cử dành riêng cho bạn!";
      if (reasons.length > 0) {
        reason = `Hợp vì ${reasons.slice(0, 2).join(' + ')}`;
      }

      return { ...p, score, reason };
    });

    scored.sort((a, b) => b.score - a.score);

    let topItems = scored.filter(s => s.score > 0.1);

    if (topItems.length < 3) {
      const remaining = scored.filter(s => !topItems.some(t => t.id === s.id));
      topItems = [...topItems, ...remaining.slice(0, 3 - topItems.length)];
    }

    return topItems.slice(0, 3).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      rating: item.rating,
      reviews: item.reviews,
      image: item.image,
      categories: item.categories,
      toppings: item.toppings,
      labels: item.labels,
      dietary: item.dietary,
      nutrition: item.nutrition,
      allergens: item.allergens,
      sold: item.sold,
      stock: item.stock,
      flashSale: item.flashSale,
      reason: item.reason
    }));
  }
}
