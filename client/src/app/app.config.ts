import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor]))
  ]
};
