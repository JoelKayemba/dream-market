/**
 * Calculs commission Dream Field (taux en % 0-100)
 */

export const clampCommissionRate = (rate) => {
  const value = Number(rate);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
};

export const computeCommissionAmounts = (subtotal, commissionRatePercent) => {
  const gross = Math.max(0, Number(subtotal) || 0);
  const rate = clampCommissionRate(commissionRatePercent);
  const commissionAmount = Math.round(gross * rate) / 100;
  const farmerPayoutAmount = Math.max(0, Math.round((gross - commissionAmount) * 100) / 100);
  return {
    subtotal: gross,
    commission_rate: rate,
    commission_amount: commissionAmount,
    farmer_payout_amount: farmerPayoutAmount,
  };
};

export const getLineFinancials = (item, fallbackRate = 0) => {
  const subtotal =
    Number(item?.subtotal) ||
    (Number(item?.product_price) || 0) * (Number(item?.quantity) || 0);

  if (item?.commission_amount != null && item?.farmer_payout_amount != null) {
    return {
      subtotal,
      commission_rate: clampCommissionRate(item.commission_rate ?? fallbackRate),
      commission_amount: Number(item.commission_amount) || 0,
      farmer_payout_amount: Number(item.farmer_payout_amount) || 0,
      isEstimated: false,
    };
  }

  const computed = computeCommissionAmounts(subtotal, item?.commission_rate ?? fallbackRate);
  return { ...computed, isEstimated: item?.commission_rate == null && fallbackRate > 0 };
};

export const buildOrderItemWithCommission = (baseItem, commissionRatePercent) => {
  const amounts = computeCommissionAmounts(baseItem.subtotal, commissionRatePercent);
  return {
    ...baseItem,
    commission_rate: amounts.commission_rate,
    commission_amount: amounts.commission_amount,
    farmer_payout_amount: amounts.farmer_payout_amount,
  };
};

export const formatCommissionRate = (rate) => `${clampCommissionRate(rate)} %`;

export const formatMoney = (amount, currency = 'CDF') => {
  const value = Number(amount) || 0;
  if ((currency || 'CDF').toUpperCase() === 'USD') return `$${value.toFixed(2)}`;
  return `${Math.round(value).toLocaleString('fr-FR')} CDF`;
};

export const sumOrderItemsFinancials = (items = [], fallbackRate = 0) => {
  return items.reduce(
    (acc, item) => {
      const line = getLineFinancials(item, fallbackRate);
      const currency = (item?.product_currency || 'CDF').toUpperCase();
      const isUsd = currency === 'USD';
      acc.gross += line.subtotal;
      acc.commission += line.commission_amount;
      acc.payout += line.farmer_payout_amount;
      if (isUsd) {
        acc.grossUsd += line.subtotal;
        acc.commissionUsd += line.commission_amount;
        acc.payoutUsd += line.farmer_payout_amount;
      } else {
        acc.grossCdf += line.subtotal;
        acc.commissionCdf += line.commission_amount;
        acc.payoutCdf += line.farmer_payout_amount;
      }
      return acc;
    },
    {
      gross: 0,
      commission: 0,
      payout: 0,
      grossCdf: 0,
      grossUsd: 0,
      commissionCdf: 0,
      commissionUsd: 0,
      payoutCdf: 0,
      payoutUsd: 0,
    }
  );
};
