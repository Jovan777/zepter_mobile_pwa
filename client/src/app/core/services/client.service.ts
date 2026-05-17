import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Client } from '../models/client.model';

export type CreateClientPayload = Pick<
  Client,
  | 'ownerUserPublicId'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'city'
  | 'country'
  | 'clubStatus'
  | 'notes'
>;

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly api = inject(ApiService);

  getClients(ownerUserPublicId?: string): Observable<Client[]> {
    return this.api.get<Client[]>('/clients', { ownerUserPublicId });
  }

  createClient(payload: CreateClientPayload): Observable<Client> {
    return this.api.post<Client, CreateClientPayload>('/clients', payload);
  }
}
