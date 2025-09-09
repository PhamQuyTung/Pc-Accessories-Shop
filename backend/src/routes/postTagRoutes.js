const express = require("express");
const router = express.Router();
const postTagController = require("../app/controllers/postTagController");

// CRUD cho tags
router.get("/", postTagController.getTags);         // GET /api/post-tags
router.post("/", postTagController.createTag);      // POST /api/post-tags
router.put("/:id", postTagController.updateTag);    // PUT /api/post-tags/:id
router.delete("/:id", postTagController.deleteTag); // DELETE /api/post-tags/:id

module.exports = router;
