const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/UserSchema");
const Chat = require("../schemas/ChatSchema");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

//top-level get routee
router.get("/", (req, res, next) => {
  var payload = {
    pageTitle: "Notifications",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render("notifications", payload);
});

module.exports = router;
