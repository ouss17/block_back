const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  title: String,
  imgArticle: String,
  content: String,
  creationDatetime: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const Article = mongoose.model("articles", articleSchema);

module.exports = Article;
