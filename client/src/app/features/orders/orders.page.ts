import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../../core/models/order.model';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { RsdCurrencyPipe } from '../../shared/pipes/rsd-currency.pipe';
import { assetUrl } from '../../shared/utils/asset-url.util';

type OrderFilter = 'all' | 'active' | 'paid' | 'cod';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, RsdCurrencyPipe],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.scss'
})
export class OrdersPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly selectedFilter = signal<OrderFilter>('all');
  readonly expandedOrderPublicId = signal<string | null>(null);

  readonly isLoggedIn = this.authService.isLoggedIn;

  readonly filteredOrders = computed(() => {
    const filter = this.selectedFilter();
    const orders = this.orders();

    if (filter === 'all') {
      return orders;
    }

    if (filter === 'active') {
      return orders.filter((order) => ['DRAFT', 'CONFIRMED'].includes(order.status));
    }

    if (filter === 'paid') {
      return orders.filter(
        (order) => order.status === 'MOCK_PAID' || order.paymentStatus === 'MOCK_SUCCESS'
      );
    }

    if (filter === 'cod') {
      return orders.filter((order) => order.paymentMethod === 'CASH_ON_DELIVERY');
    }

    return orders;
  });

  readonly totalOrdersValue = computed(() =>
    this.orders().reduce((sum, order) => sum + order.totals.grandTotal, 0)
  );

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.loading.set(false);
      return;
    }

    this.loadOrders();
  }

  setFilter(filter: OrderFilter): void {
    this.selectedFilter.set(filter);
  }

  toggleOrder(publicId: string): void {
    this.expandedOrderPublicId.update((current) => (current === publicId ? null : publicId));
  }

  imageUrl(path: string): string {
    return assetUrl(path);
  }

  paymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      CARD: 'Kartica',
      CASH_ON_DELIVERY: 'Pouzeće',
      PAYMENT_SLIP: 'Bankovni prenos',
      INSTALLMENTS: 'Rate unapred'
    };

    return labels[method];
  }

  paymentStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
      NOT_PAID: 'Nije plaćeno',
      MOCK_SUCCESS: 'Plaćeno',
      CASH_ON_DELIVERY: 'Plaćanje pouzećem',
      FAILED: 'Neuspešno'
    };

    return labels[status];
  }

  orderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      DRAFT: 'Nacrt',
      CONFIRMED: 'Potvrđena',
      MOCK_PAID: 'Plaćena',
      CANCELLED: 'Otkazana'
    };

    return labels[status];
  }

  orderStatusClass(status: OrderStatus): string {
    return `orders-status--${status.toLowerCase().replace('_', '-')}`;
  }

  orderModeLabel(mode: Order['mode']): string {
    return mode === 'SELLING' ? 'Prodajem' : 'Kupujem';
  }

  copyOrderId(publicId: string): void {
    navigator.clipboard?.writeText(publicId);
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/app/categories');
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const userPublicId = this.authService.user()?.publicId;

    this.orderService.getOrders(userPublicId).subscribe({
      next: (orders: Order[]) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.loading.set(false);
        this.errorMessage.set('Porudžbine trenutno nisu dostupne.');
      }
    });
  }
}