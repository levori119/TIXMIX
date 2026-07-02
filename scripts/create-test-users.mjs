// Create fictitious test users (login by name, password "1").
// Run: node --env-file=.env scripts/create-test-users.mjs
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const USERS = [
  ["עברי", "ivri@tixmix.local"],
  ["עלמה", "alma@tixmix.local"],
  ["מירב", "merav@tixmix.local"],
  ["נועה", "noa@tixmix.local"],
  ["רומי", "romi@tixmix.local"],
];
const PASSWORD = "1";

function hashPassword(pw) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const c = await pool.connect();
try {
  for (const [name, email] of USERS) {
    const hash = hashPassword(PASSWORD);
    const r = await c.query(
      `INSERT INTO users(email, password_hash, display_name, role)
       VALUES($1,$2,$3,'client')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, display_name = EXCLUDED.display_name
       RETURNING id, display_name`,
      [email, hash, name],
    );
    console.log("✓", r.rows[0].display_name, `(id ${r.rows[0].id})`);
  }
  console.log('done — login with the NAME, password "1"');
} catch (e) {
  console.error("failed:", e.message);
  process.exitCode = 1;
} finally {
  c.release();
  await pool.end();
}
