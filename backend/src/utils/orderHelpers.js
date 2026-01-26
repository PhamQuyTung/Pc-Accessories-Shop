const { normalizeProduct } = require("./normalizeProduct");

const populateFields = `
  name slug price discountPrice images status deleted quantity lockPromotionId
  promotionApplied.promoId promotionApplied.percent promotionApplied.soldCount promotionApplied.appliedAt
  promotionGifts giftItems variations
`;

async function populateAndNormalizeOrder(orderQuery) {
  const order = await orderQuery
    .populate("items.product_id", populateFields)
    .populate({
      path: "items.gifts.productId",
      model: "Product",
      select: "name images price slug",
    });

  // ✅ Populate từng level riêng biệt để chắc chắn
  await order.populate({
    path: "items.product_id.variations.attributes.attrId",
    model: "Attribute",
    select: "name type key",
  });

  await order.populate({
    path: "items.product_id.variations.attributes.terms",
    model: "AttributeTerm",
    select: "name slug color image",
  });

  const plain = order.toObject();

  plain.items = plain.items.map((i) => {
    const variation =
      i.product_id?.variations && i.variation_id
        ? i.product_id.variations.find(
            (v) => String(v._id) === String(i.variation_id),
          )
        : null;

    // 🔍 Debug: Log để kiểm tra
    if (variation?.attributes) {
      console.log("✅ Variation attributes:", JSON.stringify(variation.attributes, null, 2));
    }

    const image =
      variation?.thumbnail ||
      variation?.images?.[0] ||
      i.product_id?.images?.[0] ||
      null;

    return {
      ...i,
      product_id: normalizeProduct(i.product_id),
      variation_id: variation || null,
      variation_data: variation || null,
      image,
      gifts: (i.gifts || []).map((g) => ({
        ...g,
        productId: g.productId ? normalizeProduct(g.productId) : null,
      })),
    };
  });

  return plain;
}

module.exports = { populateAndNormalizeOrder, populateFields };
