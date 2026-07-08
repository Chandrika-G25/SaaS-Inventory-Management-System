const authService = require("../services/auth.service");

async function signup(req, res) {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Signup error:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Signup failed.",
    });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
}

async function me(req, res) {
  try {
    const result = await authService.getCurrentUser(req.userId);
    return res.status(200).json({
      success: true,
      message: "Current user retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("GetCurrentUser error:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to retrieve current user.",
    });
  }
}

module.exports = {
  signup,
  login,
  me,
};
