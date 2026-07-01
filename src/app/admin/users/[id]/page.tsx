import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/db/admin-users";

export const dynamic = "force-dynamic";

function ils(a: number) {
  return `₪${(a / 100).toLocaleString("he-IL")}`;
}

const reqStatus: Record<string, string> = {
  queued: "בתור",
  matched: "הותאם",
  fulfilled: "הושלם",
  expired: "פג",
  cancelled: "בוטל",
};
const tradeState: Record<string, string> = {
  offer_accepted: "ממתין לתשלום",
  funds_held: "בנאמנות",
  ticket_delivered: "נמסר",
  released: "הושלם",
  refunded: "הוחזר",
  cancelled: "בוטל",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) notFound();
  const { user, genres, requests, trades } = await getUserDetail(userId);
  if (!user) notFound();

  const spent = trades.filter((t) => t.side === "buy" && t.state === "released").reduce((s, t) => s + t.amountAgorot, 0);
  const received = trades.filter((t) => t.side === "sell" && t.state === "released").reduce((s, t) => s + (t.amountAgorot - t.commissionAgorot), 0);

  return (
    <main className="container narrow">
      <Link href="/admin/users" className="crumb" style={{ display: "inline-block", marginTop: 8 }}>← כל המשתמשים</Link>

      <div className="card">
        <p className="big">{user.displayName} {user.role === "admin" ? "🛡️" : ""}</p>
        <p className="muted">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
        <p className="muted">
          הצטרף: {user.createdAt.toLocaleDateString("he-IL")} · אמון: {user.trustScore} ·
          {" "}הוציא {ils(spent)} · הרוויח {ils(received)}
        </p>
        {genres.length > 0 ? (
          <div className="gtags" style={{ marginTop: 10 }}>
            {genres.map((g) => (
              <span key={g.nameHe} className="gtag">{g.emoji} {g.nameHe} · {g.score}</span>
            ))}
          </div>
        ) : <p className="muted" style={{ marginTop: 8 }}>אין עדיין פרופיל טעם.</p>}
      </div>

      <div className="card">
        <p className="section-title">בקשות קנייה ({requests.length})</p>
        {requests.length === 0 ? (
          <p className="empty">אין בקשות.</p>
        ) : (
          <div className="list">
            {requests.map((r) => (
              <div key={r.id} className="list-item">
                <div className="meta">
                  <span className="title">{r.eventName}</span>
                  <span className="sub">
                    {r.venueName} · עד {ils(r.priceMaxAgorot)} · {reqStatus[r.status] ?? r.status} ·{" "}
                    {r.createdAt.toLocaleDateString("he-IL")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <p className="section-title">היסטוריית עסקאות ({trades.length})</p>
        {trades.length === 0 ? (
          <p className="empty">אין עסקאות.</p>
        ) : (
          <div className="list">
            {trades.map((t) => (
              <div key={t.id} className="list-item">
                <div className="meta">
                  <span className="title">
                    {t.side === "buy" ? "🛒 קנייה" : "💰 מכירה"} · {t.eventName} · {ils(t.amountAgorot)}
                  </span>
                  <span className="sub">
                    {tradeState[t.state] ?? t.state}
                    {t.side === "sell" && t.commissionAgorot ? ` · עמלה ${ils(t.commissionAgorot)}` : ""} ·{" "}
                    {t.changedAt.toLocaleDateString("he-IL")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
