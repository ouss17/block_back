const { checkBody } = require("../modules/checkBody");
const Article = require("../models/articles");
const User = require("../models/articles");

exports.getArticles = (req, res) => {
  Article.find()
    .populate("userId")
    .then((data) => {
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
  const { title, imgArticle, content } = req.body;
  if (!checkBody(req.body, ["title", "content"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields." });
  }
  let objArticle = {};
  if (imgArticle) {
    objArticle = {
      title,
      imgArticle,
      content,
      userId: req.user.id,
    };
  } else {
    objArticle = {
      title,
      content,
      userId: req.user.id,
    };
  }
  const newArticle = new Article(objArticle);
  newArticle.save().then(() => {
    Article.find()
      .populate("userId")
      .then((data) => {
        res.json({ result: true, data });
      });
  });
};

exports.updateArticle = (req, res) => {
  Article.findById(req.params.articleId)
    .populate("userId")
    .then((data) => {
      if (data) {
        const { title, imgArticle, content } = req.body;
        if (!checkBody(req.body, ["title", "content"])) {
          return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields." });
        }
        if (
          req.user.id === data.userId._id.toString() ||
          req.user.role === "admin"
        ) {
          Article.updateOne(
            { _id: req.params.articleId },
            {
              $set: {
                title,
                imgArticle,
                content,
                updateDatetime: Date.now(),
              },
            },
            { new: true }
          ).then(() => {
            Article.find()
              .populate("userId")
              .then((datas) => {
                res.json({ result: true, data: datas });
              });
          });
        } else {
          res.status(401).json({ result: false, error: "Not authorized !" });
        }
      } else {
        res.json({ result: false, error: "L'article n'existe pas!" });
      }
    });
};

exports.deleteArticle = (req, res) => {
  Article.findById(req.params.articleId)
    .populate("userId")
    .then((data) => {
      if (data) {
        if (
          req.user.id === data.userId._id.toString() ||
          req.user.role === "admin"
        ) {
          Article.deleteOne({ _id: req.params.articleId }).then(() => {
            Article.find()
              .populate("userId")
              .then((datas) => {
                res.json({
                  result: true,
                  data: datas,
                  message: "Article supprimé",
                });
              });
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
  console.log(req.params.userId);
  User.find({ _id: req.params.userId }).then((data) => {
    console.log(data);
    if (data) {
      Article.find({ userId: req.params.userId })
        .populate("userId")
        .then((result) => {
          console.log(result);
          res.json({ result: true, data: result });
        });
    } else {
      res.json({ result: false, error: "Utilisateur introuvable !" });
    }
  });
};
