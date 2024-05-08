const path = require("path");
require("dotenv").config();
const express = require("express");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const session = require("express-session");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your_session_secret", // Replace 'your_session_secret' with a secret string
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI,
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      // Here you can save the user profile and tokens to your database
      // For simplicity, we'll just return the profile
      return done(null, profile);
    }
  )
);

app.get(
  "/auth/spotify",
  passport.authenticate("spotify", {
    scope: ["user-read-email", "user-read-private"],
  })
);

app.get(
  "/auth/spotify/callback",
  passport.authenticate("spotify", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.listen(3000, () => console.log("Server running on port 3000"));
