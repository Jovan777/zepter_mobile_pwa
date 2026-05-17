import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  CalculatedCart,
  CartCalculatePayload,
  LocalCartItem,
  PriceTier
} from '../models/cart.model';
import { CommerceModeService } from './commerce-mode.service';

const STORAGE_KEY = 'zepter_pwa_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly api = inject(ApiService);
  private readonly commerceModeService = inject(CommerceModeService);

  private readonly itemsSignal = signal<LocalCartItem[]>(this.loadInitialCart());
  private readonly calculatedCartSignal = signal<CalculatedCart | null>(null);

  readonly items = this.itemsSignal.asReadonly();
  readonly calculatedCart = this.calculatedCartSignal.asReadonly();
  readonly totalQuantity = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly hasItems = computed(() => this.itemsSignal().length > 0);

  addItem(productPublicId: string, quantity = 1): void {
    const items = [...this.itemsSignal()];
    const existing = items.find((item) => item.productPublicId === productPublicId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productPublicId, quantity });
    }

    this.setItems(items);
  }

  updateQuantity(productPublicId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productPublicId);
      return;
    }

    this.setItems(
      this.itemsSignal().map((item) =>
        item.productPublicId === productPublicId ? { ...item, quantity } : item
      )
    );
  }

  removeItem(productPublicId: string): void {
    this.setItems(this.itemsSignal().filter((item) => item.productPublicId !== productPublicId));
  }

  clearCart(): void {
    this.setItems([]);
    this.calculatedCartSignal.set(null);
  }

  calculate(selectedPriceTier?: PriceTier): Observable<CalculatedCart> {
    const payload: CartCalculatePayload = {
      mode: this.commerceModeService.mode(),
      selectedPriceTier,
      items: this.itemsSignal()
    };

    return this.api.post<CalculatedCart, CartCalculatePayload>('/cart/calculate', payload).pipe(
      tap((cart) => this.calculatedCartSignal.set(cart))
    );
  }

  private setItems(items: LocalCartItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private loadInitialCart(): LocalCartItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as LocalCartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }
}
