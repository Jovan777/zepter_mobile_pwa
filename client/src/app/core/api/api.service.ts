import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

type QueryValue = string | number | boolean | null | undefined;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  get<T>(endpoint: string, query?: Record<string, QueryValue>): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, {
        params: this.buildParams(query)
      })
      .pipe(map((response) => response.data));
  }

  getWithMeta<T>(endpoint: string, query?: Record<string, QueryValue>): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, {
      params: this.buildParams(query)
    });
  }

  post<T, B = unknown>(endpoint: string, body: B): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, body)
      .pipe(map((response) => response.data));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.apiUrl}${endpoint}`)
      .pipe(map((response) => response.data));
  }

  private buildParams(query?: Record<string, QueryValue>): HttpParams {
    let params = new HttpParams();

    if (!query) {
      return params;
    }

    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
