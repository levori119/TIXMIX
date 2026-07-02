// Seed demo ticket listings (idempotent): adds one active listing (with a
// qty-1 price tier) for the soonest upcoming shows that don't have one yet.
// Seller = first admin user. Run: node --env-file=.env scripts/seed-listings.mjs
import pg from "pg";

const PRICES = [18000, 24000, 32000, 45000, 28000, 21000, 38000, 26000, 30000, 35000, 22000, 40000];
const COUNT = 12;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const c = await pool.connect();
try {
  const adminRow = (await c.query("SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1")).rows[0];
  if (!adminRow) throw new Error("no admin user found to own the listings");
  const seller = adminRow.id;

  const shows = (await c.query("SELECT id FROM shows WHERE starts_at > now() ORDER BY starts_at LIMIT $1", [COUNT])).rows;
  let added = 0;
  for (let i = 0; i < shows.length; i++) {
    const sid = shows[i].id;
    const has = (await c.query("SELECT 1 FROM listings WHERE show_id=$1 AND status='active' LIMIT 1", [sid])).rows[0];
    if (has) continue;
    const l = (await c.query(
      `INSERT INTO listings(seller_id,show_id,delivery_type,price_type,quantity_total,quantity_available,sold_individually,min_tickets_per_sale)
       VALUES($1,$2,'digital','above_cost',4,4,true,1) RETURNING id`,
      [seller, sid],
    )).rows[0];
    await c.query("INSERT INTO listing_price_tiers(listing_id,min_qty,unit_price_agorot) VALUES($1,1,$2)", [l.id, PRICES[i % PRICES.length]]);
    added++;
  }
  console.log(`demo listings added: ${added} (seller id ${seller})`);
} catch (e) {
  console.error("seed-listings failed:", e.message);
  process.exitCode = 1;
} finally {
  c.release();
  await pool.end();
}
