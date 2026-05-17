import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { BlogDetailsResponse, BlogPost } from '../models/blog.model';

export interface BlogQuery {
  category?: string;
  featured?: boolean;
  q?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly api = inject(ApiService);

  getPosts(params?: BlogQuery): Observable<BlogPost[]> {
    return this.api.get<BlogPost[]>(
      '/blog',
      params as Record<string, string | number | boolean | undefined>
    );
  }

  getPostBySlug(slug: string): Observable<BlogDetailsResponse> {
    return this.api.get<BlogDetailsResponse>(`/blog/${slug}`);
  }
}
