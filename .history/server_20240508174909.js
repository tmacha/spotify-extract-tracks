const path = require("path");
require("dotenv").config();
const express = require("express");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const session = require("express-session");
const axios = require("axios");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI,
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      // Save the access token and refresh token to the user object
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      return done(null, profile);
    }
  )
);

// Route to retrieve the user's saved tracks
app.get("/api/saved-tracks", async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const accessToken = req.user.accessToken;
    console.log(accessToken);
    const headers = {
      Authorization: "Bearer " + accessToken,
    };

    let savedTracks = [];
    let nextUrl = "https://api.spotify.com/v1/me/tracks";

    while (nextUrl) {
      const response = await axios.get(nextUrl, { headers });
      savedTracks = [...savedTracks, ...response.data.items];
      nextUrl = response.data.next;
    }

    res.json(savedTracks);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to retrieve saved tracks" });
  }
});

app.get("/auth/check", (req, res) => {
  if (req.user && req.user.accessToken) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

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
    console.log("successful authentication");
    res.redirect("/");
  }
);

app.listen(3000, () => console.log("Server running on port 3000"));
