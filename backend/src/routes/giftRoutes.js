const express = require("express");
const {
  getAllGifts,
  getGiftById,
  createGift,
  updateGift,
  deleteGift,
  addProductToGift,
  removeProductFromGift,
} = require("../app/controllers/giftController");

const router = express.Router();

// CRUD cho gift
router.get("/", getAllGifts); // GET all
router.get("/:id", getGiftById); // GET one
router.post("/", createGift); // CREATE
router.put("/:id", updateGift); // UPDATE
router.delete("/:id", deleteGift); // DELETE

// Quản lý products trong gift (optional)
router.post("/add-product", addProductToGift);
router.post("/remove-product", removeProductFromGift);

module.exports = router;
