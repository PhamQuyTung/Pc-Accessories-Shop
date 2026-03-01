const Cart = require("../models/cart");
const Product = require("../models/product");
const Gift = require("../models/gift");
const mongoose = require("mongoose");

// ======================================================
// ADD TO CART
// ======================================================
exports.addToCart = async (req, res) => {
  try {
    const { product_id, variation_id, quantity } = req.body;
    const userId = req.userId;

    if (!product_id || !quantity) {
      return res
        .status(400)
        .json({ message: "Thiếu product_id hoặc quantity." });
    }

    // Kiểm tra sản phẩm tồn tại & khả dụng
    const product = await Product.findById(product_id);
    if (!product || product.deleted || !product.visible) {
      return res.status(404).json({ message: "Sản phẩm không khả dụng." });
    }

    // === Xác định xem sản phẩm được thêm có phải là quà tặng của một sản phẩm khác đang có trong giỏ ===
    let isGiftItem = false;
    let parentProductIdForGift = null;

    // Tìm các sản phẩm chính (isGift=false) hiện có trong giỏ
    const existingMainItems = await Cart.find({ user_id: userId, isGift: false });

    if (existingMainItems.length > 0) {
      // lookup gifts for each main product
      for (const mainItem of existingMainItems) {
        const mainProd = await Product.findById(mainItem.product_id).select('gifts');
        if (!mainProd || !Array.isArray(mainProd.gifts)) continue;

        // fetch gift documents to inspect product list
        const gifts = await Gift.find({ _id: { $in: mainProd.gifts } });
        for (const giftDoc of gifts) {
          for (const g of giftDoc.products) {
            if (String(g.productId) === String(product_id)) {
              isGiftItem = true;
              parentProductIdForGift = mainProd._id;
              break;
            }
          }
          if (isGiftItem) break;
        }
        if (isGiftItem) break;
      }
    }

    // Build query chính xác: nếu là gift thì tìm theo isGift:true
    const query = {
      user_id: userId,
      product_id,
      isGift: isGiftItem,
    };
    if (variation_id) {
      query.variation_id = new mongoose.Types.ObjectId(variation_id);
    } else {
      query.variation_id = null;
    }

    console.log('🔍 Searching cart item:', {
      user_id: String(userId),
      product_id: String(product_id),
      variation_id: variation_id ? String(variation_id) : 'null',
      isGiftItem,
    });

    // Tìm item đã tồn tại
    let cartItem = await Cart.findOne(query);

    // Nếu chúng ta đang thêm gift nhưng item hiện có cóisGift=false,
    // hãy convert nó thay vì tạo mới
    if (!cartItem && isGiftItem) {
      cartItem = await Cart.findOne({
        user_id: userId,
        product_id,
        variation_id: query.variation_id,
        isGift: false,
      });
      if (cartItem) {
        console.log('🎁 Found existing normal item while adding gift, converting');
        cartItem.isGift = true;
        cartItem.parentProductId = parentProductIdForGift;
      }
    }

    if (cartItem) {
      // ✅ UPDATE: Tăng quantity
      console.log('✅ Item exists, updating qty:', cartItem.quantity, '+', quantity);
      cartItem.quantity += quantity;
      // nếu đang chuyển từ normal -> gift convert (có thể đã được set phía trên)
      if (!cartItem.isGift && isGiftItem) {
        cartItem.isGift = true;
        cartItem.parentProductId = parentProductIdForGift;
      }
      await cartItem.save();
    } else {
      // ✅ CREATE: Tạo item mới
      console.log('➕ Creating new cart item', { isGiftItem, parentProductIdForGift });
      cartItem = await Cart.create({
        user_id: userId,
        product_id,
        variation_id: variation_id ? new mongoose.Types.ObjectId(variation_id) : null,
        quantity,
        isGift: isGiftItem,
        parentProductId: parentProductIdForGift || null,
      });
    }

    console.log('✅ Cart item saved:', {
      _id: cartItem._id,
      quantity: cartItem.quantity,
      isGift: cartItem.isGift,
      parentProductId: cartItem.parentProductId,
    });

    // =============================
    // Auto-add Gifts (use Product.gifts referencing Gift IDs)
    // Only trigger when the item we just added is not itself a gift
    // =============================
    if (!isGiftItem) {
      const giftIds = product.gifts || [];
      if (giftIds.length > 0) {
        const gifts = await Gift.find({ _id: { $in: giftIds } });

        for (const gift of gifts) {
          for (const g of gift.products) {
            const giftProduct = await Product.findById(g.productId);
            if (!giftProduct || giftProduct.deleted || !giftProduct.visible) continue;

            // Multiply gift quantity by the quantity of the main cart item
            const giftQty = (Number(g.quantity) || 1) * (Number(cartItem.quantity) || Number(quantity) || 1);

            // ✅ FIX: Tìm item quà tặng (bất kể isGift hay không)
            let giftItem = await Cart.findOne({
              user_id: userId,
              product_id: g.productId,
              variation_id: null,
              isGift: false,
              parentProductId: null
            });

            if (giftItem) {
              // ✅ Convert normal item to gift item
              console.log('🎁 Converting normal item to gift:', g.productId);
              giftItem.isGift = true;
              giftItem.quantity = giftQty;
              giftItem.parentProductId = product_id;
              await giftItem.save();
            } else {
              // ✅ Tạo gift item mới nếu chưa tồn tại
              console.log('🎁 Creating new gift item:', g.productId);
              await Cart.create({
                user_id: userId,
                product_id: g.productId,
                variation_id: null,
                quantity: giftQty,
                isGift: true,
                parentProductId: product_id
              });
            }
          }
        }
      }
    }

    return res.status(200).json({ 
      message: "Thêm vào giỏ hàng thành công!",
      cartItem,
    });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    
    // Handle E11000 duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Sản phẩm này đã có trong giỏ hàng. Vui lòng kiểm tra lại.",
        error: error.message,
      });
    }

    return res.status(500).json({ 
      message: "Lỗi máy chủ khi thêm giỏ hàng.",
      error: error.message,
    });
  }
};

// ======================================================
// GET CART
// ======================================================
// ================= FIX: cartController.js - getCart (dùng populate) =================
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ Fetch cart items với populate product (bao gồm cả variations field)
    const items = await Cart.find({ user_id: userId })
      .populate({
        path: "product_id",
        select: "name price discountPrice images slug deleted visible hasGifts gifts variations",
        populate: {
          path: "gifts",
          select: "title products",
          populate: {
            path: "products.productId",
            select: "name slug price",
          },
        },
      })
      .populate({
        path: "parentProductId",
        select: "name slug",
      });

    if (!items || items.length === 0) {
      return res.status(200).json({ items: [], removed: [] });
    }

    const validItems = [];
    const removed = [];

    // Get product IDs để batch populate variation attributes
    const productIds = [
      ...new Set(items.map((item) => String(item.product_id._id))),
    ];

    const Product = require("../models/product");
    
    // ✅ Populate variation attributes (1 query duy nhất)
    const productsWithVariations = await Product.find(
      { _id: { $in: productIds } }
    )
      .select("_id variations")
      .populate("variations.attributes.attrId", "name")
      .populate("variations.attributes.terms", "name colorCode");

    console.log('🔍 DEBUG productsWithVariations[0].variations:', 
      JSON.stringify(productsWithVariations[0]?.variations?.[0], null, 2)
    );

    const variationMap = {};
    for (const p of productsWithVariations) {
      const variations = p.toObject?.().variations || p.variations;
      variationMap[String(p._id)] = variations;
      
      console.log(`📦 Variation map for ${p._id}:`, {
        count: variations?.length,
        firstVariation: variations?.[0] ? {
          _id: String(variations[0]._id),
          quantity: variations[0].quantity,
          price: variations[0].price,
        } : null,
      });
    }

    // Process each cart item
    for (const item of items) {
      const product = item.product_id;

      if (!product || product.deleted || !product.visible) {
        removed.push({ _id: item._id, name: product?.name });
        await Cart.deleteOne({ _id: item._id });
        continue;
      }

      // ✅ FIX: Kiểm tra orphan gift items (gift nhưng parent product không còn)
      if (item.isGift && !item.parentProductId) {
        console.warn(`⚠️ Orphan gift item detected: ${item._id}`);
        removed.push({ _id: item._id, name: `${product.name} - (Quà tặng không hợp lệ)` });
        await Cart.deleteOne({ _id: item._id });
        continue;
      }

      let variation = null;
      if (item.variation_id && product.variations) {
        const populatedVariations = variationMap[String(product._id)] || product.variations;

        console.log(`🔍 Looking for variation ${item.variation_id} in product ${product.name}:`, {
          availableVariations: populatedVariations?.map(v => ({
            _id: String(v._id),
            qty: v.quantity,
          })),
        });

        variation = populatedVariations.find(
          (v) => String(v._id) === String(item.variation_id)
        );

        if (!variation) {
          console.warn(
            `⚠️ Variation ${item.variation_id} not found in ${product.name}`
          );
          removed.push({
            _id: item._id,
            name: `${product.name} - (Biến thể không tồn tại)`,
          });
          await Cart.deleteOne({ _id: item._id });
          continue;
        }

        console.log(`✅ Found variation with stock:`, {
          product: product.name,
          variationId: String(variation._id),
          stock: variation.quantity,
          price: variation.price,
        });
      }

      validItems.push({
        _id: item._id,
        user_id: item.user_id,
        product_id: product,
        variation_id: variation,
        quantity: item.quantity,
        isGift: item.isGift,
        parentProductId: item.parentProductId || null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    return res.status(200).json({ items: validItems, removed });
  } catch (error) {
    console.error("🔥 Lỗi getCart:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
};

// ======================================================
// GET CART COUNT
// ======================================================
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      populate: {
        path: "gifts.products.productId",
        select: "name slug finalPrice",
      },
    });

    let total = 0;

    for (const item of cartItems) {
      total += item.quantity;

      if (item.product_id?.gifts?.length) {
        for (const gift of item.product_id.gifts) {
          for (const p of gift.products) {
            total += p.quantity * item.quantity;
          }
        }
      }
    }

    return res.json({ count: total });
  } catch (error) {
    console.error("❌ Lỗi getCartCount:", error);
    return res.status(500).json({ message: "Lỗi server khi đếm giỏ hàng" });
  }
};

// ======================================================
// REMOVE ITEM
// ======================================================
exports.removeFromCart = async (req, res) => {
  try {
    const { cartItemId, product_id } = req.body;
    const userId = req.userId;

    if (!cartItemId && !product_id) {
      return res
        .status(400)
        .json({ message: "Thiếu cartItemId hoặc product_id" });
    }

    if (cartItemId) {
      // If deleting by cartItemId, fetch the item first to detect if it's a main product
      const item = await Cart.findOne({ _id: cartItemId, user_id: userId });
      if (item) {
        await Cart.deleteOne({ _id: cartItemId, user_id: userId });

        // ✅ FIX: Nếu xóa sản phẩm chính (isGift: false), xóa luôn tất cả gift items
        if (!item.isGift) {
          const parentId = item.product_id;
          console.log('🗑️  Deleting all gifts related to product:', parentId);
          const filter = {
            user_id: userId,
            $or: [{ parentProductId: parentId }, { parentProductId: String(parentId) }],
            isGift: true,
          };
          await Cart.deleteMany(filter);
        }
      }
    } else {
      // ✅ FIX: Deleting by product_id - xóa sản phẩm chính và gift liên quan
      await Cart.deleteOne({ user_id: userId, product_id });

      // Xóa any gift items that referenced this product as parent
      console.log('🗑️  Deleting all gifts related to product:', product_id);
      const filter = {
        user_id: userId,
        $or: [{ parentProductId: product_id }, { parentProductId: String(product_id) }],
        isGift: true,
      };
      await Cart.deleteMany(filter);
    }

    return res.status(200).json({ message: "Đã xoá sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("❌ Lỗi removeFromCart:", error);
    return res.status(500).json({ message: "Lỗi khi xoá sản phẩm" });
  }
};

// ======================================================
// UPDATE QUANTITY
// ======================================================
exports.updateCartQuantity = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    const userId = req.userId;

    if (!cartItemId || typeof quantity !== "number") {
      return res
        .status(400)
        .json({ message: "Missing cartItemId or quantity" });
    }

    const item = await Cart.findOne({ _id: cartItemId, user_id: userId });
    if (!item) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    const oldQuantity = item.quantity;
    item.quantity = quantity;
    await item.save();

    // ✅ FIX: Nếu update product chính (isGift: false), update lại gift quantity
    if (!item.isGift && item.product_id) {
      const quantityRatio = quantity / oldQuantity;
      
      // Cập nhật tất cả gift items có parentProductId = product._id
      const filter = {
        user_id: userId,
        $or: [{ parentProductId: item.product_id }, { parentProductId: String(item.product_id) }],
        isGift: true,
      };

      const giftItems = await Cart.find(filter);
      for (const giftItem of giftItems) {
        giftItem.quantity = Math.round((giftItem.quantity || 1) * quantityRatio);
        await giftItem.save();
      }

      console.log(`✅ Updated ${giftItems.length} gift items with ratio ${quantityRatio}`);
    }

    return res.status(200).json({ message: "Cập nhật số lượng thành công" });
  } catch (error) {
    console.error("🔥 Lỗi khi cập nhật số lượng:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật giỏ hàng" });
  }
};

// ======================================================
// BULK ADD (RE-ADD)
// ======================================================
exports.bulkAddToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const items = req.body.items;

    for (const item of items) {
      await Cart.findOneAndUpdate(
        { user_id: userId, product_id: item.product_id },
        { $inc: { quantity: item.quantity } },
        { upsert: true }
      );
    }

    return res.json({ message: "Thêm lại sản phẩm thành công!" });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi khi thêm lại sản phẩm",
      error: error.message,
    });
  }
};
