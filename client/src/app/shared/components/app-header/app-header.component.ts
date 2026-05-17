import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent {
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  @Output() menuClick = new EventEmitter<void>();

  readonly cartCount = this.cartService.totalQuantity;
  readonly wishlistCount = computed(() => this.wishlistService.count());
}