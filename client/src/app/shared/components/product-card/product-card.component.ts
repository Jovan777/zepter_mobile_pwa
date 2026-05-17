import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { PriceTier } from '../../../core/models/cart.model';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { RsdCurrencyPipe } from '../../pipes/rsd-currency.pipe';
import { assetUrl } from '../../utils/asset-url.util';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, RsdCurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  @Input({ required: true }) product!: Product;
  @Output() addedToCart = new EventEmitter<Product>();

  get imageUrl(): string {
    return assetUrl(this.product.images?.[0]);
  }

  get isWishlisted(): boolean {
    return this.wishlistService.isInWishlist(this.product.publicId);
  }

  get visiblePriceTiers(): PriceTier[] {
    const user = this.authService.user();

    if (!user) {
      return ['retail'];
    }

    if (user.clubStatus === 'PARTNER' || user.role === 'PARTNER' || user.role === 'ADMIN') {
      return ['retail', 'clubMember', 'clubPartner'];
    }

    if (user.clubStatus === 'MEMBER') {
      return ['retail', 'clubMember'];
    }

    return ['retail'];
  }

  priceTierLabel(tier: PriceTier): string {
    const labels: Record<PriceTier, string> = {
      retail: 'MP',
      clubMember: 'Club',
      clubPartner: 'Partner'
    };

    return labels[tier];
  }

  priceForTier(tier: PriceTier): number {
    return this.product.prices[tier];
  }

  addToCart(tier: PriceTier): void {
    this.cartService.addItem(this.product.publicId, 1, tier);
    this.addedToCart.emit(this.product);
  }

  toggleWishlist(): void {
    this.wishlistService.toggle(this.product.publicId);
  }
}
