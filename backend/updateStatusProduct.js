const mongoose = require("mongoose");
const Product = require("./src/app/models/product"); // sửa lại path nếu cần
const { computeProductStatus } = require("../shared/productStatus"); // sửa lại path nếu cần

require("dotenv").config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({});
  for (const p of products) {
    const status = computeProductStatus(
      {
        quantity: p.quantity,
        variations: p.variations || [],
        importing: p.importing,
      },
      { importing: p.importing }
    );
    p.status = status;
    await p.save();
    console.log(`Updated status for ${p.name}: ${status}`);
  }
  console.log("Done!");
  process.exit(0);
})();