import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface ClubBenefit {
  title: string;
  text: string;
  opened: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly emailOrPhone = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly benefits = signal<ClubBenefit[]>([
    {
      title: 'Kupovina uz ZepterClub privilegije',
      text: 'Kao član Kluba možete kupovati proizvode po povoljnijim uslovima i koristiti dostupne pogodnosti.',
      opened: true
    },
    {
      title: 'Preporučite prijateljima',
      text: 'Možete dodeliti ZepterClub privilegije prijateljima i ostvarivati pogodnosti kroz njihove kupovine.',
      opened: false
    },
    {
      title: 'Prodaja i partnerske pogodnosti',
      text: 'ZepterClub Partner može prodavati proizvode, slati ponude i pratiti učinak kroz marketing plan.',
      opened: false
    },
    {
      title: 'Druge pogodnosti',
      text: 'Pristup personalizovanim ponudama, porudžbinama, klijentima i dodatnim ZepterClub mogućnostima.',
      opened: false
    }
  ]);

  updateEmailOrPhone(value: string): void {
    this.emailOrPhone.set(value);
  }

  updatePassword(value: string): void {
    this.password.set(value);
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleBenefit(index: number): void {
    this.benefits.update((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, opened: !item.opened } : item
      )
    );
  }

  login(): void {
    this.errorMessage.set('');
    this.loading.set(true);

    const email = this.emailOrPhone().trim();
    const password = this.password();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/app/home');
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Podaci za prijavu nisu ispravni. Za demo možete koristiti demo prijavu.');
      }
    });
  }

  

  continueAsGuest(): void {
    this.authService.continueAsGuest();
    this.router.navigateByUrl('/app/home');
  }
}