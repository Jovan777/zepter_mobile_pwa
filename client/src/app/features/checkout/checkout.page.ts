import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PaymentMethod, PersonDetails } from '../../core/models/order.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { CommerceModeService } from '../../core/services/commerce-mode.service';
import { RsdCurrencyPipe } from '../../shared/pipes/rsd-currency.pipe';
import { assetUrl } from '../../shared/utils/asset-url.util';

type CheckoutStep = 'buyer' | 'payment' | 'review' | 'success';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  postalCode: string;
  city: string;
  phonePrefix: string;
  phone: string;
  email: string;
  pickupFromOffice: boolean;
  comment: string;
  promoCode: string;
  clientWantsClubMembership: boolean;
}

interface PaymentOption {
  value: PaymentMethod;
  title: string;
  description: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, RsdCurrencyPipe],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss'
})
export class CheckoutPage implements OnInit {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly commerceModeService = inject(CommerceModeService);

  readonly cart = this.cartService.calculatedCart;
  readonly step = signal<CheckoutStep>('buyer');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly createdOrderPublicId = signal('');

  readonly paymentMethod = signal<PaymentMethod>('CARD');
  readonly mode = this.commerceModeService.mode;
  readonly isSelling = computed(() => this.mode() === 'SELLING');

  readonly captchaCode = signal(this.generateCaptcha());
  readonly captchaInput = signal('');

readonly form = signal<CheckoutForm>({
  firstName: '',
  lastName: '',
  country: 'Republika Srbija',
  address: '',
  postalCode: '',
  city: '',
  phonePrefix: '+381',
  phone: '',
  email: '',
  pickupFromOffice: false,
  comment: '',
  promoCode: '',
  clientWantsClubMembership: false
});

  readonly paymentOptions: PaymentOption[] = [
    {
      value: 'CARD',
      title: 'Online plaćanje karticom',
      description: 'Plaćanje karticom zahteva kasniju integraciju platnog procesora.'
    },
    {
      value: 'PAYMENT_SLIP',
      title: 'Bankovni prenos / uplatnica',
      description: 'Porudžbina se potvrđuje nakon evidentiranja uplate.'
    },
    {
      value: 'CASH_ON_DELIVERY',
      title: 'Plaćanje pouzećem',
      description: 'Plaćanje prilikom isporuke, ako je dostupno za izabrani region.'
    },
    {
      value: 'INSTALLMENTS',
      title: 'Plaćanje rata unapred',
      description: 'Opcija za posebne uslove plaćanja.'
    }
  ];

  readonly canContinueBuyer = computed(() => {
    const form = this.form();

    return (
      form.firstName.trim().length > 1 &&
      form.lastName.trim().length > 1 &&
      form.country.trim().length > 1 &&
      form.address.trim().length > 3 &&
      form.city.trim().length > 1 &&
      form.phone.trim().length > 4 &&
      form.email.trim().includes('@')
    );
  });

  readonly savings = computed(() => {
    const totals = this.cart()?.totals;

    if (!totals) {
      return 0;
    }

    return Math.max(totals.retailSubtotal - totals.selectedSubtotal, 0);
  });

  ngOnInit(): void {
    if (this.cartService.items().length === 0) {
      this.router.navigateByUrl('/app/cart');
      return;
    }

    const mode = this.commerceModeService.mode();
    const user = this.authService.user();

    if (mode === 'OFFERING') {
      this.router.navigateByUrl('/app/offer');
      return;
    }

    if (mode === 'SELLING' && !user) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (user && mode === 'BUYING') {
      this.form.update((form) => ({
        ...form,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }

    this.cartService.calculate().subscribe();
  }

  imageUrl(path: string): string {
    return assetUrl(path);
  }

  updateField<K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]): void {
    this.form.update((form) => ({
      ...form,
      [field]: value
    }));
  }

  updateCaptchaInput(value: string): void {
    this.captchaInput.set(value.toUpperCase());
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  goBack(): void {
    if (this.step() === 'buyer') {
      this.router.navigateByUrl('/app/cart');
      return;
    }

    if (this.step() === 'payment') {
      this.step.set('buyer');
      return;
    }

    if (this.step() === 'review') {
      this.step.set('payment');
      return;
    }

    this.router.navigateByUrl('/app/home');
  }

  goToPayment(): void {
    if (!this.canContinueBuyer()) {
      this.errorMessage.set('Popunite obavezna polja za nastavak.');
      return;
    }

    this.errorMessage.set('');
    this.step.set('payment');
  }

  goToReview(): void {
    this.errorMessage.set('');
    this.step.set('review');
  }

  refreshCaptcha(): void {
    this.captchaCode.set(this.generateCaptcha());
    this.captchaInput.set('');
  }

  submitOrder(): void {
    const cart = this.cart();

    if (!cart || this.cartService.items().length === 0) {
      this.errorMessage.set('Korpa je prazna.');
      return;
    }

    if (this.captchaInput().trim().toUpperCase() !== this.captchaCode()) {
      this.errorMessage.set('Captcha kod nije ispravno unet.');
      this.refreshCaptcha();
      return;
    }

    const mode = this.commerceModeService.mode();

    if (mode === 'OFFERING') {
      this.router.navigateByUrl('/app/offer');
      return;
    }

    const form = this.form();

    const buyerDetails: PersonDetails = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: `${form.phonePrefix}${form.phone}`.replace(/\s+/g, ''),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim()
    };

    const orderMode: 'BUYING' | 'SELLING' = mode === 'SELLING' ? 'SELLING' : 'BUYING';

    this.loading.set(true);
    this.errorMessage.set('');

    this.checkoutService
      .createOrder({
        userPublicId: this.authService.user()?.publicId || 'guest-user',
        mode: orderMode,
        items: this.cartService.items(),
        buyerDetails,
        deliveryDetails: form.pickupFromOffice ? undefined : buyerDetails,
        sameDeliveryAddress: !form.pickupFromOffice,
        isGift: false,
        clientWantsClubMembership:
          orderMode === 'SELLING' ? form.clientWantsClubMembership : false,
        paymentMethod: this.paymentMethod(),
        note: form.comment.trim(),
        promoCode: form.promoCode.trim()
      })
      .subscribe({
        next: (order) => {
          this.loading.set(false);
          this.createdOrderPublicId.set(order.publicId);
          this.step.set('success');
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Porudžbina trenutno ne može biti poslata.');
          this.refreshCaptcha();
        }
      });
  }

  private generateCaptcha(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let value = '';

    for (let index = 0; index < 5; index += 1) {
      value += chars[Math.floor(Math.random() * chars.length)];
    }

    return value;
  }
}
