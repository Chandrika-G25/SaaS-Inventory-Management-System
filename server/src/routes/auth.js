const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();

function issueToken(user) {
  return jwt.sign(
    { userId: user.id, organizationId: user.organizationId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { email, password, organizationName } = req.body;

  if (!email || !password || !organizationName) {
    return res
      .status(400)
      .json({ error: "email, password, and organizationName are required" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create org + user together so every user always belongs to an org
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        users: {
          create: { email, passwordHash },
        },
      },
      include: { users: true },
    });

    const user = organization.users[0];
    const token = issueToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email },
      organization: { id: organization.id, name: organization.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = issueToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email },
      organization: { id: user.organization.id, name: user.organization.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
