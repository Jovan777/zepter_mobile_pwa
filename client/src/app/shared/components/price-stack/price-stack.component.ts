import { Component, Input } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { RsdCurrencyPipe } from '../../pipes/rsd-currency.pipe';

@Component({
  selector: 'app-price-stack',
  standalone: true,
  imports: [RsdCurrencyPipe],
  templateUrl: './price-stack.component.html',
  styleUrl: './price-stack.component.scss'
})
export class PriceStackComponent {
  @Input({ required: true }) product!: Product;
}