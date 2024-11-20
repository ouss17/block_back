const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  title: String,
  imgArticle: { type: String, default: "" },
  content: String,
  creationDatetime: {
    type: Date,
    default: () => Date.now(),
  },
  updateDatetime: {
    type: Date,
  },
  public: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const Article = mongoose.model("articles", articleSchema);

module.exports = Article;
