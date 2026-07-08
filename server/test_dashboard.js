const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function testDashboard() {
  const user = await prisma.user.findFirst({ include: { organization: true } });
  if (!user) {
    console.log("No user found");
    return;
  }
  
  const token = jwt.sign(
    { userId: user.id, organizationId: user.organizationId },
    process.env.JWT_SECRET || 'secret'
  );
  
  const res = await fetch(`http://localhost:4000/api/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Dashboard response:", JSON.stringify(data, null, 2));
}

testDashboard().catch(console.error).finally(() => prisma.$disconnect());
