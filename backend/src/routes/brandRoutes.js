const express = require("express");
const router = express.Router();
const brandController = require("../app/controllers/brandController");

// GET
router.get("/", brandController.getAll);

// CREATE
router.post("/", brandController.create);

// UPDATE
router.put("/:id", brandController.update);

// DELETE
router.delete("/:id", brandController.remove);

module.exports = router;
