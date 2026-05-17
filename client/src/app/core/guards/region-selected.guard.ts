import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RegionService } from '../services/region.service';

export const regionSelectedGuard: CanActivateFn = (_route, state) => {
  const regionService = inject(RegionService);
  const router = inject(Router);

  if (regionService.selectedRegion() || state.url === '/app/zepter-club') {
    return true;
  }

  return router.createUrlTree(['/region']);
};
