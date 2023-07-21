const express = require("express");
const ejs = require("ejs");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const passport = require("passport");
require("dotenv").config();
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  require("express-session")({
    secret: process.env.secret_session,
    resave: false,
    saveUninitialized: false,
  })
);

//init the session
app.use(passport.initialize());
app.use(passport.session());

var GoogleStrategy = require("passport-google-oauth20").Strategy;

mongoose.connect(process.env.uri);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//to salt and hash password
userSchema.plugin(passportLocalMongoose);
//find or create
userSchema.plugin(findOrCreate);

const user = mongoose.model("user", userSchema);

//authentication the user password and id
passport.use(user.createStrategy());

// puts/persist user data into the session
passport.serializeUser(user.serializeUser());

//retrive data fom session
passport.deserializeUser(user.deserializeUser());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
    },
    function (accessToken, refreshToken, profile, cb) {
      user.findOrCreate({ googleId: profile.id }),
        function (err, user) {
          return cb(err, user);
        };
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/home");
});

app.get("/auth/google", (req, res) => {
  passport.authenticate("google", { scope: ["profile"] });
});

app.get("/secrets", (req, res) => {
  //check if authenticated
  if (req.isAuthenticated) {
    res.render("secrets");
  } else {
    res.redirect("/home");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", function (req, res) {
  async function register_user() {
    try {
      //register user with salt and hash
      const register_user = await user.register(
        { username: req.body.username },
        req.body.password
      );

      if (register_user) {
        try {
          //authenticate i.e tally password and username
          const authenticate_user = passport.authenticate("local", {
            failureRedirect: "/home",
          });
          if (authenticate_user) {
            res.redirect("/secrets");
          }
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  register_user();
});

app.post("/login", (req, res) => {
  const USER = new user({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(USER, function (err) {
    if (err) {
      return next(err);
    }
    return res.redirect("/secrets");
  });
});

app.listen(port, () => console.log(`Server started at port: ${port}`));

app.post("/login", (req, res) => {});
