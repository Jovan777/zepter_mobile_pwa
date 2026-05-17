import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly api = inject(ApiService);

  getCategories(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories');
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.api.get<Category>(`/categories/${slug}`);
  }
}
