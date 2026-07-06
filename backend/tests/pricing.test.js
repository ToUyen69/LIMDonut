const { computeOrderTotals, classifyOrderServer } = require('../utils/pricing');

describe('computeOrderTotals', () => {
  test('tính tổng items × quantity', () => {
    const items = [
      { price: 25000, quantity: 2 },
      { price: 45000, quantity: 1 }
    ];
    expect(computeOrderTotals(items)).toBe(95000);
  });

  test('cộng thêm phí ship', () => {
    const items = [{ price: 30000, quantity: 3 }];
    expect(computeOrderTotals(items, 20000)).toBe(110000);
  });

  test('quantity mặc định là 1 khi thiếu', () => {
    expect(computeOrderTotals([{ price: 40000 }])).toBe(40000);
  });

  test('price thiếu tính là 0', () => {
    expect(computeOrderTotals([{ quantity: 5 }])).toBe(0);
  });

  test('mảng rỗng trả 0', () => {
    expect(computeOrderTotals([])).toBe(0);
  });
});

describe('classifyOrderServer', () => {
  test('đơn nhỏ < 500k: không cọc', () => {
    const r = classifyOrderServer(499999);
    expect(r).toEqual({ orderType: 'small', depositPercent: 0, depositAmount: 0, remainingAmount: 499999 });
  });

  test('đơn 500k - dưới 1 triệu: cọc 30%', () => {
    const r = classifyOrderServer(500000);
    expect(r.orderType).toBe('large');
    expect(r.depositPercent).toBe(30);
    expect(r.depositAmount).toBe(150000);
    expect(r.remainingAmount).toBe(350000);
  });

  test('đơn 1 triệu - dưới 2 triệu: cọc 40%', () => {
    const r = classifyOrderServer(1500000);
    expect(r.depositPercent).toBe(40);
    expect(r.depositAmount).toBe(600000);
    expect(r.remainingAmount).toBe(900000);
  });

  test('đơn từ 2 triệu: cọc 50%', () => {
    const r = classifyOrderServer(2000000);
    expect(r.depositPercent).toBe(50);
    expect(r.depositAmount).toBe(1000000);
    expect(r.remainingAmount).toBe(1000000);
  });

  test('đơn custom luôn có cọc, kể cả dưới 500k (30%)', () => {
    const r = classifyOrderServer(400000, true);
    expect(r.orderType).toBe('custom');
    expect(r.depositPercent).toBe(30);
    expect(r.depositAmount).toBe(120000);
  });

  test('deposit + remaining = total ở mọi mốc', () => {
    for (const total of [100000, 500000, 999999, 1000000, 1999999, 2000000, 5000000]) {
      const r = classifyOrderServer(total);
      expect(r.depositAmount + r.remainingAmount).toBe(total);
    }
  });
});
