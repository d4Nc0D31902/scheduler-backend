const mongoose = require("mongoose");

const settingsSchema = mongoose.Schema({
  day_schedule: {
    type: [String], // Array of strings for days (e.g., ['Monday', 'Tuesday', ...])
    default: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  morning_schedule: {
    type: [String], // Array of strings for morning times (e.g., ['08:00 AM', '09:00 AM'])
    default: ["08:00 AM", "09:00 AM"],
  },
  afternoon_schedule: {
    type: [String], // Array of strings for afternoon times (e.g., ['01:00 PM', '02:00 PM'])
    default: ["01:00 PM", "02:00 PM"],
  },
});

module.exports = mongoose.model("Settings", settingsSchema);
