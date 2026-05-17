import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegionService } from '../../core/services/region.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.page.html',
  styleUrl: './splash.page.scss'
})
export class SplashPage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly regionService = inject(RegionService);

  ngOnInit(): void {
    window.setTimeout(() => {
      if (!this.regionService.selectedRegion()) {
        this.router.navigateByUrl('/region');
        return;
      }

      if (!this.authService.hasAccess()) {
        this.router.navigateByUrl('/login');
        return;
      }

      this.router.navigateByUrl('/app/home');
    }, 900);
  }
}