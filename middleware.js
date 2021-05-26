const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // Returns user to original location they logged in from.
        req.flash('error', 'You must be signed in to do that.');
        // If you see a "Cannot set headers after..." make sure you *return* the res.render().
        return res.redirect('/login');
      }
      next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((element) => element.message).join(",");
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };
  
  module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
      req.flash("error", "You don't have permission to do that.");
      return res.redirect(`/campgrounds/${id}`);
    }
    next();
  };

  module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
      req.flash("error", "You don't have permission to do that.");
      return res.redirect(`/campgrounds/${id}`);
    }
    next();
  };

  module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((element) => element.message).join(",");
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };