const { normalizeProduct } = require("./normalizeProduct");

const populateFields = `
  name slug price discountPrice images status deleted quantity lockPromotionId
  promotionApplied.promoId promotionApplied.percent promotionApplied.soldCount promotionApplied.appliedAt
  promotionGifts giftItems
`;

async function populateAndNormalizeOrder(orderQuery) {
  const order = await orderQuery
    .populate("items.product_id", populateFields)
    .populate({
      path: "items.gifts.productId",
      model: "Product", // 🧩 Bắt buộc thêm
      select: "name images price slug",
    });

  for (const item of order.items) {
    if (item.gifts?.length) {
      console.log(`🎁 Product: ${item.product_id.name}`);
      console.log(
        item.gifts.map((g) => ({
          giftName: g.productId?.name,
          quantity: g.quantity,
        }))
      );
    }
  }

  const plain = order.toObject();

  plain.items = plain.items.map((i) => ({
    ...i,
    product_id: normalizeProduct(i.product_id),
    gifts: (i.gifts || []).map((g) => ({
      ...g,
      productId: g.productId ? normalizeProduct(g.productId) : null,
    })),
  }));

  return plain;
}

module.exports = { populateAndNormalizeOrder, populateFields };
