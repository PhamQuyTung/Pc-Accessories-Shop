const { normalizeProduct } = require("./normalizeProduct");

const populateFields = `
  name slug price discountPrice images status deleted quantity lockPromotionId
  promotionApplied.promoId promotionApplied.percent promotionApplied.soldCount promotionApplied.appliedAt
`;
async function populateAndNormalizeOrder(orderQuery) {
  const order = await orderQuery.populate("items.product_id", populateFields);

  const plain = order.toObject();
  plain.items = plain.items.map((i) => ({
    ...i,
    product_id: normalizeProduct(i.product_id),
  }));

  return plain;
}

module.exports = { populateAndNormalizeOrder, populateFields };
