export interface Region {
  _id?: string;
  code: string;
  name: string;
  countryName: string;
  currency: 'RSD' | 'EUR';
  locale: string;
  languageCodes: string[];
  isDefault: boolean;
  isActive: boolean;
}
