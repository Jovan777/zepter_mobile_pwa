import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterZepterClubPayload } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';

type BenefitSectionId = 'discounts' | 'invite' | 'sell';

interface BenefitSection {
  id: BenefitSectionId;
  title: string;
  expanded: boolean;
}

interface InviteForm {
  firstName: string;
  lastName: string;
  email: string;
  phonePrefix: string;
  phone: string;
  privilegedPriceEnabled: boolean;
  privilegedDiscount: number | null;
  privilegedDays: number | null;
  captchaInput: string;
}

interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phonePrefix: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  password: string;
  confirmPassword: string;
  captchaInput: string;
}

@Component({
  selector: 'app-zepter-club',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './zepter-club.page.html',
  styleUrl: './zepter-club.page.scss'
})
export class ZepterClubPage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly clientService = inject(ClientService);

  readonly sections = signal<BenefitSection[]>([
    {
      id: 'discounts',
      title: 'Kupujte po povoljnijoj ceni — popusti od 5% do 40%',
      expanded: true
    },
    {
      id: 'invite',
      title: 'Pozovite partnera u Zepter Club — dobijate premiju do 10%',
      expanded: false
    },
    {
      id: 'sell',
      title: 'Počnite da zarađujete — bonusi od 5% do 40%',
      expanded: false
    }
  ]);

  readonly discountTiers = [
    { amount: '10 €', level: 'DL1', discount: '-5%' },
    { amount: '100 €', level: 'DL2', discount: '-10%' },
    { amount: '1500 €', level: 'DL3', discount: '-15%' },
    { amount: '3000 €', level: 'DL4', discount: '-20%' },
    { amount: '6000 €', level: 'DL5', discount: '-25%' },
    { amount: '15000 €', level: 'DL6', discount: '-30%' },
    { amount: '30000 €', level: 'DL7', discount: '-35%' },
    { amount: '40000 €', level: 'DL8', discount: '-40%' }
  ];

  readonly inviteRewardTiers = [
    { count: '-', summary: 'DL1 · -5% · 10 €' },
    { count: '-', summary: 'DL2 · -10% · 100 €' },
    { count: '1', summary: 'DL3 · -15% · 600 €' },
    { count: '2', summary: 'DL4 · -20% · 1500 €' },
    { count: '3', summary: 'DL5 · -25% · 3000 €' },
    { count: '4', summary: 'DL6 · -30% · 5000 €' },
    { count: '20', summary: 'DL7 · -35% · 10000 €' },
    { count: '30', summary: 'DL8 · -40% · 20000 €' }
  ];

  readonly privilegedDiscountOptions = [25, 30, 35, 40];
  readonly privilegedDurationOptions = [3, 5, 7];

  readonly form = signal<InviteForm>({
    firstName: '',
    lastName: '',
    email: '',
    phonePrefix: '+381',
    phone: '',
    privilegedPriceEnabled: false,
    privilegedDiscount: null,
    privilegedDays: null,
    captchaInput: ''
  });

  readonly registeredMembersCount = signal(0);
  readonly captchaCode = signal('');
  readonly shareMessage = signal('');
  readonly errorMessage = signal('');
  readonly registrationErrorMessage = signal('');
  readonly registrationSuccessMessage = signal('');
  readonly submitting = signal(false);
  readonly registrationSubmitting = signal(false);
  readonly successModalOpen = signal(false);

  readonly isLoggedIn = this.authService.isLoggedIn;

  readonly registrationForm = signal<RegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phonePrefix: '+381',
    phone: '',
    country: 'Republika Srbija',
    city: '',
    address: '',
    password: '',
    confirmPassword: '',
    captchaInput: ''
  });

  readonly accountName = computed(() => {
    const user = this.authService.user();

    if (!user) {
      return 'Gost';
    }

    return `${user.firstName} ${user.lastName}`.trim();
  });

  ngOnInit(): void {
    this.refreshCaptcha();
    this.loadRegisteredMembersCount();
  }

  closePage(): void {
    this.router.navigateByUrl(this.authService.isLoggedIn() ? '/app/profile' : '/app/home');
  }

  toggleSection(sectionId: BenefitSectionId): void {
    this.sections.update((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  }

  updateField<K extends keyof InviteForm>(field: K, value: InviteForm[K]): void {
    this.form.update((form) => ({
      ...form,
      [field]: value
    }));
  }

  updateRegistrationField<K extends keyof RegistrationForm>(
    field: K,
    value: RegistrationForm[K]
  ): void {
    this.registrationForm.update((form) => ({
      ...form,
      [field]: value
    }));
  }

  togglePrivilegedPrice(): void {
    this.form.update((form) => {
      const enabled = !form.privilegedPriceEnabled;

      return {
        ...form,
        privilegedPriceEnabled: enabled,
        privilegedDiscount: enabled ? form.privilegedDiscount : null,
        privilegedDays: enabled ? form.privilegedDays : null
      };
    });
  }

  selectDiscount(discount: number): void {
    this.form.update((form) => ({
      ...form,
      privilegedDiscount: discount
    }));
  }

  selectPrivilegedDays(days: number): void {
    this.form.update((form) => ({
      ...form,
      privilegedDays: days
    }));
  }

  refreshCaptcha(): void {
    this.captchaCode.set(this.generateCaptcha());
    this.form.update((form) => ({
      ...form,
      captchaInput: ''
    }));
    this.registrationForm.update((form) => ({
      ...form,
      captchaInput: ''
    }));
  }

  async shareInvite(): Promise<void> {
    const text =
      `Pridružite se Zepter BizzClub-u preko moje preporuke.\n` +
      `Kupujte uz pogodnosti, ostvarite članstvo i uživajte u Zepter privilegijama.\n` +
      `Vaš preporučilac: ${this.accountName()}.`;

    this.shareMessage.set('');

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Zepter BizzClub poziv',
          text
        });

        this.shareMessage.set('Poziv je uspešno podeljen.');
        return;
      }

      await navigator.clipboard.writeText(text);
      this.shareMessage.set('Tekst poziva je kopiran i spreman za slanje.');
    } catch {
      this.shareMessage.set('Deljenje trenutno nije uspelo. Pokušajte ponovo.');
    }
  }

  submitInvite(): void {
    this.errorMessage.set('');
    this.shareMessage.set('');

    if (!this.authService.isLoggedIn()) {
      this.errorMessage.set('Prijavite se da biste pozvali novog člana.');
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.submitting.set(true);

    window.setTimeout(() => {
      this.submitting.set(false);
      this.successModalOpen.set(true);
      this.registeredMembersCount.update((count) => count + 1);
      this.resetForm();
      this.refreshCaptcha();
    }, 700);
  }

  submitRegistration(): void {
    this.registrationErrorMessage.set('');
    this.registrationSuccessMessage.set('');

    if (!this.validateRegistrationForm()) {
      return;
    }

    const form = this.registrationForm();
    const payload: RegisterZepterClubPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: `${form.phonePrefix.trim()} ${form.phone.trim()}`.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      password: form.password
    };

    this.registrationSubmitting.set(true);

    this.authService.registerZepterClub(payload).subscribe({
      next: () => {
        this.registrationSubmitting.set(false);
        this.registrationSuccessMessage.set('Uspešno ste registrovani u Zepter Club.');
        this.resetRegistrationForm();
        this.refreshCaptcha();
        this.loadRegisteredMembersCount();
      },
      error: (error: { message?: string }) => {
        this.registrationSubmitting.set(false);
        this.registrationErrorMessage.set(
          error.message || 'Registracija trenutno nije uspela. Pokušajte ponovo.'
        );
        this.refreshCaptcha();
      }
    });
  }

  closeSuccessModal(): void {
    this.successModalOpen.set(false);
  }

  private loadRegisteredMembersCount(): void {
    const userPublicId = this.authService.user()?.publicId;

    if (!userPublicId) {
      this.registeredMembersCount.set(0);
      return;
    }

    this.clientService.getClients(userPublicId).subscribe({
      next: (clients) => this.registeredMembersCount.set(clients.length),
      error: () => this.registeredMembersCount.set(0)
    });
  }

  private validateForm(): boolean {
    const form = this.form();

    if (!form.firstName.trim()) {
      this.errorMessage.set('Unesite ime.');
      return false;
    }

    if (!form.lastName.trim()) {
      this.errorMessage.set('Unesite prezime.');
      return false;
    }

    if (!form.email.trim()) {
      this.errorMessage.set('Unesite email adresu.');
      return false;
    }

    if (!/.+@.+\..+/.test(form.email.trim())) {
      this.errorMessage.set('Unesite ispravnu email adresu.');
      return false;
    }

    if (!form.phone.trim()) {
      this.errorMessage.set('Unesite broj telefona.');
      return false;
    }

    if (form.phone.trim().length < 6) {
      this.errorMessage.set('Broj telefona je prekratak.');
      return false;
    }

    if (form.privilegedPriceEnabled && form.privilegedDiscount === null) {
      this.errorMessage.set('Izaberite nivo privilegovane cene.');
      return false;
    }

    if (form.privilegedPriceEnabled && form.privilegedDays === null) {
      this.errorMessage.set('Izaberite koliko dana traje privilegovana cena.');
      return false;
    }

    if (!form.captchaInput.trim()) {
      this.errorMessage.set('Unesite kod sa captcha slike.');
      return false;
    }

    if (form.captchaInput.trim().toUpperCase() !== this.captchaCode()) {
      this.errorMessage.set('Captcha kod nije ispravan.');
      return false;
    }

    return true;
  }

  private validateRegistrationForm(): boolean {
    const form = this.registrationForm();

    if (!form.firstName.trim()) {
      this.registrationErrorMessage.set('Unesite ime.');
      return false;
    }

    if (!form.lastName.trim()) {
      this.registrationErrorMessage.set('Unesite prezime.');
      return false;
    }

    if (!form.email.trim()) {
      this.registrationErrorMessage.set('Unesite email adresu.');
      return false;
    }

    if (!/.+@.+\..+/.test(form.email.trim())) {
      this.registrationErrorMessage.set('Unesite ispravnu email adresu.');
      return false;
    }

    if (!form.phonePrefix.trim()) {
      this.registrationErrorMessage.set('Unesite pozivni broj.');
      return false;
    }

    if (!form.phone.trim()) {
      this.registrationErrorMessage.set('Unesite broj telefona.');
      return false;
    }

    if (form.phone.trim().length < 6) {
      this.registrationErrorMessage.set('Broj telefona je prekratak.');
      return false;
    }

    if (!form.country.trim()) {
      this.registrationErrorMessage.set('Unesite državu.');
      return false;
    }

    if (form.password.length < 6) {
      this.registrationErrorMessage.set('Lozinka mora imati najmanje 6 karaktera.');
      return false;
    }

    if (form.password !== form.confirmPassword) {
      this.registrationErrorMessage.set('Lozinke se ne poklapaju.');
      return false;
    }

    if (!form.captchaInput.trim()) {
      this.registrationErrorMessage.set('Unesite kod sa captcha slike.');
      return false;
    }

    if (form.captchaInput.trim().toUpperCase() !== this.captchaCode()) {
      this.registrationErrorMessage.set('Captcha kod nije ispravan.');
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.form.set({
      firstName: '',
      lastName: '',
      email: '',
      phonePrefix: '+381',
      phone: '',
      privilegedPriceEnabled: false,
      privilegedDiscount: null,
      privilegedDays: null,
      captchaInput: ''
    });
  }

  private resetRegistrationForm(): void {
    this.registrationForm.set({
      firstName: '',
      lastName: '',
      email: '',
      phonePrefix: '+381',
      phone: '',
      country: 'Republika Srbija',
      city: '',
      address: '',
      password: '',
      confirmPassword: '',
      captchaInput: ''
    });
  }

  private generateCaptcha(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let value = '';

    for (let i = 0; i < 5; i += 1) {
      value += chars[Math.floor(Math.random() * chars.length)];
    }

    return value;
  }
}
