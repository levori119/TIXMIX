import { listEvents } from "@/db/catalog";
import { deleteEventAction } from "./actions";
import { EventForm } from "./event-form";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listEvents();

  return (
    <main className="container narrow">
      <div className="page-head">
        <span className="crumb">ניהול / הופעות</span>
        <h1 className="page-title">הופעות 🎤</h1>
      </div>

      <div className="card">
        <EventForm />
      </div>

      <div className="card">
        <p className="section-title">הופעות קיימות ({events.length})</p>
        {events.length === 0 ? (
          <p className="empty">עדיין אין הופעות. הוסף את הראשונה ☝️</p>
        ) : (
          <div className="list">
            {events.map((e) => (
              <div key={e.id} className="list-item">
                <div className="meta">
                  <span className="title">{e.name}</span>
                  <span className="sub">
                    {[e.artist, e.category].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>
                <form action={deleteEventAction}>
                  <input type="hidden" name="id" value={e.id} />
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
