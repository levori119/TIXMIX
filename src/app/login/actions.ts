"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession } from "@/lib/auth";

export type LoginState = { error: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "יש למלא אימייל וסיסמה." };
  }

  const user = await authenticate(email, password);
  if (!user) {
    return { error: "אימייל או סיסמה שגויים." };
  }
  if (user.role !== "admin") {
    return { error: "למשתמש זה אין הרשאת ניהול." };
  }

  await createSession(user.id, user.role);
  redirect("/admin/settings");
}
