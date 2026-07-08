const dashboardRepository = require("../repositories/dashboard.repository");

async function getDashboardData(organizationId) {
  const org = await dashboardRepository.getOrganization(organizationId);
  const products = await dashboardRepository.getProductsByOrganization(organizationId);

  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

  const defaultThreshold = org?.defaultLowStockThreshold ?? 5;

  const lowStockItems = products
    .filter((p) => {
      const threshold = p.lowStockThreshold ?? defaultThreshold;
      return p.quantity <= threshold;
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      lowStockThreshold: p.lowStockThreshold ?? defaultThreshold,
    }));

  return {
    totalProducts,
    totalQuantity,
    lowStockItems,
  };
}

module.exports = {
  getDashboardData,
};
