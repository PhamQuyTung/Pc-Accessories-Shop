const express = require("express");
const router = express.Router();
const postController = require("../app/controllers/postController");
const authMiddleware = require("../app/middlewares/authMiddleware");

// CRUD cho bài viết
router.get("/", postController.getPosts); // GET /api/posts
router.get("/featured", postController.getFeaturedPosts);
router.get("/drafts", postController.getDraftPosts); // GET /api/post/drafts
router.get("/trash", postController.getTrashPosts); // GET /api/post/trash
router.get("/search", postController.searchPosts);


router.get("/category/:slug", postController.getPostsByCategorySlug); // GET /api/posts/category/:slug
router.get("/tag/:slug", postController.getPostsByTagSlug); // GET /api/posts/tag/:slug
router.get("/:categorySlug/:postSlug", postController.getPostBySlug); // ✅ Lấy chi tiết bài viết theo categorySlug + postSlug

router.post("/", authMiddleware, postController.createPost); // POST /api/posts
router.put("/:id", postController.updatePost); // PUT /api/posts/:id
router.patch("/:id/toggle-featured", postController.toggleFeatured); // Toggle featured
router.get("/:id", postController.getPostById); // GET /api/posts/:id
router.delete("/:id", postController.deletePost); // DELETE /api/posts/:id

module.exports = router;
