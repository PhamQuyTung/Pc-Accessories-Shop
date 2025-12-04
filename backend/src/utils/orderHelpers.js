const { normalizeProduct } = require("./normalizeProduct");

const populateFields = `
  name slug price discountPrice images status deleted quantity lockPromotionId
  promotionApplied.promoId promotionApplied.percent promotionApplied.soldCount promotionApplied.appliedAt
  promotionGifts giftItems variations
`;

async function populateAndNormalizeOrder(orderQuery) {
  // ✅ Populate trong một pass duy nhất
  const order = await orderQuery
    .populate("items.product_id", populateFields)
    .populate({
      path: "items.gifts.productId",
      model: "Product",
      select: "name images price slug",
    })
    // ✅ FIX: Populate variation attributes theo đúng path
    .populate({
      path: "items.product_id.variations.attributes.attrId",
      model: "Attribute",
      select: "name type",
    })
    .populate({
      path: "items.product_id.variations.attributes.terms",
      model: "AttributeTerm",
      select: "name colorCode",
    });

  // ✅ Map variation_data từ items
  const plain = order.toObject();

  plain.items = plain.items.map((i) => {
    const variation = i.product_id?.variations && i.variation_id
      ? i.product_id.variations.find(v => String(v._id) === String(i.variation_id))
      : null;

    return {
      ...i,
      product_id: normalizeProduct(i.product_id),
      variation_data: variation || null, // ✅ Lấy variation data đã populate
      gifts: (i.gifts || []).map((g) => ({
        ...g,
        productId: g.productId ? normalizeProduct(g.productId) : null,
      })),
    };
  });

  return plain;
}

module.exports = { populateAndNormalizeOrder, populateFields };
