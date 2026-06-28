// Create (or update) an admin user.
// Usage:
//   node --env-file=.env scripts/create-admin.mjs <email> <password> ["Display Name"]
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const [, , emailArg, passwordArg, nameArg] = process.argv;
const email = (emailArg || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
const password = passwordArg || process.env.ADMIN_PASSWORD || "";
const displayName = nameArg || process.env.ADMIN_NAME || "Admin";

if (!email || !password) {
  console.error("Usage: node --env-file=.env scripts/create-admin.mjs <email> <password> [name]");
  process.exit(1);
}

function hashPassword(pw) {
  const salt = randomBytes(16);
  const key = scryptSync(pw, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const passwordHash = hashPassword(password);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash,
                   display_name = EXCLUDED.display_name,
                   role = 'admin'
     RETURNING id, email, role`,
    [email, passwordHash, displayName],
  );
  console.log("✓ admin ready:", rows[0]);
} catch (e) {
  console.error("create-admin failed:", e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
