import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'sr' | 'en';

const STORAGE_KEY = 'zepter_pwa_language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly languageSignal = signal<AppLanguage>(this.loadInitialLanguage());

  readonly language = this.languageSignal.asReadonly();

  setLanguage(language: AppLanguage): void {
    this.languageSignal.set(language);
    localStorage.setItem(STORAGE_KEY, language);
  }

  private loadInitialLanguage(): AppLanguage {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === 'sr' || stored === 'en') {
      return stored;
    }

    return 'sr';
  }
}
