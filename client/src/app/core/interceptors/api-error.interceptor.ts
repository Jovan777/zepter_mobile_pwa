import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface UiApiError {
  status: number;
  message: string;
  raw?: unknown;
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const normalizedError: UiApiError = {
        status: error.status,
        message:
          error.error?.message ||
          error.message ||
          'Došlo je do greške prilikom komunikacije sa serverom.',
        raw: error.error
      };

      return throwError(() => normalizedError);
    })
  );
};
