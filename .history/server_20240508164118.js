const axios = require("axios");
require("dotenv").config();

const getSpotifyAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const data = new URLSearchParams();
  data.append("grant_type", "client_credentials");

  const options = {
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    data: data,
  };

  try {
    const response = await axios(options);
    const accessToken = response.data.access_token;
    console.log("Access Token:", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Error:", error.response.data);
    throw error;
  }
};

// Example usage
getSpotifyAccessToken()
  .then((accessToken) => {
    // Use the access token to make requests to the Spotify API
    console.log("Access token obtained successfully!");
  })
  .catch((error) => {
    console.error("Error obtaining access token:", error);
  });
