import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ZepterClubPlan } from '../models/zepter-club.model';

@Injectable({
  providedIn: 'root'
})
export class ZepterClubService {
  private readonly api = inject(ApiService);

  getPlans(): Observable<ZepterClubPlan[]> {
    return this.api.get<ZepterClubPlan[]>('/zepter-club/plans');
  }
}
