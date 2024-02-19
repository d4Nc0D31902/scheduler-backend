const express = require("express");
const app = express();
const connectDatabase = require("./config/database");
const path = require("path");
const cloudinary = require("cloudinary");

require("dotenv").config({ path: "./config/.env" });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDatabase();
console.log(process.env.DATABASE);
if (process.env.NODE_ENV !== "PRODUCTION")
  require("dotenv").config({ path: "backend/config/.env" });

app.get("/", (req, res) => {
  res.send("Server is Online and Ready to Go");
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
