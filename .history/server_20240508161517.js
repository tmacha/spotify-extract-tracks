// Add this line at the top of server.js
const path = require("path");

// Add this middleware before the app.listen call
app.use(express.static(path.join(__dirname, "public")));

require("dotenv").config();
const express = require("express");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;

const app = express();

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

app.use(passport.initialize());

app.get(
  "/auth/spotify",
  passport.authenticate("spotify", { scope: ["user-library-read"] })
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
