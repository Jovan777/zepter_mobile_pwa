import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { BannerCardComponent } from '../../shared/components/banner-card/banner-card.component';
import { ModeSwitcherComponent } from '../../shared/components/mode-switcher/mode-switcher.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

interface HomeBanner {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecimalPipe, BannerCardComponent, ModeSwitcherComponent, SearchBarComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage implements OnInit {
  private readonly productService = inject(ProductService);

  readonly featuredProducts = signal<Product[]>([]);

  readonly banners: HomeBanner[] = [
    {
      title: 'Zepter BizzClub',
      description: 'Registrujte se, kupujte i ostvarujte pogodnosti.',
      imageUrl: '/assets/images/banners/therapy-air-ion-banner.jpg',
      link: '/app/zepter-club',
      label: 'Club'
    },
    {
      title: 'Hyperlight',
      description: 'Pametna optika za savremen način života.',
      imageUrl: '/assets/images/banners/zepter-hyperlight-eyewear.jpg',
      link: '/app/categories/hyperlight-optics',
      label: 'Optics'
    },
    {
      title: 'Bioptron svetlosna terapija',
      description: 'Premium tehnologija u Zepter portfoliju.',
      imageUrl: '/assets/images/banners/bioptron.jpg',
      link: '/app/categories/bioptron',
      label: 'Health'
    },
    {
      title: 'Čista voda',
      description: 'Aqueena i Edel Wasser rešenja.',
      imageUrl: '/assets/images/banners/edelwasser-new-banner-mobile.jpg',
      link: '/app/categories/preciscavanje-vode',
      label: 'Water'
    },
    {
      title: 'Čist vazduh',
      description: 'TherapyAir i MyIon uređaji.',
      imageUrl: '/assets/images/banners/therapy-air-ion-banner.jpg',
      link: '/app/categories/preciscavanje-vazduha',
      label: 'Air'
    },
    {
      title: 'Posuđe',
      description: 'Premium kuhinjska oprema i setovi.',
      imageUrl: '/assets/images/banners/porcelain-banner-mobile-gray.jpg',
      link: '/app/categories/posudje',
      label: 'Home'
    }
  ];

  ngOnInit(): void {
    this.productService.getFeaturedProducts(8).subscribe({
      next: (response) => this.featuredProducts.set(response.data),
      error: () => this.featuredProducts.set([])
    });
  }
}