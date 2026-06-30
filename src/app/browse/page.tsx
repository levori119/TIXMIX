import { listUpcomingShows } from "@/db/public";
import { currentUser } from "@/lib/auth";
import { BrowseClient, type BrowseShow } from "./browse-client";

export const dynamic = "force-dynamic";

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export default async function BrowsePage() {
  const [rows, user] = await Promise.all([listUpcomingShows(), currentUser()]);

  const shows: BrowseShow[] = rows.map((r) => {
    const d = new Date(r.startsAt);
    return {
      id: r.id,
      eventName: r.eventName,
      venueName: r.venueName,
      city: r.city,
      day: String(d.getDate()),
      month: MONTHS[d.getMonth()],
      dateDisplay: d.toLocaleDateString("he-IL"),
      fromPriceAgorot: r.fromPriceAgorot,
      available: Number(r.available),
    };
  });

  return (
    <main className="container">
      <div className="greet">
        <div className="hi">
          {user ? <>היי {user.displayName.split(" ")[0]} <span className="wave">👋</span></> : <>גלה הופעות <span className="wave">🎉</span></>}
        </div>
        <div className="tag">{shows.length} הופעות קרובות · מצא את הכרטיס שלך</div>
      </div>

      <BrowseClient shows={shows} />
    </main>
  );
}
