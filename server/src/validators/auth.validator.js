function validateSignup(data) {
  const { email, password, confirmPassword, organizationName } = data;
  const errors = [];

  if (!organizationName || typeof organizationName !== "string" || !organizationName.trim()) {
    errors.push("Organization name is required.");
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required.");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Invalid email address format.");
    }
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else if (password.length < 8) {
    errors.push("Password must contain at least 8 characters.");
  }

  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateLogin(data) {
  const { email, password } = data;
  const errors = [];

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required.");
  }

  if (!password || typeof password !== "string" || !password) {
    errors.push("Password is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateSignup,
  validateLogin,
};
