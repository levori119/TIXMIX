"use client";

import { useActionState, useState } from "react";
import { updateCommissionAction, type ActionState } from "./actions";

const initial: ActionState = { ok: false, message: "" };
const PRESETS = [1, 2.5, 5, 7.5];
const SAMPLE = 200; // ₪ sample transaction for the live preview

export function CommissionForm({
  defaultPercent,
  defaultFixedIls,
}: {
  defaultPercent: number;
  defaultFixedIls: number;
}) {
  const [state, formAction, pending] = useActionState(updateCommissionAction, initial);
  const [percent, setPercent] = useState(defaultPercent);
  const [fixed, setFixed] = useState(defaultFixedIls);

  const fee = (SAMPLE * percent) / 100 + fixed;

  return (
    <form action={formAction}>
      <div className="row">
        <label className="label" htmlFor="commissionPercent">
          אחוז עמלה
        </label>
        <input
          className="input"
          id="commissionPercent"
          name="commissionPercent"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={percent}
          onChange={(e) => setPercent(Number(e.target.value))}
          required
        />
        <div className="chips">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className={`chip ${percent === p ? "active" : ""}`}
              onClick={() => setPercent(p)}
            >
              {p}%
            </button>
          ))}
        </div>
        <p className="hint">אחוז שנגבה מכל עסקה (כולל עמלת הסליקה).</p>
      </div>

      <div className="row">
        <label className="label" htmlFor="commissionFixedIls">
          עמלה קבועה (₪)
        </label>
        <input
          className="input"
          id="commissionFixedIls"
          name="commissionFixedIls"
          type="number"
          step="0.01"
          min="0"
          value={fixed}
          onChange={(e) => setFixed(Number(e.target.value))}
        />
        <p className="hint">תוספת קבועה בשקלים לכל עסקה (0 = אין).</p>
      </div>

      <div className="preview">
        <span className="k">דוגמה: עסקה של ₪{SAMPLE} →</span>
        <span className="v">
          עמלה ₪{Number.isFinite(fee) ? fee.toFixed(2) : "0.00"}
        </span>
      </div>

      <div style={{ marginTop: 22 }}>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "שומר…" : "💾 שמירת עמלה"}
        </button>
      </div>

      {state.message ? (
        <div className={`notice ${state.ok ? "ok" : "err"}`} role="status">
          {state.ok ? "✓" : "⚠"} {state.message}
        </div>
      ) : null}
    </form>
  );
}
