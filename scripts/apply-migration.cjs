const fs = require('fs');
const { Client } = require('pg');

const password = process.env.POSTGRES_PASSWORD;
const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  (password
    ? `postgres://postgres.lkwjlzkrdvbewrbrzddj:${password}@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`
    : null);

if (!connectionString) {
  console.error('Set POSTGRES_PASSWORD or POSTGRES_URL_NON_POOLING env var');
  process.exit(1);
}

const sql = fs.readFileSync(
  'supabase/migrations/20260619120000_initial_schema.sql',
  'utf8'
);

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  const { rows } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );

  if (rows.some((r) => r.tablename === 'listings')) {
    console.log('Schema already exists, skipping migration.');
    console.log('Tables:', rows.map((r) => r.tablename).join(', '));
    await client.end();
    return;
  }

  await client.query(sql);

  const { rows: after } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  console.log('Migration applied successfully.');
  console.log('Tables:', after.map((r) => r.tablename).join(', '));

  const { rows: cities } = await client.query('SELECT count(*)::int AS n FROM cities');
  const { rows: plans } = await client.query(
    'SELECT slug, price_inr FROM plans ORDER BY priority_rank'
  );
  console.log('Cities seeded:', cities[0].n);
  console.log('Plans:', plans.map((p) => `${p.slug} (INR ${p.price_inr})`).join(', '));

  await client.end();
}

main().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
