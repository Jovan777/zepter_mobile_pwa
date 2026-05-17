import { Injectable, computed, signal } from '@angular/core';
import {
  COMMERCE_MODE_LABELS,
  COMMERCE_MODE_OPTIONS,
  CommerceMode
} from '../models/commerce-mode.model';

const STORAGE_KEY = 'zepter_pwa_commerce_mode';

@Injectable({
  providedIn: 'root'
})
export class CommerceModeService {
  private readonly modeSignal = signal<CommerceMode>(this.loadInitialMode());

  readonly mode = this.modeSignal.asReadonly();
  readonly modeLabel = computed(() => COMMERCE_MODE_LABELS[this.modeSignal()]);
  readonly options = COMMERCE_MODE_OPTIONS;

  setMode(mode: CommerceMode): void {
    this.modeSignal.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  private loadInitialMode(): CommerceMode {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === 'BUYING' || stored === 'SELLING' || stored === 'OFFERING') {
      return stored;
    }

    return 'BUYING';
  }
}
