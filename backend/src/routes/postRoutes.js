const express = require("express");
const router = express.Router();
const postController = require("../app/controllers/postController");
const authMiddleware = require("../app/middlewares/authMiddleware");

// CRUD cho bài viết
router.get("/", postController.getPosts); // GET /api/posts
router.get("/featured", postController.getFeaturedPosts);
router.get("/drafts", postController.getDraftPosts); // GET /api/post/drafts
router.get("/trash", postController.getTrashPosts); // GET /api/post/trash
router.post("/", authMiddleware, postController.createPost); // POST /api/posts
router.put("/:id", postController.updatePost); // PUT /api/posts/:id
router.patch("/:id/toggle-featured", postController.toggleFeatured);    // Toggle featured
router.get("/:id", postController.getPostById); // GET /api/posts/:id
router.delete("/:id", postController.deletePost); // DELETE /api/posts/:id

module.exports = router;
