const prisma = require("../lib/prisma");

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });
}

async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: { organization: true },
  });
}

async function createUserWithOrganization(email, passwordHash, organizationName) {
  return prisma.organization.create({
    data: {
      name: organizationName,
      users: {
        create: {
          email,
          passwordHash,
        },
      },
    },
    include: {
      users: true,
    },
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUserWithOrganization,
};
