// resetLockPromotion.js

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../backend/src/app/models/product"); // chỉnh path nếu khác

async function run() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // // 👉 Nếu muốn reset 1 sản phẩm cụ thể
    // const productId = "698b1519a74411bc30fe0115";

    // const result = await Product.updateOne(
    //   { _id: productId },
    //   {
    //     $set: {
    //       lockPromotionId: null,
    //       promotionApplied: null,
    //       isOnPromotion: false,
    //       promotionId: null,
    //       discountPrice: 0,
    //       discountPercent: null,
    //     },
    //   }
    // );

    // console.log("Update result:", result);

    // 👉 Nếu muốn reset TẤT CẢ sản phẩm bị lock
    const result = await Product.updateMany(
      { lockPromotionId: { $ne: null } },
      {
        $set: {
          lockPromotionId: null,
          promotionApplied: null,
          isOnPromotion: false,
          promotionId: null,
        },
      },
    );

    console.log("Reset all locked products:", result);

    console.log("🎉 Done!");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
