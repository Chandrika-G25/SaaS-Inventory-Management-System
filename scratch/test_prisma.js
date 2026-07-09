const { PrismaClient } = require('@prisma/client');

async function test() {
  const urlWithoutPooler = "postgresql://neondb_owner:npg_oFSwt3Drbv0R@ep-cool-sky-atmpegzd.us-east-1.aws.neon.tech/neondb?sslmode=require";
  console.log("Testing Prisma with non-pooler URL...");
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: urlWithoutPooler
      }
    }
  });

  try {
    const res = await prisma.$queryRaw`SELECT NOW()`;
    console.log("SUCCESS connected via Prisma!", res);
  } catch (err) {
    console.error("FAILED to connect via Prisma:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
