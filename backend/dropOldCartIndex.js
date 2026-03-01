// Script to drop old cart index
const mongoose = require("mongoose");
require("dotenv").config();

const DB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/pc_accessories";

async function dropOldIndex() {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB");

    const cartCollection = mongoose.connection.collection("carts");

    // Get all indexes
    const indexes = await cartCollection.getIndexes();
    console.log("📋 Current indexes:", Object.keys(indexes));

    // Drop old index if it exists
    const oldIndexName = "user_id_1_product_id_1_variation_id_1_parentProductId_1";
    if (indexes[oldIndexName]) {
      await cartCollection.dropIndex(oldIndexName);
      console.log(`✅ Dropped old index: ${oldIndexName}`);
    } else {
      console.log(`ℹ️ Old index not found: ${oldIndexName}`);
    }

    // Check new index
    const newIndexName = "user_id_1_product_id_1_variation_id_1_isGift_1";
    if (indexes[newIndexName]) {
      console.log(`✅ New index exists: ${newIndexName}`);
    } else {
      console.log(`⚠️ New index not found: ${newIndexName}`);
    }

    console.log("📋 Updated indexes:");
    const updatedIndexes = await cartCollection.getIndexes();
    console.log(Object.keys(updatedIndexes));

    await mongoose.disconnect();
    console.log("✅ Migration completed");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

dropOldIndex();
