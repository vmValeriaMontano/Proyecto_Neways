const LEGACY_DISCOUNT_NAME = 'Descuento del producto';

async function getActiveDiscounts(queryable, { couponCode } = {}) {
  const result = await queryable.query(
    `SELECT id, name, code, scope, category_id, product_id, color, size,
            amount_type, amount, starts_at, ends_at, max_redemptions,
            redemption_count, is_active
     FROM discounts
     WHERE is_active = TRUE
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (ends_at IS NULL OR ends_at > NOW())
       AND (
         code IS NULL
         OR (code = $1 AND $1 IS NOT NULL
             AND (max_redemptions IS NULL OR redemption_count < max_redemptions))
       )`,
    [couponCode || null]
  );
  return result.rows;
}

function matchesScope(discount, item) {
  if (discount.scope === 'global') return true;
  if (discount.scope === 'category') {
    return Number(discount.category_id) === Number(item.category_id);
  }
  if (discount.scope === 'product') {
    return Number(discount.product_id) === Number(item.product_id);
  }
  if (discount.scope === 'color') {
    return String(discount.color).trim().toLowerCase() === String(item.color || '').trim().toLowerCase();
  }
  if (discount.scope === 'size') {
    return String(discount.size).trim().toLowerCase() === String(item.size || '').trim().toLowerCase();
  }
  return false;
}

function calculateItemPrice(item, discounts = []) {
  const price = Number(item.price);
  const candidates = [];

  const legacyPercent = Number(item.legacy_discount || item.discount || 0);
  if (legacyPercent > 0) {
    candidates.push({
      name: LEGACY_DISCOUNT_NAME,
      amount_type: 'percent',
      amount: legacyPercent,
    });
  }

  for (const discount of discounts) {
    if (matchesScope(discount, item)) candidates.push(discount);
  }

  let best = { saved: 0, name: null, amount_type: null, amount: 0 };
  for (const candidate of candidates) {
    const amount = Number(candidate.amount);
    const saved = Math.min(
      price,
      candidate.amount_type === 'percent' ? price * amount / 100 : amount
    );
    if (saved > best.saved) {
      best = { saved, name: candidate.name, amount_type: candidate.amount_type, amount };
    }
  }

  const finalPrice = Math.max(0, price - best.saved);
  const discountPercent = price > 0 ? best.saved / price * 100 : 0;
  return {
    finalPrice,
    discountAmount: best.saved,
    discountPercent,
    discountLabel: best.amount_type === 'fixed'
      ? `-$${best.saved.toFixed(2)}`
      : best.saved > 0 ? `-${discountPercent.toFixed(0)}%` : null,
    discountName: best.name,
  };
}

function quoteCart(items, discounts = []) {
  const quotedItems = items.map((item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    const priceQuote = calculateItemPrice(item, discounts);
    return {
      ...item,
      final_price: Number(priceQuote.finalPrice.toFixed(2)),
      discount_amount: Number(priceQuote.discountAmount.toFixed(2)),
      discount: Number(priceQuote.discountPercent.toFixed(2)),
      discount_label: priceQuote.discountLabel,
      discount_name: priceQuote.discountName,
      line_subtotal: Number((price * quantity).toFixed(2)),
      line_total: Number((priceQuote.finalPrice * quantity).toFixed(2)),
      line_discount: Number((priceQuote.discountAmount * quantity).toFixed(2)),
    };
  });
  const subtotal = quotedItems.reduce((sum, item) => sum + item.line_subtotal, 0);
  const finalSubtotal = quotedItems.reduce((sum, item) => sum + item.line_total, 0);
  return {
    items: quotedItems,
    subtotal: Number(subtotal.toFixed(2)),
    finalSubtotal: Number(finalSubtotal.toFixed(2)),
    discountTotal: Number((subtotal - finalSubtotal).toFixed(2)),
  };
}

module.exports = { calculateItemPrice, getActiveDiscounts, quoteCart };
