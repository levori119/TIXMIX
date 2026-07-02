"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { error: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction}>
      <div className="row">
        <label className="label" htmlFor="email">
          אימייל או שם משתמש
        </label>
        <input
          className="input"
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
        />
      </div>

      <div className="row">
        <label className="label" htmlFor="password">
          סיסמה
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          required
        />
      </div>

      <button className="btn" type="submit" disabled={pending} style={{ width: "100%", justifyContent: "center" }}>
        {pending ? "מתחבר…" : "🔐 כניסה"}
      </button>

      {state.error ? (
        <div className="notice err" role="alert">
          ⚠ {state.error}
        </div>
      ) : null}
    </form>
  );
}
