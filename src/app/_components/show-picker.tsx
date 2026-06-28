"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ShowOption } from "@/lib/show-options";

export type { ShowOption };

export function ShowPicker({
  name = "showId",
  shows,
  placeholder = "בחר מופע…",
}: {
  name?: string;
  shows: ShowOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<ShowOption | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return shows.filter((s) => {
      if (date && s.dateKey !== date) return false;
      if (needle && !`${s.eventName} ${s.venueName}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [shows, q, date]);

  return (
    <div className="picker" ref={ref}>
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <button
        type="button"
        className="input picker-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <span>
            <strong>{selected.eventName}</strong>
            <span className="muted"> · {selected.venueName} · {selected.dateDisplay}</span>
          </span>
        ) : (
          <span className="muted">{placeholder}</span>
        )}
        <span className="picker-caret">▾</span>
      </button>

      {open ? (
        <div className="picker-pop" role="listbox">
          <div className="picker-filters">
            <input
              className="input"
              placeholder="🔎 חיפוש לפי שם אמן או אולם…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              title="סינון לפי תאריך"
            />
            {date || q ? (
              <button
                type="button"
                className="chip"
                onClick={() => {
                  setQ("");
                  setDate("");
                }}
              >
                ניקוי
              </button>
            ) : null}
          </div>

          <div className="picker-list">
            {filtered.length === 0 ? (
              <div className="empty">לא נמצאו מופעים תואמים</div>
            ) : (
              filtered.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className="picker-item"
                  onClick={() => {
                    setSelected(s);
                    setOpen(false);
                  }}
                >
                  <span className="title">{s.eventName}</span>
                  <span className="sub">{s.venueName} · {s.dateDisplay}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
