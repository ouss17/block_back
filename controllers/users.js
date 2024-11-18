const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { checkBody } = require("../modules/checkBody");
const User = require("../models/users");

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = (req, res) => {
  const { username, email, birthDate, password } = req.body;
  const emailRegexValidation = /^\S+@\S+\.\S+$/;
  const passwordRegexValidation =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!checkBody(req.body, ["username", "email", "password", "birthDate"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields." });
  }

  if (!emailRegexValidation.test(email)) {
    return res
      .status(400)
      .json({ result: false, error: "Please enter a valid email." });
  }
  if (!passwordRegexValidation.test(password)) {
    return res.status(500).json({
      result: false,
      error:
        "Please enter Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.",
    });
  }

  User.findOne({
    email: { $regex: new RegExp(username, "i") },
  }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(password, 10);

      const newUser = new User({
        username,
        password: hash,
        email,
        birthDate,
      });

      newUser.save().then((data) => {
        const token = jwt.sign(
          {
            id: data.id,
            role: data.role,
          },

          JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );

        res
          .cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
          })
          .json({
            result: true,
            data,
          });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists !" });
    }
  });
};

exports.signin = (req, res) => {
  const { username, password } = req.body;
  if (!checkBody(req.body, ["username", "password"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields." });
  }

  User.findOne({
    $or: [
      { email: username }, // Vérifier par email
      { username: username }, // Vérifier par username
    ],
  }).then((data) => {
    if (data && bcrypt.compareSync(password, data.password)) {
      const token = jwt.sign(
        {
          id: data?.id,
          role: data?.role,
        },

        JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        result: true,
        data,
        message: "User connected",
      });
    } else {
      res.json({ result: false, error: "Utilisateur introuvable" });
    }
  });
};

exports.getMe = (req, res) => {
  User.findOne({ _id: req.user.id }).then((data) => {
    if (data) {
      res.json({ result: true, data });
    } else {
      res.json({ result: false, error: "Utilisateur introuvable !" });
    }
  });
};

exports.updateUser = (req, res) => {
  const { username, email, birthDate } = req.body;
  User.findOne({ _id: req.user.id }).then((data) => {
    if (!checkBody(req.body, ["username", "email", "birthDate"])) {
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields." });
    }
    const emailRegexValidation = /^\S+@\S+\.\S+$/;
    if (!emailRegexValidation.test(email)) {
      return res
        .status(400)
        .json({ result: false, error: "Please enter a valid email." });
    }
    if (data) {
      User.findOne({
        email: { $regex: new RegExp(email, "i") },
      }).then((datas) => {
        if (datas) {
          res.json({
            result: false,
            error: "Un utilisateur avec cet email existe déja !",
          });
        } else {
          User.updateOne(
            { _id: req.user.id },
            { $set: { username, birthDate, email } },
            { new: true }
          ).then((result) => {
            res.json({ result: true, data: result });
          });
        }
      });
    } else {
      res.json({ result: false, error: "Utilisateur introuvable !" });
    }
  });
};

exports.updatePassword = (req, res) => {
  const { password } = req.body;
  User.findOne({ _id: req.user.id }).then((data) => {
    if (!checkBody(req.body, ["password"])) {
      return res
        .status(400)
        .json({ result: false, error: "Missing or empty fields." });
    }
    const passwordRegexValidation =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegexValidation.test(password)) {
      return res.status(500).json({
        result: false,
        error:
          "Please enter Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.",
      });
    }
    if (data) {
      const hash = bcrypt.hashSync(password, 10);
      User.updateOne(
        { _id: req.user.id },
        { password: hash },
        { new: true }
      ).then((result) => {
        res.json({ result: true, data: result });
      });
    } else {
      res.json({ result: false, error: "Utilisateur introuvable !" });
    }
  });
};

exports.logout = (req, res) => {
  res.clearCookie("jwt");
  res.json({ result: true });
  res.end();
};

exports.deleteUser = (req, res) => {
  User.findOne({ _id: req.params.userId }).then((data) => {
    if (data) {
      if (req.user.role !== "admin" || req.user.id !== data._id) {
        res.json({
          result: false,
          error: "Vous n'avez pas les droits pour supprimer cet utilisateur !",
        });
      } else {
        User.deleteOne({ _id: req.params.userId }).then(() =>
          res.json({ result: true, message: "Utilisateur supprimé" })
        );
      }
    } else {
      res.json({ result: false, error: "Utilisateur introuvable !" });
    }
  });
};
