import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RegionService } from '../services/region.service';

export const regionSelectedGuard: CanActivateFn = () => {
  const regionService = inject(RegionService);
  const router = inject(Router);

  if (regionService.selectedRegion()) {
    return true;
  }

  return router.createUrlTree(['/region']);
};
