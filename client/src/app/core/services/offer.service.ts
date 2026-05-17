import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { CartService } from './cart.service';
import { CreateOfferPayload, Offer } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private readonly api = inject(ApiService);
  private readonly cartService = inject(CartService);

  getOffers(sellerUserPublicId?: string): Observable<Offer[]> {
    return this.api.get<Offer[]>('/offers', { sellerUserPublicId });
  }

  getOfferByPublicId(publicId: string): Observable<Offer> {
    return this.api.get<Offer>(`/offers/${publicId}`);
  }

  createOffer(payload: CreateOfferPayload): Observable<Offer> {
    return this.api.post<Offer, CreateOfferPayload>('/offers', payload).pipe(
      tap(() => this.cartService.clearCart())
    );
  }
}
