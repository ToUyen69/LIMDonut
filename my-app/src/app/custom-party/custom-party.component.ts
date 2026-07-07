import { Component, signal, computed, effect, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PARTY_TIERS, SHAPES, FLAVORS, SAUCES, TOPPINGS, SURCHARGE, SAUCE_COVERAGES,
  PartyTier, SauceCoverage, ToppingParticle, generateParticles, DonutVariant
} from './party.config';
import { DonutRenderer, DonutState, ShapeGeometry } from './donut-renderer';
import { PartySetRenderer, ArrangementType } from './party-set-renderer';
import { OrderService } from '../order.service';
import { AuthService } from '../auth.service';

let variantIdCounter = 0;

function createDefaultVariant(): DonutVariant {
  return {
    id: ++variantIdCounter,
    shapeId: 'round',
    flavorId: '',
    sauceId: '',
    sauceCoverage: 'full',
    toppingIds: [],
    quantity: 1,
  };
}

@Component({
  selector: 'app-custom-party',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './custom-party.component.html',
  styleUrl: './custom-party.component.css'
})
export class CustomPartyComponent implements OnDestroy {
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('setCanvas') setCanvas!: ElementRef<HTMLCanvasElement>;

  readonly tiers = PARTY_TIERS;
  readonly shapes = SHAPES;
  readonly flavors = FLAVORS;
  readonly sauces = SAUCES;
  readonly toppings = TOPPINGS;
  readonly surcharge = SURCHARGE;
  readonly sauceCoverages = SAUCE_COVERAGES;

  private donutRenderer: DonutRenderer | null = null;
  private rendererInitialized = false;
  private setRenderer: PartySetRenderer | null = null;
  private setRendererInitialized = false;

  readonly selectedTier = signal<PartyTier | null>(null);
  readonly variants = signal<DonutVariant[]>([]);
  readonly activeVariantIndex = signal(0);
  readonly currentStep = signal(1);
  readonly showConfetti = signal(false);
  readonly donutPulse = signal(false);
  readonly pickupDate = signal('');
  readonly pickupTime = signal('');
  readonly selectedArrangement = signal('none');
  readonly activeGroup = signal<'shape' | 'flavor' | 'sauce' | 'topping'>('shape');
  readonly slotAssignments = signal<number[]>([]);
  readonly selectedSlotIndex = signal(-1);

  readonly arrangements = [
    { id: 'none', name: 'Mặc định (hộp)', icon: 'bi-box-seam', description: 'Xếp trong hộp tiêu chuẩn' },
    { id: 'pyramid', name: 'Tháp', icon: 'bi-triangle', description: 'Xếp tầng kim tự tháp' },
    { id: 'circle', name: 'Vòng tròn', icon: 'bi-circle', description: 'Xếp thành vòng tròn' },
    { id: 'heart', name: 'Trái tim', icon: 'bi-heart', description: 'Xếp hình trái tim' },
  ];

  readonly minPickupDate = computed(() => {
    const tier = this.selectedTier();
    if (!tier) return '';
    const d = new Date();
    d.setDate(d.getDate() + tier.leadTimeDays);
    return d.toISOString().split('T')[0];
  });

  readonly isDateTimeValid = computed(() => {
    const date = this.pickupDate();
    const time = this.pickupTime();
    if (!date || !time) return false;
    const min = this.minPickupDate();
    return date >= min;
  });

  readonly earliestDateLabel = computed(() => {
    const min = this.minPickupDate();
    if (!min) return '';
    const d = new Date(min + 'T00:00:00');
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
  });

  readonly activeVariant = computed(() => {
    const v = this.variants();
    const i = this.activeVariantIndex();
    return v[i] ?? null;
  });

  readonly totalAllocated = computed(() =>
    this.variants().reduce((sum, v) => sum + v.quantity, 0)
  );

  readonly allocationMatch = computed(() => {
    const tier = this.selectedTier();
    if (!tier) return false;
    return this.totalAllocated() === tier.quantity;
  });

  readonly distinctShapes = computed(() => new Set(this.variants().map(v => v.shapeId).filter(Boolean)));
  readonly distinctFlavors = computed(() => new Set(this.variants().map(v => v.flavorId).filter(Boolean)));
  readonly distinctSauces = computed(() => new Set(this.variants().map(v => v.sauceId).filter(Boolean)));
  readonly distinctToppings = computed(() => {
    const all = new Set<string>();
    this.variants().forEach(v => v.toppingIds.forEach(t => all.add(t)));
    return all;
  });

  readonly isPartyL = computed(() => this.selectedTier()?.id === 'L');

  readonly limits = computed(() => {
    const tier = this.selectedTier();
    if (!tier) return { shape: 0, flavor: 0, sauce: 0, topping: 0 };
    return tier.limits;
  });

  // Surcharges: for each category, find items beyond the limit.
  // Surcharge = sum over excess items of (quantity of donuts using that item × rate)
  readonly shapeSurcharge = computed(() => {
    if (this.isPartyL()) return 0;
    const limit = this.limits().shape;
    const items = this.distinctShapes();
    if (items.size <= limit) return 0;
    const sorted = [...items];
    const excess = sorted.slice(limit);
    return excess.reduce((sum, shapeId) => {
      const qty = this.variants().filter(v => v.shapeId === shapeId).reduce((s, v) => s + v.quantity, 0);
      return sum + qty * SURCHARGE.shape;
    }, 0);
  });

  readonly flavorSurcharge = computed(() => {
    if (this.isPartyL()) return 0;
    const limit = this.limits().flavor;
    const items = this.distinctFlavors();
    if (items.size <= limit) return 0;
    const sorted = [...items];
    const excess = sorted.slice(limit);
    return excess.reduce((sum, flavorId) => {
      const qty = this.variants().filter(v => v.flavorId === flavorId).reduce((s, v) => s + v.quantity, 0);
      return sum + qty * SURCHARGE.flavor;
    }, 0);
  });

  readonly sauceSurcharge = computed(() => {
    if (this.isPartyL()) return 0;
    const limit = this.limits().sauce;
    const items = this.distinctSauces();
    if (items.size <= limit) return 0;
    const sorted = [...items];
    const excess = sorted.slice(limit);
    return excess.reduce((sum, sauceId) => {
      const qty = this.variants().filter(v => v.sauceId === sauceId).reduce((s, v) => s + v.quantity, 0);
      return sum + qty * SURCHARGE.sauce;
    }, 0);
  });

  readonly toppingSurcharge = computed(() => {
    if (this.isPartyL()) return 0;
    const limit = this.limits().topping;
    const items = this.distinctToppings();
    if (items.size <= limit) return 0;
    const sorted = [...items];
    const excess = sorted.slice(limit);
    return excess.reduce((sum, toppingId) => {
      const qty = this.variants().filter(v => v.toppingIds.includes(toppingId)).reduce((s, v) => s + v.quantity, 0);
      return sum + qty * SURCHARGE.topping;
    }, 0);
  });

  readonly totalSurcharge = computed(() =>
    this.shapeSurcharge() + this.flavorSurcharge() + this.sauceSurcharge() + this.toppingSurcharge()
  );

  readonly totalPrice = computed(() => {
    const tier = this.selectedTier();
    if (!tier) return 0;
    return tier.price + this.totalSurcharge();
  });

  readonly depositAmount = computed(() => {
    const tier = this.selectedTier();
    if (!tier) return 0;
    return Math.round(this.totalPrice() * tier.depositPercent / 100);
  });

  // Active variant visuals for 3D preview
  readonly activeShape = computed((): ShapeGeometry => {
    const v = this.activeVariant();
    if (!v || !v.shapeId) return 'torus';
    const shape = SHAPES.find(s => s.id === v.shapeId);
    return shape?.geometry ?? 'torus';
  });

  readonly activeFlavorColor = computed(() => {
    const v = this.activeVariant();
    if (!v || !v.flavorId) return { base: '#E8C98E', inner: '#D4B06A' };
    const flavor = FLAVORS.find(f => f.id === v.flavorId);
    return { base: flavor?.baseColor ?? '#E8C98E', inner: flavor?.innerColor ?? '#D4B06A' };
  });

  readonly activeSauceColor = computed(() => {
    const v = this.activeVariant();
    if (!v || !v.sauceId) return null;
    const sauce = SAUCES.find(s => s.id === v.sauceId);
    return sauce?.color ?? null;
  });

  readonly activeSauceGlossy = computed(() => {
    const v = this.activeVariant();
    if (!v || !v.sauceId) return false;
    const sauce = SAUCES.find(s => s.id === v.sauceId);
    return sauce?.glossy ?? false;
  });

  readonly activeSauceCoverage = computed((): SauceCoverage => {
    const v = this.activeVariant();
    return v?.sauceCoverage ?? 'full';
  });

  readonly activeToppingsData = computed(() => {
    const v = this.activeVariant();
    if (!v) return [];
    return TOPPINGS.filter(t => v.toppingIds.includes(t.id)).map(t => ({
      colors: t.particleColors,
      shape: t.particleShape,
    }));
  });

  readonly toppingParticles = computed<ToppingParticle[]>(() => {
    const v = this.activeVariant();
    if (!v) return [];
    return generateParticles(v.toppingIds);
  });

  readonly canProceed = computed(() => {
    const step = this.currentStep();
    if (step === 1) return this.selectedTier() !== null && this.isDateTimeValid();
    if (step === 2) {
      const vs = this.variants();
      if (vs.length === 0) return false;
      const allComplete = vs.every(v => v.shapeId && v.flavorId && v.quantity > 0);
      return allComplete && this.allocationMatch();
    }
    return true;
  });

  readonly orderData = computed(() => {
    const tier = this.selectedTier();
    if (!tier) return null;
    return {
      tier: tier.id, tierName: tier.name, quantity: tier.quantity,
      variants: this.variants().map(v => ({
        shape: v.shapeId,
        flavor: v.flavorId,
        sauce: v.sauceId,
        sauceCoverage: v.sauceCoverage,
        toppings: v.toppingIds,
        quantity: v.quantity,
      })),
      surcharges: {
        shape: this.shapeSurcharge(), flavor: this.flavorSurcharge(),
        sauce: this.sauceSurcharge(), topping: this.toppingSurcharge(),
        total: this.totalSurcharge(),
      },
      basePrice: tier.price, totalPrice: this.totalPrice(),
      depositPercent: tier.depositPercent, depositAmount: this.depositAmount(),
    };
  });

  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  readonly orderError = signal('');
  readonly isSubmitting = signal(false);
  readonly customerName = signal('');
  readonly customerPhone = signal('');
  readonly customerInfoError = signal('');
  readonly isCustomerInfoValid = computed(() => this.customerName().trim().length > 0 && /^\d{10}$/.test(this.customerPhone()));

  readonly cancelDeadline = computed(() => {
    const tier = this.selectedTier();
    const date = this.pickupDate();
    const time = this.pickupTime();
    if (!tier || !date || !time) return null;
    const pickup = new Date(`${date}T${time}:00`);
    pickup.setHours(pickup.getHours() - tier.cancelDeadlineHours);
    return pickup;
  });

  readonly cancelDeadlineLabel = computed(() => {
    const d = this.cancelDeadline();
    if (!d) return '';
    return d.toLocaleString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  });

  constructor(private router: Router) {
    effect(() => {
      const shape = this.activeShape();
      const flavorColor = this.activeFlavorColor();
      const sauceColor = this.activeSauceColor();
      const sauceGlossy = this.activeSauceGlossy();
      const coverage = this.activeSauceCoverage();
      const toppingsData = this.activeToppingsData();

      if (this.donutRenderer && this.rendererInitialized) {
        this.donutRenderer.updateState({
          shape,
          flavorColor: flavorColor.base,
          flavorInnerColor: flavorColor.inner,
          sauceColor,
          sauceGlossy,
          sauceCoverage: coverage,
          toppings: toppingsData,
        });
      }
    });
  }

  initDonut3D() {
    if (this.rendererInitialized || !this.donutCanvas) return;
    const canvas = this.donutCanvas.nativeElement;
    if (!canvas) return;
    this.donutRenderer = new DonutRenderer();
    this.donutRenderer.init(canvas);
    this.rendererInitialized = true;

    const state: DonutState = {
      shape: this.activeShape(),
      flavorColor: this.activeFlavorColor().base,
      flavorInnerColor: this.activeFlavorColor().inner,
      sauceColor: this.activeSauceColor(),
      sauceGlossy: this.activeSauceGlossy(),
      sauceCoverage: this.activeSauceCoverage(),
      toppings: this.activeToppingsData(),
    };
    this.donutRenderer.updateState(state);
  }

  ngOnDestroy() {
    this.donutRenderer?.dispose();
    this.setRenderer?.dispose();
  }

  private buildSlotAssignments(): number[] {
    const vs = this.variants();
    const assignments: number[] = [];
    vs.forEach((v, idx) => {
      for (let i = 0; i < v.quantity; i++) assignments.push(idx);
    });
    return assignments;
  }

  initSet3D() {
    if (this.setRendererInitialized || !this.setCanvas) return;
    const canvas = this.setCanvas.nativeElement;
    if (!canvas) return;
    this.setRenderer = new PartySetRenderer();
    this.setRenderer.init(canvas);
    this.setRendererInitialized = true;

    this.setRenderer.onSwap((a, b) => {
      const sa = [...this.slotAssignments()];
      [sa[a], sa[b]] = [sa[b], sa[a]];
      this.slotAssignments.set(sa);
    });
    this.setRenderer.onSelect((idx) => this.selectedSlotIndex.set(idx));

    this.refreshSet3D();
  }

  refreshSet3D() {
    if (!this.setRenderer) return;
    const sa = this.buildSlotAssignments();
    this.slotAssignments.set(sa);
    this.setRenderer.updateSet(
      this.variants(),
      this.selectedArrangement() as ArrangementType,
      sa,
    );
  }

  onArrangementChange(id: string) {
    this.selectedArrangement.set(id);
    this.refreshSet3D();
  }

  triggerPulse() {
    this.donutPulse.set(true);
    setTimeout(() => this.donutPulse.set(false), 600);
  }

  selectTier(tier: PartyTier) {
    const prev = this.selectedTier();
    this.selectedTier.set(tier);
    if (!prev || prev.id !== tier.id) {
      const first = createDefaultVariant();
      first.quantity = tier.quantity;
      this.variants.set([first]);
      this.activeVariantIndex.set(0);
      this.pickupDate.set('');
      this.pickupTime.set('');
      this.selectedArrangement.set('none');
    }
  }

  addVariant() {
    const vs = [...this.variants()];
    const newV = createDefaultVariant();
    newV.quantity = 0;
    vs.push(newV);
    this.variants.set(vs);
    this.activeVariantIndex.set(vs.length - 1);
    this.triggerPulse();
  }

  removeVariant(index: number) {
    const vs = [...this.variants()];
    if (vs.length <= 1) return;
    vs.splice(index, 1);
    this.variants.set(vs);
    if (this.activeVariantIndex() >= vs.length) {
      this.activeVariantIndex.set(vs.length - 1);
    }
    this.triggerPulse();
  }

  selectActiveVariant(index: number) {
    this.activeVariantIndex.set(index);
    this.triggerPulse();
  }

  private updateActiveVariant(updater: (v: DonutVariant) => DonutVariant) {
    const vs = [...this.variants()];
    const i = this.activeVariantIndex();
    if (i < 0 || i >= vs.length) return;
    vs[i] = updater({ ...vs[i] });
    this.variants.set(vs);
    this.triggerPulse();
  }

  setVariantShape(shapeId: string) {
    this.updateActiveVariant(v => ({ ...v, shapeId }));
  }

  setVariantFlavor(flavorId: string) {
    this.updateActiveVariant(v => ({ ...v, flavorId }));
  }

  setVariantSauce(sauceId: string) {
    this.updateActiveVariant(v => {
      if (v.sauceId === sauceId) return { ...v, sauceId: '' };
      return { ...v, sauceId };
    });
  }

  setVariantSauceCoverage(coverage: SauceCoverage) {
    this.updateActiveVariant(v => ({ ...v, sauceCoverage: coverage }));
  }

  toggleVariantTopping(toppingId: string) {
    this.updateActiveVariant(v => {
      const ids = [...v.toppingIds];
      const idx = ids.indexOf(toppingId);
      if (idx >= 0) ids.splice(idx, 1); else ids.push(toppingId);
      return { ...v, toppingIds: ids };
    });
  }

  setVariantQuantity(index: number, qty: number) {
    const vs = [...this.variants()];
    if (index < 0 || index >= vs.length) return;
    vs[index] = { ...vs[index], quantity: Math.max(0, qty) };
    this.variants.set(vs);
  }

  distributeEvenly() {
    const tier = this.selectedTier();
    if (!tier) return;
    const vs = [...this.variants()];
    const base = Math.floor(tier.quantity / vs.length);
    let remainder = tier.quantity - base * vs.length;
    for (let i = 0; i < vs.length; i++) {
      vs[i] = { ...vs[i], quantity: base + (remainder > 0 ? 1 : 0) };
      if (remainder > 0) remainder--;
    }
    this.variants.set(vs);
  }

  isVariantShapeSelected(shapeId: string): boolean {
    return this.activeVariant()?.shapeId === shapeId;
  }

  isVariantFlavorSelected(flavorId: string): boolean {
    return this.activeVariant()?.flavorId === flavorId;
  }

  isVariantSauceSelected(sauceId: string): boolean {
    return this.activeVariant()?.sauceId === sauceId;
  }

  isVariantToppingSelected(toppingId: string): boolean {
    return this.activeVariant()?.toppingIds.includes(toppingId) ?? false;
  }

  isVariantComplete(v: DonutVariant): boolean {
    return !!(v.shapeId && v.flavorId && v.quantity > 0);
  }

  getShapeName(id: string): string { return SHAPES.find(s => s.id === id)?.name ?? ''; }
  getFlavorName(id: string): string { return FLAVORS.find(f => f.id === id)?.name ?? ''; }
  getSauceName(id: string): string { return SAUCES.find(s => s.id === id)?.name ?? ''; }
  getToppingNames(ids: string[]): string[] { return ids.map(id => TOPPINGS.find(t => t.id === id)?.name ?? '').filter(Boolean); }
  getFlavorColor(id: string): string { return FLAVORS.find(f => f.id === id)?.baseColor ?? '#E8C98E'; }
  getShapeIcon(id: string): string { return SHAPES.find(s => s.id === id)?.icon ?? 'bi-circle'; }

  // Tóm tắt lựa chọn của biến thể đang cấu hình, hiện trên header accordion khi nhóm đóng
  getGroupSummary(category: 'shape' | 'flavor' | 'sauce' | 'topping'): string {
    const v = this.activeVariant();
    if (!v) return '';
    switch (category) {
      case 'shape': return v.shapeId ? this.getShapeName(v.shapeId) : '';
      case 'flavor': return v.flavorId ? this.getFlavorName(v.flavorId) : '';
      case 'sauce': {
        if (!v.sauceId) return '';
        const cov = SAUCE_COVERAGES.find(c => c.id === v.sauceCoverage)?.name ?? '';
        return `${this.getSauceName(v.sauceId)}${cov ? ' · ' + cov : ''}`;
      }
      case 'topping': return this.getToppingNames(v.toppingIds).join(', ');
    }
  }

  isOverLimitCategory(category: 'shape' | 'flavor' | 'sauce' | 'topping'): boolean {
    if (this.isPartyL()) return false;
    const counts = {
      shape: this.distinctShapes().size,
      flavor: this.distinctFlavors().size,
      sauce: this.distinctSauces().size,
      topping: this.distinctToppings().size,
    };
    return counts[category] > this.limits()[category];
  }

  getCategorySurcharge(category: 'shape' | 'flavor' | 'sauce' | 'topping'): number {
    return ({ shape: this.shapeSurcharge, flavor: this.flavorSurcharge, sauce: this.sauceSurcharge, topping: this.toppingSurcharge })[category]();
  }

  goToStep(step: number) {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  nextStep() {
    if (this.currentStep() < 4 && this.canProceed()) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (this.currentStep() === 2) setTimeout(() => this.initDonut3D(), 100);
      if (this.currentStep() === 3) setTimeout(() => this.initSet3D(), 150);
      if (this.currentStep() === 4) setTimeout(() => this.initDonut3D(), 100);
    }
  }
  prevStep() { if (this.currentStep() > 1) { this.currentStep.update(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  skipArrangement() { this.selectedArrangement.set('none'); this.nextStep(); }

  confirmOrder() {
    const data = this.orderData();
    const tier = this.selectedTier();
    if (!this.isCustomerInfoValid()) {
      this.orderError.set('Vui lòng nhập đầy đủ tên và số điện thoại hợp lệ.');
      return;
    }
    if (!data || !tier || this.isSubmitting()) return;

    const items = this.variants().map(v => ({
      id: `custom-${v.id}`,
      name: `${this.getShapeName(v.shapeId)} - ${this.getFlavorName(v.flavorId)} - ${this.getSauceName(v.sauceId)} - ${this.getToppingNames(v.toppingIds).join(', ')}`,
      price: Math.round(data.totalPrice / tier.quantity),
      quantity: v.quantity,
      image: '',
      options: {
        shape: v.shapeId,
        flavor: v.flavorId,
        sauce: v.sauceId,
        sauceCoverage: v.sauceCoverage,
        toppings: v.toppingIds.map(id => ({ name: this.getToppingName(id), quantity: 1 })),
      }
    }));

    const pickupDateTime = `${this.pickupDate()} ${this.pickupTime()}`;
    const order: any = {
      orderId: 'CP-' + Math.floor(1000000 + Math.random() * 9000000),
      totalAmount: data.totalPrice,
      orderType: 'custom',
      depositPercent: data.depositPercent,
      depositAmount: data.depositAmount,
      remainingAmount: data.totalPrice - data.depositAmount,
      deliveryMethod: 'pickup',
      status: 'Đã đặt',
      customerInfo: {
        name: this.customerName().trim(),
        phone: this.customerPhone(),
        address: `Lấy tại quầy (Custom Party ${tier.name})`,
        deliveryTime: pickupDateTime,
        notes: `Custom Party ${tier.name} - ${tier.quantity} bánh - Xếp hình: ${this.arrangements.find(a => a.id === this.selectedArrangement())?.name ?? 'Mặc định'}`,
      },
      items,
      customPartyMeta: { ...data, arrangement: this.selectedArrangement(), slotAssignments: this.slotAssignments() },
      cancelDeadline: this.cancelDeadline()?.toISOString() ?? null,
      statusHistory: [{ status: 'Đã đặt', at: new Date() }],
    };

    this.isSubmitting.set(true);
    this.orderError.set('');
    this.orderService.addOrder(order).subscribe({
      next: () => {
        this.showConfetti.set(true);
        this.authService.fetchMe().subscribe({ error: () => {} });
        setTimeout(() => {
          this.showConfetti.set(false);
          if (this.authService.isLoggedIn()) {
            this.router.navigate(['/orders']);
          } else {
            this.router.navigate(['/orders'], { queryParams: { phone: this.customerPhone(), name: this.customerName().trim(), justPlaced: order.orderId } });
          }
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.orderError.set(err.error?.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
      }
    });
  }

  getToppingName(id: string): string { return TOPPINGS.find(t => t.id === id)?.name ?? ''; }

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }
}
