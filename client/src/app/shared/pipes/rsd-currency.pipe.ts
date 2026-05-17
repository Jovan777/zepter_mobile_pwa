import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rsdCurrency',
  standalone: true
})
export class RsdCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '0,00 RSD';
    }

    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 2
    }).format(value);
  }
}
