"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CalGenre = { slug: string; nameHe: string; emoji: string | null };
export type CalShow = {
  id: number;
  eventName: string;
  venueName: string;
  city: string | null;
  dateKey: string; // yyyy-mm-dd
  dayNum: string;
  weekday: string;
  timeStr: string;
  fromPriceAgorot: number | null;
  available: number;
  genres: CalGenre[];
};

function ils(a: number | null) {
  return a == null ? null : `₪${Math.round(a / 100).toLocaleString("he-IL")}`;
}

export function CalendarView({
  shows,
  monthLabel,
  prevMonth,
  nextMonth,
}: {
  shows: CalShow[];
  monthLabel: string;
  prevMonth: string;
  nextMonth: string;
}) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("הכל");

  const genreChips = useMemo(() => {
    const seen = new Map<string, CalGenre>();
    shows.forEach((s) => s.genres.forEach((g) => seen.set(g.slug, g)));
    return Array.from(seen.values());
  }, [shows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return shows.filter((s) => {
      if (genre !== "הכל" && !s.genres.some((g) => g.slug === genre)) return false;
      if (needle && !`${s.eventName} ${s.venueName} ${s.city ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [shows, q, genre]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalShow[]>();
    for (const s of filtered) {
      const arr = map.get(s.dateKey) ?? [];
      arr.push(s);
      map.set(s.dateKey, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <div className="calmonth">
        <Link href={`/calendar?month=${prevMonth}`} className="chip">‹ קודם</Link>
        <span className="calmonth-label">{monthLabel}</span>
        <Link href={`/calendar?month=${nextMonth}`} className="chip">הבא ›</Link>
      </div>

      <div className="searchbar">
        <span className="ico">🔎</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש אמן / אולם…" aria-label="חיפוש" />
      </div>

      <div className="cats">
        <button className={`cat ${genre === "הכל" ? "active" : ""}`} onClick={() => setGenre("הכל")}>🔥 הכל</button>
        {genreChips.map((g) => (
          <button key={g.slug} className={`cat ${genre === g.slug ? "active" : ""}`} onClick={() => setGenre(g.slug)}>
            {g.emoji} {g.nameHe}
          </button>
        ))}
      </div>

      {byDay.length === 0 ? (
        <div className="card"><p className="empty">אין הופעות בחודש זה 🤷</p></div>
      ) : (
        <div className="calagenda">
          {byDay.map(([key, list]) => (
            <div key={key} className="calday">
              <div className="caldaybadge">
                <span className="d">{list[0].dayNum}</span>
                <span className="w">{list[0].weekday}</span>
              </div>
              <div className="callist">
                {list.map((s) => {
                  const price = ils(s.fromPriceAgorot);
                  return (
                    <Link key={s.id} href={`/shows/${s.id}`} className="calitem">
                      <span className="t">{s.timeStr}</span>
                      <span className="info">
                        <span className="ev">{s.eventName}</span>
                        <span className="vn">{s.venueName}{s.city ? ` · ${s.city}` : ""}</span>
                      </span>
                      <span className="pr">
                        {price ? price : <span className="muted" style={{ fontSize: 12 }}>אין כרטיסים</span>}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
