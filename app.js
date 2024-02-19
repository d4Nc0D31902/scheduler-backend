const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const products = require("./routes/product");
const appointments = require("./routes/appointment");
const locations = require("./routes/location");
const announcements = require("./routes/announcement");
const equipments = require("./routes/equipment");
const settings = require("./routes/settings");
const sports = require("./routes/sport");
const categories = require("./routes/category");
const borrows = require("./routes/borrow");
const auth = require("./routes/auth");
const order = require("./routes/order");
const errorMiddleware = require("./middlewares/errors");

// Middleware setup
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// CORS middleware
app.use(
  cors({
    origin: "https://scheduler-frontend-mu.vercel.app",
    credentials: true,
  })
);

// Routes
app.use("/api/v1", products);
app.use("/api/v1", auth);
app.use("/api/v1", order);
app.use("/api/v1", appointments);
app.use("/api/v1", locations);
app.use("/api/v1", settings);
app.use("/api/v1", announcements);
app.use("/api/v1", equipments);
app.use("/api/v1", sports);
app.use("/api/v1", categories);
app.use("/api/v1", borrows);

// Apply cookie parser middleware
app.use(cookieParser());

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
