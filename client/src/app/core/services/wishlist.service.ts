import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  WishlistProduct,
  WishlistRecord,
  WishlistToggleResponse
} from '../models/wishlist.model';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'zepter_pwa_wishlist';

interface WishlistPayload {
  userPublicId: string;
  productPublicId: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);

  private readonly productIdsSignal = signal<string[]>(this.loadInitialWishlist());

  readonly productIds = this.productIdsSignal.asReadonly();
  readonly count = computed(() => this.productIdsSignal().length);

  constructor() {
    effect(() => {
      const user = this.authService.user();

      if (!user) {
        this.productIdsSignal.set(this.loadInitialWishlist());
        return;
      }

      this.getWishlist(user.publicId).subscribe({
        error: () => undefined
      });
    });
  }

  getWishlist(userPublicId: string): Observable<WishlistProduct[]> {
    return this.api.get<WishlistProduct[]>(`/wishlist/${userPublicId}`).pipe(
      tap((products) => {
        this.productIdsSignal.set(products.map((product) => product.productPublicId));
      })
    );
  }

  addToWishlist(userPublicId: string, productPublicId: string): Observable<WishlistRecord> {
    return this.api
      .post<WishlistRecord, WishlistPayload>('/wishlist', { userPublicId, productPublicId })
      .pipe(tap(() => this.addLocalId(productPublicId, false)));
  }

  removeFromWishlist(
    userPublicId: string,
    productPublicId: string
  ): Observable<{ removed: boolean }> {
    return this.api
      .delete<{ removed: boolean }>(`/wishlist/${userPublicId}/${productPublicId}`)
      .pipe(tap(() => this.removeLocalId(productPublicId, false)));
  }

  toggleWishlist(
    userPublicId: string,
    productPublicId: string
  ): Observable<WishlistToggleResponse> {
    return this.api
      .post<WishlistToggleResponse, WishlistPayload>('/wishlist/toggle', {
        userPublicId,
        productPublicId
      })
      .pipe(
        tap((response) => {
          if (response.wishlisted) {
            this.addLocalId(productPublicId, false);
            return;
          }

          this.removeLocalId(productPublicId, false);
        })
      );
  }

  isInWishlist(productPublicId: string): boolean {
    return this.productIdsSignal().includes(productPublicId);
  }

  toggle(productPublicId: string): void {
    const user = this.authService.user();

    if (user) {
      const wasWishlisted = this.isInWishlist(productPublicId);
      this.setIds(
        wasWishlisted
          ? this.productIdsSignal().filter((id) => id !== productPublicId)
          : [...this.productIdsSignal(), productPublicId],
        false
      );

      this.toggleWishlist(user.publicId, productPublicId)
        .pipe(
          catchError(() => {
            this.setIds(
              wasWishlisted
                ? [...this.productIdsSignal(), productPublicId]
                : this.productIdsSignal().filter((id) => id !== productPublicId),
              false
            );

            return of(null);
          })
        )
        .subscribe();
      return;
    }

    if (this.isInWishlist(productPublicId)) {
      this.remove(productPublicId);
      return;
    }

    this.add(productPublicId);
  }

  add(productPublicId: string): void {
    const user = this.authService.user();

    if (user) {
      this.addLocalId(productPublicId, false);
      this.addToWishlist(user.publicId, productPublicId).subscribe({
        error: () => this.removeLocalId(productPublicId, false)
      });
      return;
    }

    this.addLocalId(productPublicId, true);
  }

  remove(productPublicId: string): void {
    const user = this.authService.user();

    if (user) {
      this.removeLocalId(productPublicId, false);
      this.removeFromWishlist(user.publicId, productPublicId).subscribe({
        error: () => this.addLocalId(productPublicId, false)
      });
      return;
    }

    this.removeLocalId(productPublicId, true);
  }

  clear(): void {
    this.setIds([], !this.authService.user());
  }

  private addLocalId(productPublicId: string, persistGuest: boolean): void {
    if (this.isInWishlist(productPublicId)) {
      return;
    }

    this.setIds([...this.productIdsSignal(), productPublicId], persistGuest);
  }

  private removeLocalId(productPublicId: string, persistGuest: boolean): void {
    this.setIds(
      this.productIdsSignal().filter((id) => id !== productPublicId),
      persistGuest
    );
  }

  private setIds(ids: string[], persistGuest: boolean): void {
    this.productIdsSignal.set([...new Set(ids)]);

    if (persistGuest) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.productIdsSignal()));
    }
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
