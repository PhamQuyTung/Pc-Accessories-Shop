// migrateOrders.js
const mongoose = require("mongoose");
const Order = require("../backend/src/app/models/order");
require("dotenv").config(); // nhớ cài dotenv: npm i dotenv

// Hàm bỏ dấu tiếng Việt
function removeVietnameseTones(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

(async () => {
  try {
    // 1. Kết nối DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // 2. Lấy tất cả đơn hàng
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders`);

    // 3. Update searchName
    for (const order of orders) {
      if (order.shippingInfo?.name) {
        order.shippingInfo.searchName = removeVietnameseTones(
          order.shippingInfo.name
        );
        await order.save();
        console.log(`Updated order ${order._id}`);
      }
    }

    console.log("🎉 Migration done!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
