const { Client } = require('pg');

const password = process.env.POSTGRES_PASSWORD;
const connectionString = `postgres://postgres.lkwjlzkrdvbewrbrzddj:${password}@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`;

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

client
  .connect()
  .then(() => client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"))
  .then((r) => {
    console.log(r.rows.map((x) => x.tablename).join(', ') || '(none)');
    return client.end();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
