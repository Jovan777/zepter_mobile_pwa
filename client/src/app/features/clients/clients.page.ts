import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Client } from '../../core/models/client.model';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';

type ClientView = 'overview' | 'sent' | 'clients';
type PurchaseTab = 'withPurchases' | 'withoutPurchases';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './clients.page.html',
  styleUrl: './clients.page.scss'
})
export class ClientsPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly clientService = inject(ClientService);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly view = signal<ClientView>('overview');
  readonly purchaseTab = signal<PurchaseTab>('withPurchases');

  readonly invitedCount = computed(() => this.clients().length);

  readonly sentInvitations = computed(() =>
    this.clients().filter((client) => client.clubStatus === 'INVITED')
  );

  readonly clubClients = computed(() =>
    this.clients().filter((client) => client.clubStatus === 'MEMBER')
  );

  readonly clientsWithPurchases = computed(() =>
    this.clubClients().filter((client) => client.purchasesCount > 0)
  );

  readonly clientsWithoutPurchases = computed(() =>
    this.clubClients().filter((client) => client.purchasesCount === 0)
  );

  readonly activeClientList = computed(() => {
    if (this.purchaseTab() === 'withPurchases') {
      return this.clientsWithPurchases();
    }

    return this.clientsWithoutPurchases();
  });

  readonly totalTurnover = computed(() =>
    this.clientsWithPurchases().reduce((sum, client) => sum + client.totalTurnover, 0)
  );

  ngOnInit(): void {
    const user = this.authService.user();
    this.loadClients(user?.publicId);
  }

  setView(view: ClientView): void {
    this.view.set(view);
  }

  setPurchaseTab(tab: PurchaseTab): void {
    this.purchaseTab.set(tab);
  }

  private loadClients(userPublicId?: string): void {
    this.loading.set(true);

    this.clientService.getClients(userPublicId).subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => {
        this.clients.set([]);
        this.loading.set(false);
      }
    });
  }
}