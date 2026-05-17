import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BlogPost } from '../../core/models/blog.model';
import { BlogService } from '../../core/services/blog.service';
import { assetUrl } from '../../shared/utils/asset-url.util';

type BlogFilter = 'all' | 'health' | 'water' | 'air' | 'club';

interface BlogChip {
  key: BlogFilter;
  label: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog.page.html',
  styleUrl: './blog.page.scss'
})
export class BlogPage implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly router = inject(Router);

  readonly posts = signal<BlogPost[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly searchTerm = signal('');
  readonly selectedFilter = signal<BlogFilter>('all');

  readonly chips: BlogChip[] = [
    { key: 'all', label: 'Sve' },
    { key: 'health', label: 'Zdravlje' },
    { key: 'water', label: 'Voda' },
    { key: 'air', label: 'Vazduh' },
    { key: 'club', label: 'BizzClub' }
  ];

  readonly filteredPosts = computed(() => {
    const term = this.normalize(this.searchTerm());
    const filter = this.selectedFilter();

    return this.posts().filter((post) => {
      const matchesSearch = !term || this.searchBlob(post).includes(term);
      return matchesSearch && this.matchesFilter(post, filter);
    });
  });

  readonly featuredPost = computed(() => this.filteredPosts().find((post) => post.isFeatured));

  readonly listPosts = computed(() => {
    const featured = this.featuredPost();

    if (!featured) {
      return this.filteredPosts();
    }

    return this.filteredPosts().filter((post) => post.publicId !== featured.publicId);
  });

  ngOnInit(): void {
    this.loadPosts();
  }

  setFilter(filter: BlogFilter): void {
    this.selectedFilter.set(filter);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  imageUrl(path: string): string {
    return assetUrl(path);
  }

  openPost(post: BlogPost): void {
    this.router.navigate(['/app/blog', post.slug]);
  }

  private loadPosts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.blogService.getPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.posts.set([]);
        this.loading.set(false);
        this.errorMessage.set('Blog trenutno nije dostupan.');
      }
    });
  }

  private matchesFilter(post: BlogPost, filter: BlogFilter): boolean {
    if (filter === 'all') {
      return true;
    }

    const blob = this.searchBlob(post);

    if (filter === 'health') {
      return this.normalize(post.category) === 'zdravlje';
    }

    if (filter === 'water') {
      return ['voda', 'vodi', 'water', 'edelwasser', 'aqueena'].some((word) =>
        blob.includes(word)
      );
    }

    if (filter === 'air') {
      return ['vazduh', 'air', 'myion', 'therapyair'].some((word) => blob.includes(word));
    }

    return blob.includes('bizzclub') || blob.includes('club');
  }

  private searchBlob(post: BlogPost): string {
    return this.normalize(
      [
        post.title,
        post.subtitle,
        post.excerpt,
        post.author,
        post.category,
        post.content.map((block) => `${block.text || ''} ${(block.items || []).join(' ')}`).join(' ')
      ].join(' ')
    );
  }

  private normalize(value?: string): string {
    return (value || '').toLocaleLowerCase('sr-RS');
  }
}
