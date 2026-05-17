import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { assetUrl } from '../../utils/asset-url.util';

@Component({
  selector: 'app-banner-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './banner-card.component.html',
  styleUrl: './banner-card.component.scss'
})
export class BannerCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) imageUrl = '';
  @Input() description = '';
  @Input() label = '';
  @Input() link = '/app/home';

  get backgroundImage(): string {
    return `url('${assetUrl(this.imageUrl)}')`;
  }
}