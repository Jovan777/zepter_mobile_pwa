import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

type SortMode = 'default' | 'priceAsc' | 'priceDesc' | 'nameAsc';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, SearchBarComponent],
  templateUrl: './products.page.html',
  styleUrl: './products.page.scss'
})
export class ProductsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);

  readonly categorySlug = signal('');
  readonly category = signal<Category | null>(null);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly searchValue = signal('');
  readonly filterOpen = signal(false);
  readonly showOnlyNew = signal(false);
  readonly showOnlyFeatured = signal(false);
  readonly sortMode = signal<SortMode>('default');

  readonly pageTitle = computed(() => {
    const category = this.category();

    if (category) {
      return category.name;
    }

    return this.categorySlug()
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  });

  readonly filteredProducts = computed(() => {
    const search = this.searchValue().trim().toLowerCase();
    const showOnlyNew = this.showOnlyNew();
    const showOnlyFeatured = this.showOnlyFeatured();
    const sortMode = this.sortMode();

    let result = [...this.products()];

    if (search) {
      result = result.filter((product) => {
        const text = `${product.name} ${product.code} ${product.categoryName}`.toLowerCase();
        return text.includes(search);
      });
    }

    if (showOnlyNew) {
      result = result.filter((product) => product.isNew);
    }

    if (showOnlyFeatured) {
      result = result.filter((product) => product.isFeatured);
    }

    if (sortMode === 'priceAsc') {
      result.sort((a, b) => a.prices.clubMember - b.prices.clubMember);
    }

    if (sortMode === 'priceDesc') {
      result.sort((a, b) => b.prices.clubMember - a.prices.clubMember);
    }

    if (sortMode === 'nameAsc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'sr'));
    }

    return result;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') || '';
      this.categorySlug.set(slug);
      this.loadCategory(slug);
      this.loadProducts(slug);
    });
  }

  updateSearch(value: string): void {
    this.searchValue.set(value);
  }

  toggleFilter(): void {
    this.filterOpen.update((value) => !value);
  }

  closeFilter(): void {
    this.filterOpen.set(false);
  }

  setSortMode(mode: SortMode): void {
    this.sortMode.set(mode);
  }

  toggleOnlyNew(): void {
    this.showOnlyNew.update((value) => !value);
  }

  toggleOnlyFeatured(): void {
    this.showOnlyFeatured.update((value) => !value);
  }

  resetFilters(): void {
    this.searchValue.set('');
    this.showOnlyNew.set(false);
    this.showOnlyFeatured.set(false);
    this.sortMode.set('default');
  }

  private loadCategory(slug: string): void {
    this.categoryService.getCategoryBySlug(slug).subscribe({
      next: (category) => this.category.set(category),
      error: () => this.category.set(null)
    });
  }

  private loadProducts(slug: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productService.getProductsByCategory(slug, 1, 80).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
        this.errorMessage.set('Proizvodi trenutno nisu dostupni.');
      }
    });
  }
}