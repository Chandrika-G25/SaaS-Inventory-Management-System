const express = require("express");
const settingsController = require("../controllers/settings.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);

module.exports = router;
