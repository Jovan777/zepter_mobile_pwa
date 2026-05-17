export type CommerceMode = 'BUYING' | 'SELLING' | 'OFFERING';

export interface CommerceModeOption {
  value: CommerceMode;
  label: string;
  description: string;
}

export const COMMERCE_MODE_OPTIONS: CommerceModeOption[] = [
  {
    value: 'BUYING',
    label: 'Kupujem',
    description: 'Kupovina za sebe'
  },
  {
    value: 'SELLING',
    label: 'Prodajem',
    description: 'Prodaja za klijenta'
  },
  {
    value: 'OFFERING',
    label: 'Nudim',
    description: 'Slanje ponude klijentu'
  }
];

export const COMMERCE_MODE_LABELS: Record<CommerceMode, string> = {
  BUYING: 'Kupujem',
  SELLING: 'Prodajem',
  OFFERING: 'Nudim'
};
