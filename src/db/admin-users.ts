import "server-only";
import { sql } from "drizzle-orm";
import { db } from "./index";

export type UserRow = {
  id: number;
  displayName: string;
  email: string;
  role: string;
  trustScore: number;
  createdAt: Date;
  reqCount: number;
  purchases: number;
  spentAgorot: number;
  receivedAgorot: number;
  listingsCount: number;
  salesCount: number;
  lastActive: Date;
  hasCard: boolean;
  topGenre: string | null;
  topGenreEmoji: string | null;
};

export type UserSort =
  | "active_asc"
  | "active_desc"
  | "spent"
  | "received"
  | "requests"
  | "joined";

export async function listUsersWithStats(sort: UserSort = "active_asc"): Promise<UserRow[]> {
  const res = await db.execute(sql`
    SELECT u.id, u.display_name, u.email, u.role, u.trust_score, u.created_at,
      (SELECT count(*) FROM buy_requests br WHERE br.buyer_id = u.id) AS req_count,
      (SELECT max(br.created_at) FROM buy_requests br WHERE br.buyer_id = u.id) AS last_req,
      (SELECT count(*) FROM trades t WHERE t.buyer_id = u.id AND t.state = 'released') AS purchases,
      (SELECT coalesce(sum(t.amount_agorot),0) FROM trades t WHERE t.buyer_id = u.id AND t.state = 'released') AS spent,
      (SELECT count(*) FROM trades t WHERE t.seller_id = u.id AND t.state = 'released') AS sales_count,
      (SELECT coalesce(sum(t.amount_agorot - t.commission_agorot),0) FROM trades t WHERE t.seller_id = u.id AND t.state = 'released') AS received,
      (SELECT count(*) FROM listings l WHERE l.seller_id = u.id) AS listings_count,
      (SELECT max(t.state_changed_at) FROM trades t WHERE t.buyer_id = u.id OR t.seller_id = u.id) AS last_trade,
      (SELECT EXISTS(SELECT 1 FROM payment_methods pm WHERE pm.user_id = u.id AND pm.verification_status = 'verified')) AS has_card,
      (SELECT g.name_he FROM user_genre_affinity a JOIN genres g ON g.id = a.genre_id WHERE a.user_id = u.id AND a.score > 0 ORDER BY a.score DESC LIMIT 1) AS top_genre,
      (SELECT g.emoji FROM user_genre_affinity a JOIN genres g ON g.id = a.genre_id WHERE a.user_id = u.id AND a.score > 0 ORDER BY a.score DESC LIMIT 1) AS top_genre_emoji
    FROM users u
  `);

  const rows: UserRow[] = (res.rows as Record<string, unknown>[]).map((r) => {
    const created = new Date(r.created_at as string);
    const times = [created];
    if (r.last_req) times.push(new Date(r.last_req as string));
    if (r.last_trade) times.push(new Date(r.last_trade as string));
    const lastActive = new Date(Math.max(...times.map((t) => t.getTime())));
    return {
      id: Number(r.id),
      displayName: String(r.display_name),
      email: String(r.email),
      role: String(r.role),
      trustScore: Number(r.trust_score),
      createdAt: created,
      reqCount: Number(r.req_count),
      purchases: Number(r.purchases),
      spentAgorot: Number(r.spent),
      receivedAgorot: Number(r.received),
      listingsCount: Number(r.listings_count),
      salesCount: Number(r.sales_count),
      lastActive,
      hasCard: Boolean(r.has_card),
      topGenre: (r.top_genre as string) ?? null,
      topGenreEmoji: (r.top_genre_emoji as string) ?? null,
    };
  });

  const cmp: Record<UserSort, (a: UserRow, b: UserRow) => number> = {
    active_asc: (a, b) => a.lastActive.getTime() - b.lastActive.getTime(),
    active_desc: (a, b) => b.lastActive.getTime() - a.lastActive.getTime(),
    spent: (a, b) => b.spentAgorot - a.spentAgorot,
    received: (a, b) => b.receivedAgorot - a.receivedAgorot,
    requests: (a, b) => b.reqCount - a.reqCount,
    joined: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  };
  return rows.sort(cmp[sort] ?? cmp.active_asc);
}

export type UserDetail = {
  user: {
    id: number;
    displayName: string;
    email: string;
    phone: string | null;
    role: string;
    trustScore: number;
    createdAt: Date;
  } | null;
  genres: { nameHe: string; emoji: string | null; score: number }[];
  requests: {
    id: number;
    eventName: string;
    venueName: string;
    startsAt: Date;
    priceMaxAgorot: number;
    status: string;
    createdAt: Date;
  }[];
  trades: {
    id: number;
    side: string;
    eventName: string;
    amountAgorot: number;
    commissionAgorot: number;
    state: string;
    changedAt: Date;
  }[];
};

export async function getUserDetail(userId: number): Promise<UserDetail> {
  const uRes = await db.execute(sql`
    SELECT id, display_name, email, phone, role, trust_score, created_at
    FROM users WHERE id = ${userId}
  `);
  const u = (uRes.rows as Record<string, unknown>[])[0];

  const gRes = await db.execute(sql`
    SELECT g.name_he, g.emoji, a.score
    FROM user_genre_affinity a JOIN genres g ON g.id = a.genre_id
    WHERE a.user_id = ${userId} AND a.score > 0
    ORDER BY a.score DESC
  `);

  const rRes = await db.execute(sql`
    SELECT br.id, e.name AS event_name, v.name AS venue_name, s.starts_at,
           br.price_max_agorot, br.status, br.created_at
    FROM buy_requests br
    JOIN shows s ON s.id = br.show_id
    JOIN events e ON e.id = s.event_id
    JOIN venues v ON v.id = s.venue_id
    WHERE br.buyer_id = ${userId}
    ORDER BY br.seq DESC LIMIT 100
  `);

  const tRes = await db.execute(sql`
    SELECT t.id,
           CASE WHEN t.buyer_id = ${userId} THEN 'buy' ELSE 'sell' END AS side,
           e.name AS event_name, t.amount_agorot, t.commission_agorot, t.state, t.state_changed_at
    FROM trades t
    JOIN matches m ON m.id = t.match_id
    JOIN listings l ON l.id = m.listing_id
    JOIN shows s ON s.id = l.show_id
    JOIN events e ON e.id = s.event_id
    WHERE t.buyer_id = ${userId} OR t.seller_id = ${userId}
    ORDER BY t.id DESC LIMIT 100
  `);

  return {
    user: u
      ? {
          id: Number(u.id),
          displayName: String(u.display_name),
          email: String(u.email),
          phone: (u.phone as string) ?? null,
          role: String(u.role),
          trustScore: Number(u.trust_score),
          createdAt: new Date(u.created_at as string),
        }
      : null,
    genres: (gRes.rows as Record<string, unknown>[]).map((g) => ({
      nameHe: String(g.name_he),
      emoji: (g.emoji as string) ?? null,
      score: Number(g.score),
    })),
    requests: (rRes.rows as Record<string, unknown>[]).map((r) => ({
      id: Number(r.id),
      eventName: String(r.event_name),
      venueName: String(r.venue_name),
      startsAt: new Date(r.starts_at as string),
      priceMaxAgorot: Number(r.price_max_agorot),
      status: String(r.status),
      createdAt: new Date(r.created_at as string),
    })),
    trades: (tRes.rows as Record<string, unknown>[]).map((t) => ({
      id: Number(t.id),
      side: String(t.side),
      eventName: String(t.event_name),
      amountAgorot: Number(t.amount_agorot),
      commissionAgorot: Number(t.commission_agorot),
      state: String(t.state),
      changedAt: new Date(t.state_changed_at as string),
    })),
  };
}
