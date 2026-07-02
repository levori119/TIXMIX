"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/browse", icon: "🎟️", label: "גלה" },
  { href: "/calendar", icon: "📅", label: "יומן" },
  { href: "/sell", icon: "➕", label: "מכירה" },
  { href: "/account", icon: "👤", label: "חשבון" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="tabbar" aria-label="ניווט תחתון">
      <div className="tabbar-inner">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link key={t.href} href={t.href} className={active ? "active" : ""}>
              <span className="ti">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
