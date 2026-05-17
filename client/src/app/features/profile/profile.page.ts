import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Client } from '../../core/models/client.model';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss'
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly clientService = inject(ClientService);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly fullName = computed(() => {
    const user = this.user();

    if (!user) {
      return '';
    }

    return `${user.firstName} ${user.lastName}`.trim();
  });

  readonly clubId = computed(() => this.user()?.clubNumber || '-');

  readonly invitedCount = computed(() => this.clients().length);

  readonly clientsPurchasesCount = computed(() =>
    this.clients().reduce((sum, client) => sum + client.purchasesCount, 0)
  );

  readonly progressPercent = computed(() => {
    const plan = this.user()?.marketingPlan;

    if (!plan || plan.requiredTurnoverForNextRank <= 0) {
      return 0;
    }

    const percent = (plan.currentTurnover / plan.requiredTurnoverForNextRank) * 100;
    return Math.max(0, Math.min(100, Math.round(percent)));
  });

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadProfile();
  }

  copyClubNumber(): void {
    const clubNumber = this.clubId();

    if (!clubNumber || clubNumber === '-') {
      return;
    }

    navigator.clipboard?.writeText(clubNumber);
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const authUser = this.authService.user();
    const request = authUser?.publicId
      ? this.profileService.getUserByPublicId(authUser.publicId)
      : this.profileService.getDemoUser();

    request.subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
        this.loadClients(user.publicId);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Profil trenutno nije dostupan.');
      }
    });
  }

  private loadClients(userPublicId: string): void {
    this.clientService.getClients(userPublicId).subscribe({
      next: (clients) => this.clients.set(clients),
      error: () => this.clients.set([])
    });
  }
}