import { listShows, listEvents, listVenues } from "@/db/catalog";
import { deleteShowAction } from "./actions";
import { ShowForm } from "./show-form";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  on_sale: "במכירה",
  sold_out: "אזל",
  past: "עבר",
};

export default async function ShowsPage() {
  const [shows, events, venues] = await Promise.all([
    listShows(),
    listEvents(),
    listVenues(),
  ]);

  return (
    <main className="container narrow">
      <div className="page-head">
        <span className="crumb">ניהול / מופעים</span>
        <h1 className="page-title">מופעים 📅</h1>
      </div>

      <div className="card">
        <ShowForm
          events={events.map((e) => ({ id: e.id, name: e.name }))}
          venues={venues.map((v) => ({ id: v.id, name: v.name }))}
        />
      </div>

      <div className="card">
        <p className="section-title">מופעים מתוכננים ({shows.length})</p>
        {shows.length === 0 ? (
          <p className="empty">עדיין אין מופעים. הוסף את הראשון ☝️</p>
        ) : (
          <div className="list">
            {shows.map((s) => (
              <div key={s.id} className="list-item">
                <div className="meta">
                  <span className="title">{s.eventName}</span>
                  <span className="sub">
                    {s.venueName} ·{" "}
                    {new Date(s.startsAt).toLocaleString("he-IL", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {statusLabel[s.status] ?? s.status}
                  </span>
                </div>
                <form action={deleteShowAction}>
                  <input type="hidden" name="id" value={s.id} />
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
