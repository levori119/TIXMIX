"use client";

import { useActionState } from "react";
import { registerAction, type RegisterState } from "./actions";

const initial: RegisterState = { error: "" };

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <form action={action}>
      <div className="row">
        <label className="label" htmlFor="name">שם מלא</label>
        <input className="input" id="name" name="name" autoComplete="name" required />
      </div>
      <div className="row">
        <label className="label" htmlFor="email">אימייל</label>
        <input className="input" id="email" name="email" type="email" autoComplete="username" dir="ltr" required />
      </div>
      <div className="row">
        <label className="label" htmlFor="password">סיסמה (6+ תווים)</label>
        <input className="input" id="password" name="password" type="password" autoComplete="new-password" dir="ltr" minLength={6} required />
      </div>
      <button className="btn" type="submit" disabled={pending} style={{ width: "100%", justifyContent: "center" }}>
        {pending ? "נרשם…" : "✨ הרשמה"}
      </button>
      {state.error ? (
        <div className="notice err" role="alert">⚠ {state.error}</div>
      ) : null}
    </form>
  );
}
