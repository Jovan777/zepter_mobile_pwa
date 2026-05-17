import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { PriceStackComponent } from '../../shared/components/price-stack/price-stack.component';
import { RsdCurrencyPipe } from '../../shared/pipes/rsd-currency.pipe';
import { assetUrl } from '../../shared/utils/asset-url.util';

type ProductTab = 'description' | 'details' | 'technical';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, PriceStackComponent, RsdCurrencyPipe],
  templateUrl: './product-details.page.html',
  styleUrl: './product-details.page.scss'
})
export class ProductDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly selectedImageIndex = signal(0);
  readonly selectedTab = signal<ProductTab>('description');
  readonly addedMessage = signal('');

  readonly activeImage = computed(() => {
    const product = this.product();
    const index = this.selectedImageIndex();

    return assetUrl(product?.images?.[index]);
  });

  readonly isWishlisted = computed(() => {
    const product = this.product();

    if (!product) {
      return false;
    }

    return this.wishlistService.isInWishlist(product.publicId);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const publicId = params.get('publicId');

      if (!publicId) {
        this.errorMessage.set('Proizvod nije pronađen.');
        this.loading.set(false);
        return;
      }

      this.loadProduct(publicId);
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  selectTab(tab: ProductTab): void {
    this.selectedTab.set(tab);
  }

  addToCart(): void {
    const product = this.product();

    if (!product) {
      return;
    }

    this.cartService.addItem(product.publicId, 1);
    this.addedMessage.set('Proizvod je dodat u korpu.');

    window.setTimeout(() => this.addedMessage.set(''), 1600);
  }

  toggleWishlist(): void {
    const product = this.product();

    if (!product) {
      return;
    }

    this.wishlistService.toggle(product.publicId);
  }

  shareProduct(): void {
    const product = this.product();

    if (!product) {
      return;
    }

    const shareData = {
      title: product.name,
      text: product.shortDescription || product.name,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => undefined);
      return;
    }

    navigator.clipboard?.writeText(window.location.href);
  }

  private loadProduct(publicId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productService.getProductByPublicId(publicId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.selectedImageIndex.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.loading.set(false);
        this.errorMessage.set('Proizvod trenutno nije dostupan.');
      }
    });
  }
}