import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Product, ProductQuery } from '../models/product.model';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly api = inject(ApiService);

  getProducts(query?: ProductQuery): Observable<ApiResponse<Product[]>> {
    return this.api.getWithMeta<Product[]>(
      '/products',
      query as Record<string, string | number | boolean | undefined>
    );
  }

  getFeaturedProducts(limit = 10): Observable<ApiResponse<Product[]>> {
    return this.getProducts({ featured: true, limit });
  }

  getNewProducts(limit = 10): Observable<ApiResponse<Product[]>> {
    return this.getProducts({ newOnly: true, limit });
  }

  getProductsByCategory(categorySlug: string, page = 1, limit = 30): Observable<ApiResponse<Product[]>> {
    return this.getProducts({ categorySlug, page, limit });
  }

  getProductByPublicId(publicId: string): Observable<Product> {
    return this.api.get<Product>(`/products/${publicId}`);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.api.get<Product>(`/products/slug/${slug}`);
  }
}
