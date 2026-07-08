const prisma = require("../lib/prisma");

async function getOrganization(organizationId) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLowStockThreshold: true }
  });
}

async function getProductsByOrganization(organizationId) {
  return prisma.product.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      sku: true,
      quantity: true,
      lowStockThreshold: true
    }
  });
}

module.exports = {
  getOrganization,
  getProductsByOrganization
};
