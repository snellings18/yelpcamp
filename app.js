/* NOTE: In order for the app to work on Heroku
    you must include a "start": "node app.js" in 
    the package.json file under "scripts".

/* The if statement below retrieves the information from 
    the .env file during development; but not during production. */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const userRoutes = require("./routes/user");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const MongoStore = require("connect-mongo");
const dbURL = "mongodb://localhost:27017/yelp-camp";
const newDbUrl = process.env.DB_URL; // You'll use this DB for deployment.

// Use dbURL for the mongodb url for local web building.
// Use newDbUrl for deployment.
mongoose.connect(newDbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
  replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisisnotagoodsecret' // Use the 'thisis...' for local development/backup.

// Use dbURL for the mongodb url for local web building.
// Use newDbUrl for deployment.
const store = MongoStore.create({
  mongoUrl: newDbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  }
});

store.on("error", (e) => {
  console.log("Session Store Error", e);
});

const sessionConfig = {
  store,
  name: "sessionary",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// Remember, app.use(session()) must be before app.use(passport.session).
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

/* Helmet will prevent you from using sources from other websites etc.; 
    The following code tells Helmet what is allowed. */
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://code.jquery.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://cdnjs.cloudflare.com",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dct4adnkg/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize()); // Initializes the passport of the user.
app.use(passport.session()); // Connects the passport user to a session.
passport.use(new LocalStrategy(User.authenticate())); // Provides authentication of the user.
passport.serializeUser(User.serializeUser()); // Stores user in the session.
passport.deserializeUser(User.deserializeUser()); // Unstores the user in the session (when it ends).

app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Gives you access to the user in all templates.
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "larry@gmail.com", username: "lllllll" });
  const newUser = await User.register(user, "password");
  res.send(newUser);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong.";
  res.status(statusCode).render("error", { err });
});


// For local development, run on the following:
// app.listen(3000, () => {
//   console.log("You are listening on port 3000");
// });

// But for running on Heroku, use this:

const port = process.env.PORT || 3000; // This will still use 3000 for local dev.
app.listen(port, () => {
  console.log(`Serving on Port ${port}!`);
});