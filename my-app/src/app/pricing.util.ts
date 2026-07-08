export interface OrderClassification {
  orderType: 'small' | 'large' | 'custom';
  depositPercent: number;
  depositAmount: number;
  remainingAmount: number;
}

export function classifyOrder(totalAmount: number, isCustom = false): OrderClassification {
  if (isCustom) {
    return buildResult('custom', totalAmount);
  }
  if (totalAmount < 500_000) {
    return { orderType: 'small', depositPercent: 0, depositAmount: 0, remainingAmount: totalAmount };
  }
  return buildResult('large', totalAmount);
}

export interface ShippingResult {
  fee: number | null;
  estimatedTime: string;
}

export function calculateShipping(distanceKm: number, subtotal: number): ShippingResult {
  if (distanceKm > 15) return { fee: null, estimatedTime: '' };

  let row: [number, number, number];
  let time: string;
  if (distanceKm <= 5) {
    row = [20_000, 10_000, 0];
    time = '20–30 phút';
  } else if (distanceKm <= 10) {
    row = [30_000, 30_000, 10_000];
    time = '30–45 phút';
  } else {
    row = [40_000, 30_000, 20_000];
    time = '45–60 phút';
  }

  let fee: number;
  if (subtotal < 500_000) fee = row[0];
  else if (subtotal <= 2_000_000) fee = row[1];
  else fee = row[2];

  return { fee, estimatedTime: time };
}

export function applyDiscountCap(subtotal: number, starsDiscount: number, voucherDiscount: number): { stars: number; voucher: number } {
  const maxStars = Math.floor(subtotal * 0.3);
  const cappedStars = Math.min(starsDiscount, maxStars);
  const maxTotal = Math.floor(subtotal * 0.5);
  const cappedVoucher = Math.min(voucherDiscount, maxTotal - cappedStars);
  return { stars: Math.max(0, cappedStars), voucher: Math.max(0, cappedVoucher) };
}

function buildResult(type: 'large' | 'custom', total: number): OrderClassification {
  let pct: number;
  if (total < 1_000_000) pct = 30;
  else if (total < 2_000_000) pct = 40;
  else pct = 50;
  const dep = Math.round(total * pct / 100);
  return { orderType: type, depositPercent: pct, depositAmount: dep, remainingAmount: total - dep };
}

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}
