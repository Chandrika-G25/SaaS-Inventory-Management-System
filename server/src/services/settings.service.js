const settingsRepository = require("../repositories/settings.repository");

class SettingsError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function getSettings(organizationId) {
  const org = await settingsRepository.getSettingsByOrganization(organizationId);
  if (!org) throw new SettingsError("Organization not found.", 404);
  return { defaultLowStockThreshold: org.defaultLowStockThreshold };
}

async function updateSettings(organizationId, data) {
  const val = Number(data.defaultLowStockThreshold);
  if (data.defaultLowStockThreshold == null || isNaN(val)) {
    throw new SettingsError("defaultLowStockThreshold must be a number.");
  }
  if (!Number.isInteger(val) || val < 0) {
    throw new SettingsError("defaultLowStockThreshold must be a non-negative integer.");
  }

  const updated = await settingsRepository.updateSettings(organizationId, val);
  return { defaultLowStockThreshold: updated.defaultLowStockThreshold };
}

module.exports = { getSettings, updateSettings };
