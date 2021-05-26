const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");
const User = require("../models/users");


module.exports.renderRegister = (req, res) => {
    res.render("users/register");
  }


module.exports.register = async (req, res, next) => {
    // To create a new User:
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      /*  req.login creates a session for the user once they register 
      so they don't have to login after they register. */
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Yelpcamp!");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  };

  module.exports.renderLogin = (req, res) => {
    res.render("users/login");
  }

  module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectURL = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectURL);
  }

  module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds")};