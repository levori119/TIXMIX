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

const WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

export function CalendarView({
  shows,
  year,
  month,
  monthLabel,
  prevMonth,
  nextMonth,
}: {
  shows: CalShow[];
  year: number;
  month: number; // 0-based
  monthLabel: string;
  prevMonth: string;
  nextMonth: string;
}) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("הכל");
  const [view, setView] = useState<"list" | "grid">("list");

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

  // grid: day-number -> shows
  const byDayNum = useMemo(() => {
    const map = new Map<number, CalShow[]>();
    for (const s of filtered) {
      const n = Number(s.dayNum);
      const arr = map.get(n) ?? [];
      arr.push(s);
      map.set(n, arr);
    }
    return map;
  }, [filtered]);

  const grid = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <div>
      <div className="calmonth">
        <Link href={`/calendar?month=${prevMonth}`} className="chip">‹ קודם</Link>
        <span className="calmonth-label">{monthLabel}</span>
        <Link href={`/calendar?month=${nextMonth}`} className="chip">הבא ›</Link>
      </div>

      <div className="chips" style={{ marginBottom: 14 }}>
        <button className={`chip ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>☰ רשימה</button>
        <button className={`chip ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>▦ משבצות</button>
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

      {view === "grid" ? (
        <div className="calgridwrap">
          <div className="calweekhead">
            {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
          </div>
          <div className="calgrid">
            {grid.map((d, i) => {
              if (d === null) return <div key={`e${i}`} className="calcell empty" />;
              const list = byDayNum.get(d) ?? [];
              return (
                <div key={d} className={`calcell ${isToday(d) ? "today" : ""}`}>
                  <span className="dn">{d}</span>
                  {list.slice(0, 3).map((s) => (
                    <Link key={s.id} href={`/shows/${s.id}`} className="calcell-item" title={s.eventName}>
                      {s.eventName}
                    </Link>
                  ))}
                  {list.length > 3 ? <span className="calcell-more">+{list.length - 3}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : byDay.length === 0 ? (
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
