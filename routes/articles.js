var express = require("express");
var router = express.Router();
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByUser,
} = require("../controllers/articles");
const { auth } = require("../middleware/auth");

/* GET users listing. */
router.get("/", getArticles);
router.get("/:articleId", getArticleById);
router.post("/", auth, createArticle);
router.put("/:articleId", auth, updateArticle);
router.delete("/:articleId", auth, deleteArticle);
router.get("/articlesByUser/:userId", auth, getArticlesByUser);

module.exports = router;
