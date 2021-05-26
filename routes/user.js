const express = require("express");
const router = express.Router();
const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");


router.route("/register")
  .get(users.renderRegister)
  // The catchAsync catches errors if there are any.
  .post(catchAsync(users.register));

router.route("/login")
  .get(users.renderLogin)
  /* passport.authenticate() allows you to authenticate the user either through the local
  website, or Google, Facebook, and so on if logging in through them is enabled. */
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
