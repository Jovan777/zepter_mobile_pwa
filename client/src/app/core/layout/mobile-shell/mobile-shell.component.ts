import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppDrawerComponent } from '../../../shared/components/app-drawer/app-drawer.component';
import { AppHeaderComponent } from '../../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-mobile-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppHeaderComponent, AppDrawerComponent],
  templateUrl: './mobile-shell.component.html',
  styleUrl: './mobile-shell.component.scss'
})
export class MobileShellComponent {
  readonly authService = inject(AuthService);
  readonly drawerOpen = signal(false);

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}