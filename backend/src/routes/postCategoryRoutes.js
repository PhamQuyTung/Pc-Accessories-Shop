const express = require("express");
const router = express.Router();
const postCategoryController = require("../app/controllers/postCategoryController");

// CRUD cho categories
router.get("/", postCategoryController.getCategories);      // GET /api/post-categories
router.post("/", postCategoryController.createCategory);    // POST /api/post-categories
router.get("/slug/:slug", postCategoryController.getCategoryBySlug); // GET /api/post-categories/slug/:slug
router.put("/:id", postCategoryController.updateCategory);  // PUT /api/post-categories/:id
router.delete("/:id", postCategoryController.deleteCategory); // DELETE /api/post-categories/:id

module.exports = router;
