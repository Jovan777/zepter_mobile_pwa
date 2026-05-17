import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

type HelpVisual =
  | 'search'
  | 'cart'
  | 'share'
  | 'cart-review'
  | 'payment'
  | 'orders'
  | 'invite'
  | 'start';

interface HelpSlide {
  title: string;
  subtitle?: string;
  visual: HelpVisual;
}

@Component({
  selector: 'app-help',
  standalone: true,
  templateUrl: './help.page.html',
  styleUrl: './help.page.scss'
})
export class HelpPage {
  private readonly router = inject(Router);

  readonly slides: HelpSlide[] = [
    {
      title: 'Dodirnite polje za pretragu i unesite pojam koji tražite.',
      visual: 'search'
    },
    {
      title: 'Dvaput dodirnite proizvod ili ikonicu korpe da biste ga dodali u korpu.',
      visual: 'cart'
    },
    {
      title: 'Podelite svoje Zepter iskustvo na platformama koje koristite.',
      visual: 'share'
    },
    {
      title: 'Proverite izabrane proizvode u korpi pre nastavka.',
      visual: 'cart-review'
    },
    {
      title: 'Izaberite način plaćanja i pratite korake za završetak porudžbine.',
      visual: 'payment'
    },
    {
      title: 'Proverite svoje porudžbine i status svakog zahteva.',
      visual: 'orders'
    },
    {
      title: 'Pozovite prijatelje i ostvarite pogodnosti kroz njihove prve kupovine.',
      visual: 'invite'
    },
    {
      title: 'Hajde da počnemo,',
      subtitle: 'uživajte u svom Zepter iskustvu',
      visual: 'start'
    }
  ];

  readonly activeIndex = signal(0);
  readonly direction = signal<'next' | 'prev'>('next');
  readonly animate = signal(true);

  readonly activeSlide = computed(() => this.slides[this.activeIndex()]);
  readonly isFirst = computed(() => this.activeIndex() === 0);
  readonly isLast = computed(() => this.activeIndex() === this.slides.length - 1);

  goBack(): void {
    if (this.isFirst()) {
      this.router.navigateByUrl('/app/home');
      return;
    }

    this.setSlide(this.activeIndex() - 1, 'prev');
  }

  goNext(): void {
    if (this.isLast()) {
      this.router.navigateByUrl('/app/home');
      return;
    }

    this.setSlide(this.activeIndex() + 1, 'next');
  }

  goToSlide(index: number): void {
    if (index === this.activeIndex()) {
      return;
    }

    this.setSlide(index, index > this.activeIndex() ? 'next' : 'prev');
  }

  private setSlide(index: number, direction: 'next' | 'prev'): void {
    this.direction.set(direction);
    this.animate.set(false);
    this.activeIndex.set(index);

    window.requestAnimationFrame(() => {
      this.animate.set(true);
    });
  }
}