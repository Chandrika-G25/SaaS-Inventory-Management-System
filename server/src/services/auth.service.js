const bcrypt = require("bcryptjs");
const authRepository = require("../repositories/auth.repository");
const { validateSignup, validateLogin } = require("../validators/auth.validator");
const { generateToken } = require("../utils/jwt");

class AuthError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function signup(data) {
  const validation = validateSignup(data);
  if (!validation.isValid) {
    throw new AuthError(validation.errors.join(" "), 400);
  }

  const { email, password, organizationName } = data;

  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AuthError("An account with that email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const organization = await authRepository.createUserWithOrganization(
    email,
    passwordHash,
    organizationName
  );

  const user = organization.users[0];

  const token = generateToken({
    userId: user.id,
    organizationId: organization.id,
  });

  return {
    token,
    user: { id: user.id, email: user.email },
    organization: { id: organization.id, name: organization.name },
  };
}

async function login(data) {
  const validation = validateLogin(data);
  if (!validation.isValid) {
    throw new AuthError(validation.errors.join(" "), 400);
  }

  const { email, password } = data;

  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new AuthError("Invalid credentials.", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthError("Invalid credentials.", 401);
  }

  const token = generateToken({
    userId: user.id,
    organizationId: user.organizationId,
  });

  return {
    token,
    user: { id: user.id, email: user.email },
    organization: { id: user.organization.id, name: user.organization.name },
  };
}

async function getCurrentUser(userId) {
  if (!userId) {
    throw new AuthError("User ID is required.", 400);
  }

  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AuthError("User not found.", 404);
  }

  return {
    user: { id: user.id, email: user.email },
    organization: { id: user.organization.id, name: user.organization.name },
  };
}

module.exports = {
  AuthError,
  signup,
  login,
  getCurrentUser,
};
