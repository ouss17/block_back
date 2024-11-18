var express = require("express");
var router = express.Router();
require("../models/connection");
const { auth } = require("../middleware/auth");

const {
  signin,
  signup,
  getMe,
  logout,
  updatePassword,
  updateUser,
  deleteUser,
} = require("../controllers/users");

/* GET users listing. */
router.post("/signin", signin);
router.post("/signup", signup);
router.get("/getMe", auth, getMe);
router.delete("/deleteUser/:userId", auth, deleteUser);
router.get("/logout", logout);
router.put("/updateUser", auth, updateUser);
router.put("/updatePassword", auth, updatePassword);

module.exports = router;
