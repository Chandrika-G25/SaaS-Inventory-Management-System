const settingsService = require("../services/settings.service");

async function getSettings(req, res) {
  try {
    const data = await settingsService.getSettings(req.organizationId);
    res.json({ success: true, message: "Settings retrieved successfully.", data });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function updateSettings(req, res) {
  try {
    const data = await settingsService.updateSettings(req.organizationId, req.body);
    res.json({ success: true, message: "Settings updated successfully.", data });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = { getSettings, updateSettings };
