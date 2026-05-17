import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Order } from '../models/order.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly api = inject(ApiService);

  getOrders(userPublicId?: string): Observable<Order[]> {
    const query = userPublicId ? `?userPublicId=${encodeURIComponent(userPublicId)}` : '';

    return this.api.get<ApiResponse<Order[]> | Order[]>(`/orders${query}`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }

        return response.data;
      })
    );
  }

  getOrderByPublicId(publicId: string): Observable<Order> {
    return this.api.get<ApiResponse<Order> | Order>(`/orders/${publicId}`).pipe(
      map((response) => {
        if ('data' in response) {
          return response.data;
        }

        return response;
      })
    );
  }
}