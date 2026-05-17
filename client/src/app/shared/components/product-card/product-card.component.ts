import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
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

  addToCart(): void {
    this.cartService.addItem(this.product.publicId, 1);
    this.addedToCart.emit(this.product);
  }

  toggleWishlist(): void {
    this.wishlistService.toggle(this.product.publicId);
  }
}