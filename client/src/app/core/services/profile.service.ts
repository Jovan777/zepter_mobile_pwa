import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly api = inject(ApiService);

  getDemoUser(): Observable<User> {
    return this.api.get<User>('/users/demo');
  }

  getUserByPublicId(publicId: string): Observable<User> {
    return this.api.get<User>(`/users/${publicId}`);
  }
}
