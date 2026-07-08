const dashboardService = require("../services/dashboard.service");

async function getDashboard(req, res) {
  try {
    const data = await dashboardService.getDashboardData(req.organizationId);
    res.json({
      success: true,
      message: "Dashboard data retrieved successfully.",
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = {
  getDashboard,
};
