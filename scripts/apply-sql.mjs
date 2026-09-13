#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

function loadEnv() {
  try {
    const text = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const key = line.slice(0, i);
      if (!process.env[key]) process.env[key] = line.slice(i + 1);
    }
  } catch {
    // env already provided
  }
}

function connectionString() {
  loadEnv();
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.SUPABASE_PROJECT_REF;
  const pooler = process.env.SUPABASE_POOLER_URL;
  if (pooler) return pooler;
  if (password && ref) {
    // Session-mode pooler (5432) can run migration files. Direct db.*:5432 is IPv6-only from this host.
    return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
  }
  if (process.env.DATABASE_URL?.includes("pooler.supabase.com")) return process.env.DATABASE_URL;
  throw new Error(
    "Need SUPABASE_DB_PASSWORD + SUPABASE_PROJECT_REF (or SUPABASE_POOLER_URL). Direct db.*:5432 is IPv6-only from this host.",
  );
}

function splitSql(sql) {
  return sql
    .replace(/--[^\n]*/g, "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

async function recordMigration(client, version, name, sql) {
  await client.query(
    `insert into supabase_migrations.schema_migrations (version, name, statements)
     values ($1, $2, $3)
     on conflict (version) do nothing`,
    [version, name, splitSql(sql)],
  );
}

async function main() {
  const dir = join(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((name) => /^\d+_.*\.sql$/.test(name))
    .sort();
  const client = new pg.Client({
    connectionString: connectionString(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const applied = new Set(
    (await client.query(`select version from supabase_migrations.schema_migrations`)).rows.map((row) => row.version),
  );
  const stories = await client.query(`select to_regclass('public.stories') as t`);
  const storiesExist = Boolean(stories.rows[0]?.t);

  for (const file of files) {
    const version = file.slice(0, 4);
    const name = file.replace(/^\d+_/, "").replace(/\.sql$/, "");
    const sql = readFileSync(join(dir, file), "utf8");
    if (applied.has(version)) {
      console.log(`${file} already recorded`);
      continue;
    }
    // 0001 is not idempotent. If the schema is already there, only stamp the row.
    if (version === "0001" && storiesExist) {
      await recordMigration(client, version, name, sql);
      console.log(`${file} already present — recorded only`);
      continue;
    }
    process.stdout.write(`${file} … `);
    await client.query("begin");
    try {
      for (const statement of splitSql(sql)) {
        await client.query(statement);
      }
      await recordMigration(client, version, name, sql);
      await client.query("commit");
      console.log("applied");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }

  const cols = await client.query(`
    select column_name from information_schema.columns
    where table_schema='public' and table_name='stories'
      and column_name in ('virtual_base_raw','lp_base_reserved_raw','curve_k','curve_address')
    order by 1
  `);
  const nullable = await client.query(`
    select is_nullable from information_schema.columns
    where table_schema='public' and table_name='stories' and column_name='author_user_id'
  `);
  const versions = await client.query(`select version, name from supabase_migrations.schema_migrations order by version`);
  console.log(
    "stories extra:",
    cols.rows.map((row) => row.column_name).join(", ") || "(missing)",
    "· author_user_id nullable:",
    nullable.rows[0]?.is_nullable,
  );
  console.log(
    "migrations:",
    versions.rows.map((row) => `${row.version} ${row.name}`).join(", "),
  );
  await client.end();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
