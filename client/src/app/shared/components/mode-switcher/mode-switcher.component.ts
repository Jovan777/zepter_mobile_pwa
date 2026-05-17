import { Component, inject } from '@angular/core';
import { CommerceMode } from '../../../core/models/commerce-mode.model';
import { CommerceModeService } from '../../../core/services/commerce-mode.service';

@Component({
  selector: 'app-mode-switcher',
  standalone: true,
  templateUrl: './mode-switcher.component.html',
  styleUrl: './mode-switcher.component.scss'
})
export class ModeSwitcherComponent {
  readonly commerceModeService = inject(CommerceModeService);

  selectMode(mode: CommerceMode): void {
    this.commerceModeService.setMode(mode);
  }
}