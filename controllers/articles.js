const { checkBody } = require("../modules/checkBody");
const Article = require("../models/articles");

exports.getArticles = (req, res) => {
  Article.find().then((data) => {
    res.json({ result: true, data });
  });
};

exports.getArticleById = (req, res) => {
  Article.findById(req.params.articleId).then((data) => {
    if (data) {
      res.json({ result: true, data });
    } else {
      res.json({ result: false, error: "Cet article n'existe pas !" });
    }
  });
};

exports.createArticle = (req, res) => {
  const { title, imgArticle, content, creationDatetime } = req.body;
  if (!checkBody(req.body, [title, content, creationDatetime])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields." });
  }
  const newArticle = new Article({
    title,
    imgArticle,
    description,
    content,
    creationDatetime,
    userId: req.user.id,
  });
  newArticle.save().then((data) => {
    json.res({ result: true, data });
  });
};

exports.updateArticle = (req, res) => {
  Article.findById(req.params.articleId).then((data) => {
    if (data) {
      const { title, imgArticle, content } = req.body;
      if (!checkBody(req.body, [title, content])) {
        return res
          .status(400)
          .json({ result: false, error: "Missing or empty fields." });
      }

      Article.updateOne(
        { _id: req.params.articleId },
        { $set: { title, imgArticle, content } },
        { new: true }
      ).then((datas) => {
        res.json({ result: true, data: datas });
      });
    } else {
      res.json({ result: false, error: "L'article n'existe pas!" });
    }
  });
};

exports.deleteArticle = (req, res) => {
  Article.findById(req.params.articleId).then((data) => {
    if (data) {
      if (req.user.id === data.userId || req.user.role === "admin") {
        Article.deleteOne({ _id: req.params.articleId }).then(() => {
          res.json({ result: true, message: "Article supprimé" });
        });
      } else {
        res.status(401).json({ result: false, error: "Not authorized !" });
      }
    } else {
      res.json({ result: false, error: "L'article n'existe pas!" });
    }
  });
};

exports.getArticlesByUser = (req, res) => {
  User.findById(req.user.userId).then((data) => {
    if (data) {
      Article.find({ userId: req.user.userId }).then((result) => {
        res.json({ result: true, data: result });
      });
    } else {
      res.json({ result: false, error: "Utilisateur introuvable !" });
    }
  });
};
