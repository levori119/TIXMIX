import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { logoutToHomeAction } from "../auth-actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="container narrow">
        <div className="page-head">
          <span className="crumb">TixMix</span>
          <h1 className="page-title">החשבון שלי 👤</h1>
        </div>
        <div className="card">
          <p className="empty">אינך מחובר.</p>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link href="/login" className="btn">כניסה</Link>
            <Link href="/register" className="btn ghost">הרשמה</Link>
          </div>
        </div>
      </main>
    );
  }

  const tiles = [
    { href: "/browse", te: "🎟️", tt: "גלה כרטיסים", ts: "מצא הופעות" },
    { href: "/sell", te: "➕", tt: "מכירת כרטיס", ts: "פרסם למכירה" },
    { href: "/account/payment", te: "💳", tt: "אמצעי תשלום", ts: "כרטיס ואימות" },
    { href: "/account/listings", te: "📋", tt: "הכרטיסים שלי", ts: "ההיצע שלך" },
    { href: "/account/requests", te: "🎯", tt: "הבקשות שלי", ts: "בתור לקנייה" },
    { href: "/account/trades", te: "🤝", tt: "עסקאות קנייה", ts: "תשלום ואישור" },
    { href: "/account/sales", te: "💰", tt: "המכירות שלי", ts: "מסירת כרטיס" },
  ];

  return (
    <main className="container">
      <div className="greet">
        <div className="hi">היי {user.displayName.split(" ")[0]} 👋</div>
        <div className="tag">
          {user.email} · {user.role === "admin" ? "מנהל 🛡️" : "חשבון לקוח"}
        </div>
      </div>

      <div className="tiles">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="tile">
            <span className="te">{t.te}</span>
            <span className="tt">{t.tt}</span>
            <span className="ts">{t.ts}</span>
          </Link>
        ))}
        {user.role === "admin" ? (
          <Link href="/admin/settings" className="tile">
            <span className="te">🛡️</span>
            <span className="tt">מסך ניהול</span>
            <span className="ts">אדמין</span>
          </Link>
        ) : null}
      </div>

      <form action={logoutToHomeAction} style={{ marginTop: 18 }}>
        <button type="submit" className="btn ghost">יציאה מהחשבון</button>
      </form>
    </main>
  );
}
