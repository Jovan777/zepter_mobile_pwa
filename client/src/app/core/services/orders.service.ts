import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly api = inject(ApiService);

  getOrders(userPublicId?: string): Observable<Order[]> {
    return this.api.get<Order[]>('/orders', { userPublicId });
  }

  getOrderByPublicId(publicId: string): Observable<Order> {
    return this.api.get<Order>(`/orders/${publicId}`);
  }
}
