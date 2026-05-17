import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { User } from '../models/user.model';

interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterZepterClubPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  address?: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: Pick<User, 'publicId' | 'email' | 'firstName' | 'lastName' | 'role' | 'clubStatus'>;
}

const TOKEN_KEY = 'zepter_pwa_token';
const USER_KEY = 'zepter_pwa_user';
const GUEST_KEY = 'zepter_pwa_guest';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly userSignal = signal<LoginResponse['user'] | null>(this.loadStoredUser());
  private readonly guestSignal = signal<boolean>(this.loadGuestState());

  readonly user = this.userSignal.asReadonly();

  readonly isLoggedIn = computed(() => !!this.userSignal());
  readonly isGuest = computed(() => this.guestSignal() && !this.userSignal());
  readonly hasAccess = computed(() => this.isLoggedIn() || this.isGuest());

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.api.post<LoginResponse, LoginPayload>('/auth/login', payload).pipe(
      tap((response) => this.persistSession(response))
    );
  }

  demoLogin(): Observable<LoginResponse> {
    return this.api.post<LoginResponse, Record<string, never>>('/auth/demo-login', {}).pipe(
      tap((response) => this.persistSession(response))
    );
  }

  registerZepterClub(payload: RegisterZepterClubPayload): Observable<LoginResponse> {
    return this.api
      .post<LoginResponse, RegisterZepterClubPayload>('/auth/register-zepter-club', payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  continueAsGuest(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(GUEST_KEY, 'true');

    this.userSignal.set(null);
    this.guestSignal.set(true);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(GUEST_KEY);

    this.userSignal.set(null);
    this.guestSignal.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    localStorage.removeItem(GUEST_KEY);

    this.userSignal.set(response.user);
    this.guestSignal.set(false);
  }

  private loadStoredUser(): LoginResponse['user'] | null {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LoginResponse['user'];
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  private loadGuestState(): boolean {
    return localStorage.getItem(GUEST_KEY) === 'true';
  }
}
