const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function testAdjust() {
  const user = await prisma.user.findFirst({ include: { organization: true } });
  if (!user) {
    console.log("No user found");
    return;
  }
  
  const token = jwt.sign(
    { userId: user.id, organizationId: user.organizationId },
    process.env.JWT_SECRET || 'secret'
  );
  
  let product = await prisma.product.findFirst({ where: { organizationId: user.organizationId } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        organizationId: user.organizationId,
        name: "Test Widget",
        sku: "WIDGET-01",
        quantity: 10,
      }
    });
  }
  
  console.log(`Original qty: ${product.quantity}`);
  
  const res = await fetch(`http://localhost:4000/api/products/${product.id}/adjust`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ adjustment: 5, note: "Found 5 extra in warehouse" })
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response text:", text);
  
  const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
  console.log(`Updated qty: ${updatedProduct.quantity}, Note: ${updatedProduct.lastUpdateNote}, By: ${updatedProduct.lastUpdatedBy}`);
}

testAdjust().catch(console.error).finally(() => prisma.$disconnect());
