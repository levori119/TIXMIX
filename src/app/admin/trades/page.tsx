import { listAllTrades } from "@/db/escrow";
import { deliverAction, refundAction } from "./actions";

export const dynamic = "force-dynamic";

const stateLabel: Record<string, string> = {
  offer_accepted: "ממתין לתשלום",
  funds_held: "כסף בנאמנות 🔒",
  ticket_delivered: "נמסר",
  released: "הושלם ✓",
  refunded: "הוחזר ↩",
  cancelled: "בוטל",
  disputed: "במחלוקת",
  timed_out: "פג",
};

function ils(a: number) {
  return `₪${(a / 100).toLocaleString("he-IL")}`;
}

export default async function AdminTradesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const trades = await listAllTrades();

  return (
    <main className="container narrow">
      <div className="page-head">
        <span className="crumb">ניהול / עסקאות</span>
        <h1 className="page-title">עסקאות (Escrow) 🤝</h1>
      </div>

      {ok ? <div className="notice ok">✓ הפעולה בוצעה</div> : null}
      {err ? <div className="notice err">⚠ {err}</div> : null}

      <div className="card">
        <p className="section-title">כל העסקאות ({trades.length})</p>
        {trades.length === 0 ? (
          <p className="empty">עדיין אין עסקאות. עסקה נוצרת כשבקשת קנייה מותאמת לכרטיס.</p>
        ) : (
          <div className="list">
            {trades.map((t) => (
              <div key={t.id} className="list-item">
                <div className="meta">
                  <span className="title">
                    #{t.id} · {t.eventName} · {ils(t.amountAgorot)}
                    {t.commissionAgorot ? ` (עמלה ${ils(t.commissionAgorot)})` : ""}
                  </span>
                  <span className="sub">
                    {t.buyerName} ← {t.sellerName} · {stateLabel[t.state] ?? t.state}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {t.state === "funds_held" ? (
                    <form action={deliverAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className="chip" type="submit">מסירת כרטיס</button>
                    </form>
                  ) : null}
                  {["offer_accepted", "funds_held", "ticket_delivered"].includes(t.state) ? (
                    <form action={refundAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className="chip danger" type="submit">החזר/בטל</button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
