import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogPost } from '../../core/models/blog.model';
import { Product } from '../../core/models/product.model';
import { BlogService } from '../../core/services/blog.service';
import { CartService } from '../../core/services/cart.service';
import { RsdCurrencyPipe } from '../../shared/pipes/rsd-currency.pipe';
import { assetUrl } from '../../shared/utils/asset-url.util';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [RouterLink, RsdCurrencyPipe],
  templateUrl: './blog-details.page.html',
  styleUrl: './blog-details.page.scss'
})
export class BlogDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blogService = inject(BlogService);
  private readonly cartService = inject(CartService);

  readonly post = signal<BlogPost | null>(null);
  readonly relatedProducts = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly shareMessage = signal('');
  readonly addedProductPublicId = signal('');

  readonly title = computed(() => this.post()?.title || 'Blog');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');

      if (!slug) {
        this.loading.set(false);
        this.errorMessage.set('Blog tekst nije pronađen.');
        return;
      }

      this.loadPost(slug);
    });
  }

  imageUrl(path: string): string {
    return assetUrl(path);
  }

  goBack(): void {
    this.router.navigateByUrl('/app/blog');
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product.publicId, 1);
    this.addedProductPublicId.set(product.publicId);
    window.setTimeout(() => this.addedProductPublicId.set(''), 1400);
  }

  sharePost(): void {
    const post = this.post();

    if (!post) {
      return;
    }

    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => undefined);
      return;
    }

    navigator.clipboard?.writeText(window.location.href);
    this.shareMessage.set('Link je kopiran.');
    window.setTimeout(() => this.shareMessage.set(''), 1600);
  }

  private loadPost(slug: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.blogService.getPostBySlug(slug).subscribe({
      next: (response) => {
        this.post.set(response.post);
        this.relatedProducts.set(response.relatedProducts);
        this.loading.set(false);
      },
      error: () => {
        this.post.set(null);
        this.relatedProducts.set([]);
        this.loading.set(false);
        this.errorMessage.set('Blog tekst trenutno nije dostupan.');
      }
    });
  }
}
