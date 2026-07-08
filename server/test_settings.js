const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function testSettings() {
  const user = await prisma.user.findFirst();
  if (!user) { console.log("No user found"); return; }

  const token = jwt.sign(
    { userId: user.id, organizationId: user.organizationId },
    process.env.JWT_SECRET || 'secret'
  );

  // GET /api/settings
  let res = await fetch('http://localhost:4000/api/settings', {
    headers: { Authorization: `Bearer ${token}` }
  });
  let data = await res.json();
  console.log('GET /api/settings →', res.status, JSON.stringify(data));

  // PUT /api/settings - valid
  res = await fetch('http://localhost:4000/api/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ defaultLowStockThreshold: 10 })
  });
  data = await res.json();
  console.log('PUT /api/settings (valid) →', res.status, JSON.stringify(data));

  // PUT /api/settings - invalid (negative)
  res = await fetch('http://localhost:4000/api/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ defaultLowStockThreshold: -1 })
  });
  data = await res.json();
  console.log('PUT /api/settings (invalid) →', res.status, JSON.stringify(data));

  // GET again to verify persistence
  res = await fetch('http://localhost:4000/api/settings', {
    headers: { Authorization: `Bearer ${token}` }
  });
  data = await res.json();
  console.log('GET /api/settings (after update) →', res.status, JSON.stringify(data));
}

testSettings().catch(console.error).finally(() => prisma.$disconnect());
