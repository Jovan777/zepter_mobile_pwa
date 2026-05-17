import { Product } from '../products/product.model';
import { HttpError } from '../../utils/httpError';
import { CalculatedCartItem, CartInputItem, CartTotals, CommerceMode, PriceTier } from './cart.types';

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

export function resolveSelectedPriceTier(mode: CommerceMode, requestedTier?: PriceTier): PriceTier {
  if (requestedTier) {
    return requestedTier;
  }

  return 'retail';
}

export async function calculateCart(
  mode: CommerceMode,
  inputItems: CartInputItem[],
  requestedTier?: PriceTier
): Promise<{ items: CalculatedCartItem[]; totals: CartTotals }> {
  if (!inputItems.length) {
    throw new HttpError(400, 'Cart must contain at least one item');
  }

  const productIds = [...new Set(inputItems.map((item) => item.productPublicId))];
  const products = await Product.find({ publicId: { $in: productIds }, isActive: true }).lean();

  if (products.length !== productIds.length) {
    throw new HttpError(400, 'Some products were not found or are inactive');
  }

  const fallbackPriceTier = resolveSelectedPriceTier(mode, requestedTier);

  const items = inputItems.map((inputItem) => {
    const product = products.find((item) => item.publicId === inputItem.productPublicId);

    if (!product) {
      throw new HttpError(400, `Product not found: ${inputItem.productPublicId}`);
    }

    const quantity = Math.max(1, inputItem.quantity || 1);

    const selectedPriceTier = resolveSelectedPriceTier(mode, inputItem.selectedPriceTier || fallbackPriceTier);
    const selectedUnitPrice = product.prices[selectedPriceTier];
    const retail = money(product.prices.retail * quantity);
    const clubMember = money(product.prices.clubMember * quantity);
    const clubPartner = money(product.prices.clubPartner * quantity);
    const selectedLineTotal = money(selectedUnitPrice * quantity);

    return {
      productPublicId: product.publicId,
      name: product.name,
      code: product.code,
      categoryName: product.categoryName,
      imageUrl: product.images[0] || '',
      quantity,
      selectedPriceTier,
      selectedUnitPrice,
      selectedLineTotal,
      unitPrices: {
        retail: product.prices.retail,
        clubMember: product.prices.clubMember,
        clubPartner: product.prices.clubPartner
      },
      lineTotals: {
        retail,
        clubMember,
        clubPartner,
        selected: selectedLineTotal
      }
    };
  });

  const retailSubtotal = money(items.reduce((sum, item) => sum + item.lineTotals.retail, 0));
  const clubMemberSubtotal = money(items.reduce((sum, item) => sum + item.lineTotals.clubMember, 0));
  const clubPartnerSubtotal = money(items.reduce((sum, item) => sum + item.lineTotals.clubPartner, 0));
  const selectedSubtotal = money(items.reduce((sum, item) => sum + item.lineTotals.selected, 0));

  const deliveryFee = selectedSubtotal >= 10000 ? 0 : 450;

  const totals: CartTotals = {
    retailSubtotal,
    clubMemberSubtotal,
    clubPartnerSubtotal,
    selectedSubtotal,
    deliveryFee,
    grandTotal: money(selectedSubtotal + deliveryFee),
    currency: 'RSD',
    selectedPriceTier: fallbackPriceTier
  };

  return { items, totals };
}
