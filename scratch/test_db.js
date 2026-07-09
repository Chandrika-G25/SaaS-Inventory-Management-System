const { Client } = require('pg');

async function test() {
  // Let's test with the non-pooler URL or pooler URL
  const connectionString = "postgresql://neondb_owner:npg_oFSwt3Drbv0R@ep-cool-sky-atmpegzd.us-east-1.aws.neon.tech/neondb?sslmode=require";
  console.log("Connecting to:", connectionString);
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("SUCCESS connected!");
    const res = await client.query('SELECT NOW()');
    console.log("Time from DB:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("FAILED to connect:", err);
  }
}

test();
