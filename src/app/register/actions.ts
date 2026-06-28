"use server";

import { redirect } from "next/navigation";
import { registerClient, createSession } from "@/lib/auth";

export type RegisterState = { error: string };

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "יש להזין שם." };
  if (!email || !email.includes("@")) return { error: "אימייל לא תקין." };
  if (password.length < 6) return { error: "הסיסמה חייבת להכיל לפחות 6 תווים." };

  let user;
  try {
    user = await registerClient(email, password, name);
  } catch {
    return { error: "האימייל כבר רשום. נסה להתחבר." };
  }

  await createSession(user.id, user.role);
  redirect("/browse");
}
