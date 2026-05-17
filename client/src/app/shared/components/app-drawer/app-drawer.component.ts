import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommerceModeService } from '../../../core/services/commerce-mode.service';
import { RegionService } from '../../../core/services/region.service';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './app-drawer.component.html',
  styleUrl: './app-drawer.component.scss'
})
export class AppDrawerComponent {
  readonly authService = inject(AuthService);
  private readonly commerceModeService = inject(CommerceModeService);
  private readonly regionService = inject(RegionService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  readonly modeLabel = this.commerceModeService.modeLabel;

  get regionName(): string {
    return this.regionService.selectedRegion()?.name || 'Srbija';
  }

  demoLogin(): void {
    this.authService.demoLogin().subscribe();
    this.close.emit();
  }

  logout(): void {
    this.authService.logout();
    this.close.emit();
  }
}