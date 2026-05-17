import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Region } from '../../core/models/region.model';
import { RegionService } from '../../core/services/region.service';

@Component({
  selector: 'app-region-select',
  standalone: true,
  templateUrl: './region-select.page.html',
  styleUrl: './region-select.page.scss'
})
export class RegionSelectPage implements OnInit {
  private readonly regionService = inject(RegionService);
  private readonly router = inject(Router);

  readonly regions = signal<Region[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.regionService.getRegions().subscribe({
      next: (regions) => {
        this.regions.set(regions);
        this.loading.set(false);
      },
      error: () => {
        this.regions.set([
          {
            code: 'RS',
            name: 'Srbija',
            countryName: 'Republika Srbija',
            currency: 'RSD',
            locale: 'sr-RS',
            languageCodes: ['sr'],
            isDefault: true,
            isActive: true
          }
        ]);

        this.loading.set(false);
      }
    });
  }

  selectRegion(region: Region): void {
    this.regionService.setRegion(region);
    this.router.navigateByUrl('/login');
  }
}