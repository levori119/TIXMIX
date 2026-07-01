import Link from "next/link";
import { listUsersWithStats, type UserSort } from "@/db/admin-users";

export const dynamic = "force-dynamic";

function ils(a: number) {
  return `₪${(a / 100).toLocaleString("he-IL")}`;
}

function daysAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const days = Math.floor(ms / 86400000);
  if (days <= 0) return "היום";
  if (days === 1) return "אתמול";
  if (days < 30) return `לפני ${days} ימים`;
  const months = Math.floor(days / 30);
  return `לפני ${months} חודשים`;
}

const SORTS: { key: UserSort; label: string }[] = [
  { key: "active_asc", label: "לא פעילים ראשונים" },
  { key: "active_desc", label: "פעילים לאחרונה" },
  { key: "spent", label: "הכי הוציאו" },
  { key: "received", label: "הכי הרוויחו" },
  { key: "requests", label: "הכי בקשות" },
  { key: "joined", label: "הצטרפו לאחרונה" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const active = (SORTS.find((s) => s.key === sort)?.key ?? "active_asc") as UserSort;
  const users = await listUsersWithStats(active);

  return (
    <main className="container">
      <div className="page-head">
        <span className="crumb">ניהול / משתמשים</span>
        <h1 className="page-title">משתמשים 👥</h1>
      </div>

      <div className="cats">
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={`/admin/users?sort=${s.key}`}
            className={`cat ${active === s.key ? "active" : ""}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="utable-wrap">
          <table className="utable">
            <thead>
              <tr>
                <th>משתמש</th>
                <th>סוג</th>
                <th>סגנון מועדף</th>
                <th>פעיל לאחרונה</th>
                <th>בקשות</th>
                <th>רכישות</th>
                <th>הוציא</th>
                <th>הרוויח</th>
                <th>כרטיס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const stale = Date.now() - u.lastActive.getTime() > 14 * 86400000;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="ucell">
                        <span className="uname">{u.displayName}</span>
                        <span className="uemail">{u.email}</span>
                      </div>
                    </td>
                    <td>{u.role === "admin" ? "🛡️ מנהל" : "לקוח"}</td>
                    <td>{u.topGenre ? `${u.topGenreEmoji ?? ""} ${u.topGenre}` : "—"}</td>
                    <td className={stale ? "stale" : ""}>{daysAgo(u.lastActive)}</td>
                    <td>{u.reqCount}</td>
                    <td>{u.purchases}</td>
                    <td>{u.spentAgorot ? ils(u.spentAgorot) : "—"}</td>
                    <td>{u.receivedAgorot ? ils(u.receivedAgorot) : "—"}</td>
                    <td>{u.hasCard ? "✅" : "—"}</td>
                    <td><Link href={`/admin/users/${u.id}`} className="chip">פרטים</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="hint" style={{ marginTop: 12 }}>
        סכומים מחושבים מעסקאות שהושלמו (escrow שוחרר). שורות אדמדמות = לא פעיל מעל 14 יום.
      </p>
    </main>
  );
}
