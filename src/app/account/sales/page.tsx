import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { listTradesForSeller } from "@/db/escrow";
import { deliverAction } from "./actions";

export const dynamic = "force-dynamic";

const stateLabel: Record<string, string> = {
  offer_accepted: "ממתין לתשלום הקונה 💳",
  funds_held: "שולם — מסור את הכרטיס 🎫",
  ticket_delivered: "נמסר — ממתין לאישור הקונה",
  released: "הושלם — הכסף שוחרר ✓",
  refunded: "הוחזר ↩",
  cancelled: "בוטל",
  disputed: "במחלוקת",
  timed_out: "פג",
};

function ils(a: number) {
  return `₪${(a / 100).toLocaleString("he-IL")}`;
}

export default async function MySalesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { ok, err } = await searchParams;
  const sales = await listTradesForSeller(user.id);

  return (
    <main className="container narrow">
      <div className="page-head">
        <Link href="/account" className="crumb">← החשבון שלי</Link>
        <h1 className="page-title">המכירות שלי 💰</h1>
      </div>

      {ok ? <div className="notice ok">✓ הכרטיס סומן כנמסר</div> : null}
      {err ? <div className="notice err">⚠ {err}</div> : null}

      <div className="card">
        {sales.length === 0 ? (
          <p className="empty">
            עדיין אין מכירות. <Link href="/sell">פרסם כרטיס →</Link>
          </p>
        ) : (
          <div className="list">
            {sales.map((t) => (
              <div key={t.id} className="list-item">
                <div className="meta">
                  <span className="title">
                    {t.eventName} · {ils(t.amountAgorot)}
                    {t.commissionAgorot ? ` (פחות עמלה ${ils(t.commissionAgorot)})` : ""}
                  </span>
                  <span className="sub">
                    קונה: {t.buyerName} · {stateLabel[t.state] ?? t.state}
                  </span>
                </div>
                {t.state === "funds_held" ? (
                  <form action={deliverAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="btn">מסירת כרטיס</button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="hint" style={{ marginTop: 14 }}>
        🔒 הכסף משוחרר אליך (פחות העמלה) רק לאחר שהקונה מאשר קבלה.
      </p>
    </main>
  );
}
