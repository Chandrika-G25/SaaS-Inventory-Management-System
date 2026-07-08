const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", dashboardController.getDashboard);

module.exports = router;
