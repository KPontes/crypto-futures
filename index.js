const express = require("express");
const app = express();

app.get("/express", (req, res) => {
  res.send({ message: "Welcome to eth-Wallet Express Server" });
});

if (process.env.NODE_ENV === "production") {
  var sslRedirect = require("heroku-ssl-redirect");
  app.use(sslRedirect());
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static("client/build"));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
