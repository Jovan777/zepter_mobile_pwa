import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

interface ProfileSettingsForm {
  firstName: string;
  lastName: string;
  country: string;
  street: string;
  postalCode: string;
  city: string;
  email: string;
  phonePrefix: string;
  phone: string;
  clubNumber: string;
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-settings.page.html',
  styleUrl: './profile-settings.page.scss'
})
export class ProfileSettingsPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly user = signal<User | null>(null);

  readonly form = signal<ProfileSettingsForm>({
    firstName: '',
    lastName: '',
    country: 'Republika Srbija',
    street: '',
    postalCode: '',
    city: '',
    email: '',
    phonePrefix: '+381',
    phone: '',
    clubNumber: ''
  });

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadProfile();
  }

  updateField<K extends keyof ProfileSettingsForm>(field: K, value: ProfileSettingsForm[K]): void {
    this.form.update((form) => ({
      ...form,
      [field]: value
    }));
  }

  saveProfile(): void {
    this.saving.set(true);
    this.message.set('');

    window.setTimeout(() => {
      this.saving.set(false);
      this.message.set('Izmene su sačuvane za potrebe POC prikaza.');
    }, 600);
  }

  private loadProfile(): void {
    const authUser = this.authService.user();
    const request = authUser?.publicId
      ? this.profileService.getUserByPublicId(authUser.publicId)
      : this.profileService.getDemoUser();

    request.subscribe({
      next: (user) => {
        this.user.set(user);
        this.form.set({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          country: user.address?.country || 'Republika Srbija',
          street: user.address?.street || '',
          postalCode: user.address?.postalCode || '',
          city: user.address?.city || '',
          email: user.email || '',
          phonePrefix: '+381',
          phone: user.phone?.replace('+381', '') || '',
          clubNumber: user.clubNumber || ''
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.message.set('Podaci profila trenutno nisu dostupni.');
      }
    });
  }
}