"use client";

import { useActionState, useEffect, useRef } from "react";
import { createVenueAction, type FormState } from "./actions";

const initial: FormState = { ok: false, message: "" };

export function VenueForm() {
  const [state, action, pending] = useActionState(createVenueAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form action={action} ref={formRef}>
      <p className="section-title">הוספת אולם</p>
      <div className="grid-2">
        <div className="row">
          <label className="label" htmlFor="v-name">שם האולם *</label>
          <input className="input" id="v-name" name="name" required />
        </div>
        <div className="row">
          <label className="label" htmlFor="v-city">עיר</label>
          <input className="input" id="v-city" name="city" />
        </div>
        <div className="row">
          <label className="label" htmlFor="v-address">כתובת</label>
          <input className="input" id="v-address" name="address" />
        </div>
        <div className="row">
          <label className="label" htmlFor="v-cap">קיבולת</label>
          <input className="input" id="v-cap" name="capacity" type="number" min="0" />
        </div>
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "מוסיף…" : "➕ הוספת אולם"}
      </button>
      {state.message ? (
        <div className={`notice ${state.ok ? "ok" : "err"}`} role="status">
          {state.ok ? "✓" : "⚠"} {state.message}
        </div>
      ) : null}
    </form>
  );
}
