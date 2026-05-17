import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Region } from '../models/region.model';

const STORAGE_KEY = 'zepter_pwa_region';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private readonly api = inject(ApiService);
  private readonly selectedRegionSignal = signal<Region | null>(this.loadStoredRegion());

  readonly selectedRegion = this.selectedRegionSignal.asReadonly();

  getRegions(): Observable<Region[]> {
    return this.api.get<Region[]>('/regions');
  }

  setRegion(region: Region): void {
    this.selectedRegionSignal.set(region);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(region));
  }

  loadDefaultRegion(): Observable<Region[]> {
    return this.getRegions().pipe(
      tap((regions) => {
        if (this.selectedRegionSignal()) {
          return;
        }

        const defaultRegion = regions.find((region) => region.isDefault) || regions[0];

        if (defaultRegion) {
          this.setRegion(defaultRegion);
        }
      })
    );
  }

  private loadStoredRegion(): Region | null {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Region;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
