import { Component, OnInit, inject, signal } from '@angular/core';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { BannerCardComponent } from '../../shared/components/banner-card/banner-card.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [BannerCardComponent],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss'
})
export class CategoriesPage implements OnInit {
  private readonly categoryService = inject(CategoryService);

  readonly categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([])
    });
  }
}