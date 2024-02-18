const Settings = require('../models/settings');
const ErrorHandler = require("../utils/errorHandler");
// Controller for Settings model
const settingsController = {
  // Update settings by ID
  async updateSettingsById(req, res) {
    try {
      const { id } = req.params;
      const updatedSettings = await Settings.findByIdAndUpdate(
        '6581a5b1466cfcabab4cc84f',
        { $set: req.body },
        { new: true }
      );

      if (!updatedSettings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      res.json(updatedSettings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  // Get settings by ID
  async getSettingsById(req, res) {
    try {
      const { id } = req.params;
      const settings = await Settings.findById('6581a5b1466cfcabab4cc84f');

      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }

      res.json(settings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
};

module.exports = settingsController;
