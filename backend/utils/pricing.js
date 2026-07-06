function computeOrderTotals(items, shippingFee = 0) {
  const itemsTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  return itemsTotal + shippingFee;
}

function classifyOrderServer(totalAmount, isCustom = false) {
  if (isCustom) {
    return buildResult('custom', totalAmount);
  }
  if (totalAmount < 500_000) {
    return { orderType: 'small', depositPercent: 0, depositAmount: 0, remainingAmount: totalAmount };
  }
  return buildResult('large', totalAmount);
}

function buildResult(type, total) {
  let pct;
  if (total < 1_000_000) pct = 30;
  else if (total < 2_000_000) pct = 40;
  else pct = 50;
  const dep = Math.round(total * pct / 100);
  return { orderType: type, depositPercent: pct, depositAmount: dep, remainingAmount: total - dep };
}

module.exports = { computeOrderTotals, classifyOrderServer };
