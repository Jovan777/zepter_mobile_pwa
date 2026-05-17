import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CalculatedCartItem, PriceTier } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';
import { CommerceModeService } from '../../core/services/commerce-mode.service';
import { RsdCurrencyPipe } from '../../shared/pipes/rsd-currency.pipe';
import { assetUrl } from '../../shared/utils/asset-url.util';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, RsdCurrencyPipe],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.scss'
})
export class CartPage implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly commerceModeService = inject(CommerceModeService);
  private readonly router = inject(Router);

  readonly cart = this.cartService.calculatedCart;
  readonly items = this.cartService.items;
  readonly mode = this.commerceModeService.mode;
  readonly modeLabel = this.commerceModeService.modeLabel;

  readonly selectedPriceTier = signal<PriceTier>('clubMember');
  readonly loading = signal(false);
  readonly message = signal('');

  readonly hasItems = computed(() => this.items().length > 0);

  readonly savings = computed(() => {
    const totals = this.cart()?.totals;

    if (!totals) {
      return 0;
    }

    return Math.max(totals.retailSubtotal - totals.selectedSubtotal, 0);
  });

  ngOnInit(): void {
    this.recalculateCart();
  }

  imageUrl(path: string): string {
    return assetUrl(path);
  }

  increaseQuantity(item: CalculatedCartItem): void {
    this.cartService.updateQuantity(item.productPublicId, item.quantity + 1);
    this.recalculateCart();
  }

  decreaseQuantity(item: CalculatedCartItem): void {
    this.cartService.updateQuantity(item.productPublicId, item.quantity - 1);
    this.recalculateCart();
  }

  removeItem(item: CalculatedCartItem): void {
    this.cartService.removeItem(item.productPublicId);
    this.recalculateCart();
  }

  clearCart(): void {
    const confirmed = window.confirm('Da li želite da ispraznite korpu?');

    if (!confirmed) {
      return;
    }

    this.cartService.clearCart();
  }

  goToCheckout(): void {
    if (this.mode() === 'OFFERING') {
      this.router.navigateByUrl('/app/offer');
      return;
    }

    this.router.navigateByUrl('/app/checkout');
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/app/categories');
  }

  private recalculateCart(): void {
    if (this.items().length === 0) {
      this.cartService.clearCart();
      return;
    }

    this.loading.set(true);

    this.cartService.calculate(this.selectedPriceTier()).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.message.set('Trenutno nije moguće izračunati korpu.');
      }
    });
  }
}