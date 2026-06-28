import { listListings } from "@/db/listings";
import { listShows } from "@/db/catalog";
import { createListingAction, deleteListingAction } from "./actions";
import { ListingForm } from "@/app/_components/listing-form";
import { toShowOptions } from "@/lib/show-options";

export const dynamic = "force-dynamic";

const priceTypeLabel: Record<string, string> = {
  at_cost: "מחיר עלות",
  above_cost: "מעל עלות",
  discount: "בהנחה",
};
const deliveryLabel: Record<string, string> = {
  digital: "דיגיטלי",
  physical: "פיזי",
};
const statusLabel: Record<string, string> = {
  active: "פעיל",
  reserved: "משוריין",
  sold: "נמכר",
  cancelled: "בוטל",
};

function ils(agorot: number | null) {
  if (agorot == null) return "—";
  return `₪${(agorot / 100).toLocaleString("he-IL", { minimumFractionDigits: 0 })}`;
}

export default async function ListingsPage() {
  const [rows, shows] = await Promise.all([listListings(), listShows()]);

  const showOptions = toShowOptions(shows);

  return (
    <main className="container narrow">
      <div className="page-head">
        <span className="crumb">ניהול / כרטיסים</span>
        <h1 className="page-title">כרטיסים למכירה 🎟️</h1>
      </div>

      <div className="card">
        <ListingForm
          action={createListingAction}
          shows={showOptions}
          title="פרסום כרטיס למכירה"
          submitLabel="🎟️ פרסום למכירה"
        />
      </div>

      <div className="card">
        <p className="section-title">היצע נוכחי ({rows.length})</p>
        {rows.length === 0 ? (
          <p className="empty">עדיין אין כרטיסים למכירה. פרסם את הראשון ☝️</p>
        ) : (
          <div className="list">
            {rows.map((r) => (
              <div key={r.id} className="list-item">
                <div className="meta">
                  <span className="title">
                    {r.eventName} — {ils(r.basePriceAgorot)} לכרטיס
                  </span>
                  <span className="sub">
                    {r.venueName} · {new Date(r.startsAt).toLocaleDateString("he-IL")} ·{" "}
                    {r.quantityAvailable}/{r.quantityTotal} זמינים ·{" "}
                    {priceTypeLabel[r.priceType]} · {deliveryLabel[r.deliveryType]} ·{" "}
                    {statusLabel[r.status]}
                  </span>
                </div>
                <form action={deleteListingAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="chip danger">מחיקה</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
