"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { href: "/admin/settings", label: "עמלה 💸" },
  { href: "/admin/venues", label: "אולמות 🏟️" },
  { href: "/admin/events", label: "הופעות 🎤" },
  { href: "/admin/shows", label: "מופעים 📅" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="subnav">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`chip ${pathname === t.href ? "active" : ""}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
