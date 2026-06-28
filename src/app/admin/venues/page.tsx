import { listVenues } from "@/db/catalog";
import { deleteVenueAction } from "./actions";
import { VenueForm } from "./venue-form";

export const dynamic = "force-dynamic";

export default async function VenuesPage() {
  const venues = await listVenues();

  return (
    <main className="container narrow">
      <div className="page-head">
        <span className="crumb">ניהול / אולמות</span>
        <h1 className="page-title">אולמות 🏟️</h1>
      </div>

      <div className="card">
        <VenueForm />
      </div>

      <div className="card">
        <p className="section-title">אולמות קיימים ({venues.length})</p>
        {venues.length === 0 ? (
          <p className="empty">עדיין אין אולמות. הוסף את הראשון ☝️</p>
        ) : (
          <div className="list">
            {venues.map((v) => (
              <div key={v.id} className="list-item">
                <div className="meta">
                  <span className="title">{v.name}</span>
                  <span className="sub">
                    {[v.city, v.address].filter(Boolean).join(" · ") || "—"}
                    {v.capacity ? ` · ${v.capacity.toLocaleString("he-IL")} מקומות` : ""}
                  </span>
                </div>
                <form action={deleteVenueAction}>
                  <input type="hidden" name="id" value={v.id} />
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
