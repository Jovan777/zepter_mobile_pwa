import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Client } from '../../core/models/client.model';
import { OfferRecipient } from '../../core/models/offer.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ClientService } from '../../core/services/client.service';
import { OfferService } from '../../core/services/offer.service';
import { RsdCurrencyPipe } from '../../shared/pipes/rsd-currency.pipe';
import { assetUrl } from '../../shared/utils/asset-url.util';

interface ManualRecipientForm {
  firstName: string;
  lastName: string;
  email: string;
  phonePrefix: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [RouterLink, RsdCurrencyPipe],
  templateUrl: './offer.page.html',
  styleUrl: './offer.page.scss'
})
export class OfferPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly clientService = inject(ClientService);
  private readonly offerService = inject(OfferService);
  private readonly router = inject(Router);

  readonly cart = this.cartService.calculatedCart;
  readonly clients = signal<Client[]>([]);
  readonly selectedClientIds = signal<string[]>([]);
  readonly searchTerm = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successModalOpen = signal(false);
  readonly createdOfferPublicId = signal('');

  readonly privilegedEnabled = signal(true);
  readonly discountPercent = signal(10);
  readonly validUntil = signal(this.defaultValidUntil());
  readonly promoCodeEnabled = signal(false);
  readonly promoCode = signal('');
  readonly note = signal('');

  readonly manualRecipient = signal<ManualRecipientForm>({
    firstName: '',
    lastName: '',
    email: '',
    phonePrefix: '+381',
    phone: '',
    address: '',
    city: '',
    country: 'Republika Srbija'
  });

  readonly filteredClients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.clients();
    }

    return this.clients().filter((client) =>
      `${client.firstName} ${client.lastName} ${client.email || ''} ${client.phone || ''}`
        .toLowerCase()
        .includes(term)
    );
  });

  readonly selectedClientCount = computed(() => this.selectedClientIds().length);

  readonly offerSubtotal = computed(() => {
    const cart = this.cart();

    if (!cart) {
      return 0;
    }

    const multiplier = this.privilegedEnabled()
      ? (100 - Math.max(0, this.discountPercent())) / 100
      : 1;

    return Math.round(cart.totals.selectedSubtotal * multiplier * 100) / 100;
  });

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (this.cartService.items().length === 0) {
      this.router.navigateByUrl('/app/cart');
      return;
    }

    this.cartService.calculate().subscribe({
      error: () => this.errorMessage.set('Korpa trenutno nije dostupna za ponudu.')
    });

    this.clientService.getClients(this.authService.user()?.publicId).subscribe({
      next: (clients) => this.clients.set(clients),
      error: () => this.clients.set([])
    });
  }

  imageUrl(path: string): string {
    return assetUrl(path);
  }

  updateManualField<K extends keyof ManualRecipientForm>(
    field: K,
    value: ManualRecipientForm[K]
  ): void {
    this.manualRecipient.update((form) => ({
      ...form,
      [field]: value
    }));
  }

  toggleClient(clientPublicId: string): void {
    this.selectedClientIds.update((ids) =>
      ids.includes(clientPublicId)
        ? ids.filter((id) => id !== clientPublicId)
        : [...ids, clientPublicId]
    );
  }

  isClientSelected(clientPublicId: string): boolean {
    return this.selectedClientIds().includes(clientPublicId);
  }

  goBackToCart(): void {
    this.router.navigateByUrl('/app/cart');
  }

  submitOffer(): void {
    const cart = this.cart();
    const user = this.authService.user();

    if (!cart || !user) {
      this.errorMessage.set('Ponuda trenutno nije spremna za slanje.');
      return;
    }

    const recipients = this.buildRecipients();

    if (recipients.length === 0) {
      this.errorMessage.set('Izaberite klijenta ili unesite ručnog primaoca.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.offerService
      .createOffer({
        sellerUserPublicId: user.publicId,
        mode: 'OFFERING',
        items: this.cartService.items(),
        recipients,
        privilegedConditions: {
          enabled: this.privilegedEnabled(),
          discountPercent: this.privilegedEnabled() ? Number(this.discountPercent()) || 0 : 0,
          validUntil: this.validUntil(),
          promoCodeEnabled: this.promoCodeEnabled(),
          promoCode: this.promoCodeEnabled() ? this.promoCode().trim() : ''
        },
        note: this.note().trim(),
        status: 'SENT'
      })
      .subscribe({
        next: (offer) => {
          this.loading.set(false);
          this.createdOfferPublicId.set(offer.publicId);
          this.successModalOpen.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Ponuda trenutno ne može biti poslata.');
        }
      });
  }

  private buildRecipients(): OfferRecipient[] {
    const selectedClients = this.clients()
      .filter((client) => this.selectedClientIds().includes(client.publicId))
      .map((client) => ({
        clientPublicId: client.publicId,
        source: 'CLIENT' as const,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || '',
        phone: client.phone || '',
        city: client.city || '',
        country: client.country || 'Republika Srbija'
      }));

    const manual = this.manualRecipient();

    if (!manual.firstName.trim() || !manual.lastName.trim()) {
      return selectedClients;
    }

    return [
      ...selectedClients,
      {
        source: 'MANUAL',
        firstName: manual.firstName.trim(),
        lastName: manual.lastName.trim(),
        email: manual.email.trim(),
        phone: `${manual.phonePrefix.trim()} ${manual.phone.trim()}`.trim(),
        address: manual.address.trim(),
        city: manual.city.trim(),
        country: manual.country.trim()
      }
    ];
  }

  private defaultValidUntil(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  }
}
