import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Product } from '../../core/models/product.model';
import { WishlistProduct } from '../../core/models/wishlist.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { RsdCurrencyPipe } from '../../shared/pipes/rsd-currency.pipe';
import { assetUrl } from '../../shared/utils/asset-url.util';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, RsdCurrencyPipe],
  templateUrl: './wishlist.page.html',
  styleUrl: './wishlist.page.scss'
})
export class WishlistPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  readonly products = signal<WishlistProduct[]>([]);
  readonly loading = signal(true);
  readonly message = signal('');
  readonly addedProductId = signal('');

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly isGuest = this.authService.isGuest;
  readonly user = this.authService.user;
  readonly hasProducts = computed(() => this.products().length > 0);

  ngOnInit(): void {
    this.loadWishlist();
  }

  imageUrl(path: string): string {
    return assetUrl(path);
  }

  removeProduct(product: WishlistProduct): void {
    const previousProducts = this.products();
    this.products.set(
      previousProducts.filter((item) => item.productPublicId !== product.productPublicId)
    );

    const user = this.user();

    if (!user) {
      this.wishlistService.remove(product.productPublicId);
      return;
    }

    this.wishlistService.removeFromWishlist(user.publicId, product.productPublicId).subscribe({
      error: () => {
        this.products.set(previousProducts);
        this.message.set('Proizvod trenutno nije moguće ukloniti iz liste želja.');
      }
    });
  }

  addToCart(product: WishlistProduct): void {
    this.cartService.addItem(product.productPublicId, 1);
    this.addedProductId.set(product.productPublicId);
    window.setTimeout(() => this.addedProductId.set(''), 1400);
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/app/categories');
  }

  private loadWishlist(): void {
    this.loading.set(true);
    this.message.set('');

    const user = this.user();

    if (user) {
      this.wishlistService.getWishlist(user.publicId).subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.loading.set(false);
          this.message.set('Lista želja trenutno nije dostupna.');
        }
      });
      return;
    }

    this.loadGuestWishlist();
  }

  private loadGuestWishlist(): void {
    const productIds = this.wishlistService.productIds();

    if (productIds.length === 0) {
      this.products.set([]);
      this.loading.set(false);
      return;
    }

    forkJoin(productIds.map((productPublicId) => this.productService.getProductByPublicId(productPublicId)))
      .subscribe({
        next: (products) => {
          this.products.set(products.map((product) => this.toWishlistProduct(product)));
          this.loading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.loading.set(false);
          this.message.set('Sačuvani proizvodi trenutno nisu dostupni.');
        }
      });
  }

  private toWishlistProduct(product: Product): WishlistProduct {
    return {
      productPublicId: product.publicId,
      name: product.name,
      code: product.code,
      categoryName: product.categoryName,
      imageUrl: product.images?.[0] || '',
      prices: product.prices,
      discounts: product.discounts
    };
  }
}
