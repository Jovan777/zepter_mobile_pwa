import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'zepter_pwa_wishlist';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly productIdsSignal = signal<string[]>(this.loadInitialWishlist());

  readonly productIds = this.productIdsSignal.asReadonly();
  readonly count = computed(() => this.productIdsSignal().length);

  isInWishlist(productPublicId: string): boolean {
    return this.productIdsSignal().includes(productPublicId);
  }

  toggle(productPublicId: string): void {
    if (this.isInWishlist(productPublicId)) {
      this.remove(productPublicId);
      return;
    }

    this.add(productPublicId);
  }

  add(productPublicId: string): void {
    if (this.isInWishlist(productPublicId)) {
      return;
    }

    this.setIds([...this.productIdsSignal(), productPublicId]);
  }

  remove(productPublicId: string): void {
    this.setIds(this.productIdsSignal().filter((id) => id !== productPublicId));
  }

  clear(): void {
    this.setIds([]);
  }

  private setIds(ids: string[]): void {
    this.productIdsSignal.set(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  private loadInitialWishlist(): string[] {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }
}
