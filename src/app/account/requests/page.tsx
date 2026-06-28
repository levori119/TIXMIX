import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { listRequestsForBuyer } from "@/db/matching";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  queued: "בתור ⏳",
  matched: "הותאם ✓",
  fulfilled: "הושלם",
  expired: "פג",
  cancelled: "בוטל",
};

function ils(agorot: number | null) {
  if (agorot == null) return "—";
  return `₪${(agorot / 100).toLocaleString("he-IL")}`;
}

export default async function MyRequestsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const reqs = await listRequestsForBuyer(user.id);

  return (
    <main className="container narrow">
      <div className="page-head">
        <Link href="/account" className="crumb">← החשבון שלי</Link>
        <h1 className="page-title">הבקשות שלי 🎯</h1>
      </div>

      <div className="card">
        {reqs.length === 0 ? (
          <p className="empty">
            עדיין לא שלחת בקשות. <Link href="/browse">עיין בכרטיסים →</Link>
          </p>
        ) : (
          <div className="list">
            {reqs.map((r) => (
              <div key={r.id} className="list-item">
                <div className="meta">
                  <span className="title">{r.eventName}</span>
                  <span className="sub">
                    {r.venueName} ·{" "}
                    {new Date(r.startsAt).toLocaleDateString("he-IL")} · עד{" "}
                    {ils(r.priceMaxAgorot)}/כרטיס · {r.qtyMin}–{r.qtyMax} כרט'
                  </span>
                  <span className="sub" style={{ marginTop: 2 }}>
                    {statusLabel[r.status] ?? r.status}
                    {r.status === "matched" && r.matchedQty
                      ? ` · ${r.matchedQty} כרטיס ב-${ils(r.matchedUnitAgorot)}`
                      : ""}
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
