import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PriceTier } from '../../core/models/cart.model';
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { RsdCurrencyPipe } from '../../shared/pipes/rsd-currency.pipe';
import { assetUrl } from '../../shared/utils/asset-url.util';

type ProductTab = 'description' | 'details' | 'technical';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, RsdCurrencyPipe],
  templateUrl: './product-details.page.html',
  styleUrl: './product-details.page.scss'
})
export class ProductDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
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

  readonly visiblePriceTiers = computed<PriceTier[]>(() => {
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

  priceTierLabel(tier: PriceTier): string {
    const labels: Record<PriceTier, string> = {
      retail: 'MP cena',
      clubMember: 'ZepterClub cena',
      clubPartner: 'Partner cena'
    };

    return labels[tier];
  }

  discountForTier(tier: PriceTier): number {
    const product = this.product();

    if (!product) {
      return 0;
    }

    if (tier === 'clubMember') {
      return product.discounts.clubMemberPercent;
    }

    if (tier === 'clubPartner') {
      return product.discounts.clubPartnerPercent;
    }

    return 0;
  }

  addToCart(tier: PriceTier): void {
    const product = this.product();

    if (!product) {
      return;
    }

    this.cartService.addItem(product.publicId, 1, tier);
    this.addedMessage.set(`${this.priceTierLabel(tier)} je dodata u korpu.`);

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
