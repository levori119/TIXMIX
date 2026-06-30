"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { coverGradient, initialOf } from "@/lib/cover";

export type BrowseShow = {
  id: number;
  eventName: string;
  venueName: string;
  city: string | null;
  day: string; // "29"
  month: string; // "יוני"
  dateDisplay: string;
  fromPriceAgorot: number | null;
  available: number;
};

function ils(a: number | null) {
  return a == null ? null : `₪${Math.round(a / 100).toLocaleString("he-IL")}`;
}

export function BrowseClient({ shows }: { shows: BrowseShow[] }) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("הכל");

  const cities = useMemo(() => {
    const set = new Set<string>();
    shows.forEach((s) => s.city && set.add(s.city));
    return ["הכל", ...Array.from(set)];
  }, [shows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return shows.filter((s) => {
      if (city !== "הכל" && s.city !== city) return false;
      if (needle && !`${s.eventName} ${s.venueName}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [shows, q, city]);

  return (
    <>
      <div className="searchbar">
        <span className="ico">🔎</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש אמן, הופעה או אולם…"
          aria-label="חיפוש"
        />
      </div>

      <div className="cats">
        {cities.map((c) => (
          <button
            key={c}
            className={`cat ${city === c ? "active" : ""}`}
            onClick={() => setCity(c)}
          >
            {c === "הכל" ? "🔥 הכל" : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <p className="empty">לא נמצאו הופעות תואמות 🤷</p>
        </div>
      ) : (
        <div className="bento">
          {filtered.map((s) => {
            const price = ils(s.fromPriceAgorot);
            return (
              <Link key={s.id} href={`/shows/${s.id}`} className="scard">
                <div className="cover" style={{ background: coverGradient(s.eventName) }}>
                  <span className="ini">{initialOf(s.eventName)}</span>
                  <span className="datechip">
                    <span className="d">{s.day}</span>
                    <br />
                    <span className="m">{s.month}</span>
                  </span>
                  {s.available > 0 ? null : <span className="soldout">אזל</span>}
                </div>
                <div className="body">
                  <span className="ev">{s.eventName}</span>
                  <span className="vn">
                    {s.venueName}
                    {s.city ? ` · ${s.city}` : ""}
                  </span>
                  <div className="foot">
                    {price ? (
                      <span className="from">
                        {price} <small>החל מ-</small>
                      </span>
                    ) : (
                      <span className="none">אין כרטיסים כרגע</span>
                    )}
                    {s.available > 0 ? (
                      <span className="muted" style={{ fontSize: 12 }}>{s.available} כרט'</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
