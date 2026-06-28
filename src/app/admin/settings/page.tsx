import { getSettings } from "@/db/settings";
import { CommissionForm } from "./commission-form";

// Always read fresh from the DB (config screen).
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  const percent = settings.commissionBps / 100;
  const fixedIls = settings.commissionFixedAgorot / 100;

  return (
    <main className="container narrow">
      <div className="page-head">
        <span className="crumb">ניהול / הגדרות</span>
        <h1 className="page-title">עמלת המערכת 💸</h1>
      </div>

      <div className="card">
        <span className="muted">העמלה הפעילה כעת</span>
        <div className="stat">
          <span className="num">{percent}</span>
          <span className="unit">%</span>
          {fixedIls > 0 ? <span className="unit">+ ₪{fixedIls}</span> : null}
        </div>

        <div style={{ height: 18 }} />

        <CommissionForm defaultPercent={percent} defaultFixedIls={fixedIls} />

        <p className="hint" style={{ marginTop: 22 }}>
          עודכן לאחרונה: {new Date(settings.updatedAt).toLocaleString("he-IL")}
        </p>
      </div>

      <div className="warnbar">
        ⚠️ מסך זה עדיין אינו מוגן בהרשאות — הוספת אימות אדמין היא המשימה הבאה (CLAUDE.md §8).
      </div>
    </main>
  );
}
