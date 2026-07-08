const prisma = require("../lib/prisma");

async function getSettingsByOrganization(organizationId) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLowStockThreshold: true }
  });
}

async function updateSettings(organizationId, defaultLowStockThreshold) {
  return prisma.organization.update({
    where: { id: organizationId },
    data: { defaultLowStockThreshold },
    select: { defaultLowStockThreshold: true }
  });
}

module.exports = {
  getSettingsByOrganization,
  updateSettings
};
