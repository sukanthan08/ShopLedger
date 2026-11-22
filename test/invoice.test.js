const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function makeOrder(id, items, coupon) {
  return {
    id,
    coupon: coupon || '',
    items
  };
}

function item(id, sku, name, hsn, price, qty) {
  return { id, sku, name, hsn, price, qty, gstRate: null };
}

function assertInvoiceFigures(actual, expected) {
  assert.deepStrictEqual(actual, expected);
}

test('CURRENT BEHAVIOUR: #1001 invoice uses HSN 5% and 12% lines like checkout', () => {
  const items = [
    item(2, 'GRN-002', 'Unpolished Toor Dal 1kg', '0713', 165, 2),
    item(6, 'DRY-001', 'A2 Gir Cow Ghee 500ml', '0405', 450, 1)
  ];
  const order = makeOrder(1001, items);

  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutTotals = pricing.computeTotals(items, order.coupon);

  assertInvoiceFigures(invoiceFigures, {
    subtotal: 780,
    discount: 0,
    tax: 70.5,
    cgst: 35.25,
    sgst: 35.25,
    total: 850.5,
    rows: [
      {
        name: 'Unpolished Toor Dal 1kg',
        sku: 'GRN-002',
        hsn: '0713',
        qty: 2,
        price: 165,
        gstPercent: 5,
        line: 330,
        lineTax: 16.5
      },
      {
        name: 'A2 Gir Cow Ghee 500ml',
        sku: 'DRY-001',
        hsn: '0405',
        qty: 1,
        price: 450,
        gstPercent: 12,
        line: 450,
        lineTax: 54
      }
    ]
  });
  assert.deepStrictEqual(
    { subtotal: checkoutTotals.subtotal, discount: checkoutTotals.discount, tax: checkoutTotals.tax, total: checkoutTotals.total },
    { subtotal: 780, discount: 0, tax: 70.5, total: 850.5 }
  );
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 invoice applies discount before HSN GST', () => {
  const items = [
    item(1, 'GRN-001', 'Indrayani Basmati Rice 5kg', '1006', 640, 1),
    item(4, 'OIL-001', 'Cold-Pressed Sunflower Oil 1L', '1512', 190, 2)
  ];
  const order = makeOrder(1002, items, 'SAVE10');

  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutTotals = pricing.computeTotals(items, order.coupon);

  assertInvoiceFigures(invoiceFigures, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      {
        name: 'Indrayani Basmati Rice 5kg',
        sku: 'GRN-001',
        hsn: '1006',
        qty: 1,
        price: 640,
        gstPercent: 5,
        line: 640,
        lineTax: 28.8
      },
      {
        name: 'Cold-Pressed Sunflower Oil 1L',
        sku: 'OIL-001',
        hsn: '1512',
        qty: 2,
        price: 190,
        gstPercent: 5,
        line: 380,
        lineTax: 17.1
      }
    ]
  });
  assert.deepStrictEqual(
    { subtotal: checkoutTotals.subtotal, discount: checkoutTotals.discount, tax: checkoutTotals.tax, total: checkoutTotals.total },
    { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 }
  );
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 invoice applies the ₹150 discount cap', () => {
  const items = [
    item(5, 'OIL-002', 'Cold-Pressed Groundnut Oil 5L', '1508', 1120, 2)
  ];
  const order = makeOrder(1004, items, 'SAVE10');

  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutTotals = pricing.computeTotals(items, order.coupon);

  assertInvoiceFigures(invoiceFigures, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      {
        name: 'Cold-Pressed Groundnut Oil 5L',
        sku: 'OIL-002',
        hsn: '1508',
        qty: 2,
        price: 1120,
        gstPercent: 5,
        line: 2240,
        lineTax: 104.5
      }
    ]
  });
  assert.deepStrictEqual(
    { subtotal: checkoutTotals.subtotal, discount: checkoutTotals.discount, tax: checkoutTotals.tax, total: checkoutTotals.total },
    { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 }
  );
});

test('CURRENT BEHAVIOUR: #1008 all-18% lines match checkout without a coupon', () => {
  const items = [
    item(8, 'BEV-001', 'Assam CTC Masala Chai 250g', '0902', 140, 1),
    item(12, 'BEV-003', 'Kokum Sherbet Concentrate 750ml', '2106', 180, 2)
  ];
  const order = makeOrder(1008, items);

  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutTotals = pricing.computeTotals(items, order.coupon);

  assertInvoiceFigures(invoiceFigures, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      {
        name: 'Assam CTC Masala Chai 250g',
        sku: 'BEV-001',
        hsn: '0902',
        qty: 1,
        price: 140,
        gstPercent: 18,
        line: 140,
        lineTax: 25.2
      },
      {
        name: 'Kokum Sherbet Concentrate 750ml',
        sku: 'BEV-003',
        hsn: '2106',
        qty: 2,
        price: 180,
        gstPercent: 18,
        line: 360,
        lineTax: 64.8
      }
    ]
  });
  assert.deepStrictEqual(
    { subtotal: checkoutTotals.subtotal, discount: checkoutTotals.discount, tax: checkoutTotals.tax, total: checkoutTotals.total },
    { subtotal: 500, discount: 0, tax: 90, total: 590 }
  );
});
