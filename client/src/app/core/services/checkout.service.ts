import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { CartService } from './cart.service';
import { CreateOrderPayload, Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly api = inject(ApiService);
  private readonly cartService = inject(CartService);

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.api.post<Order, CreateOrderPayload>('/orders', payload).pipe(
      tap(() => this.cartService.clearCart())
    );
  }
}
