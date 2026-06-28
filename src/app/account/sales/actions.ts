"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { deliverTrade, EscrowError } from "@/db/escrow";

export async function deliverAction(formData: FormData): Promise<never> {
  const user = await currentUser();
  if (!user) redirect("/login");
  const id = Number(formData.get("id"));
  try {
    await deliverTrade(id, user.id);
  } catch (e) {
    const msg = e instanceof EscrowError ? e.message : "הפעולה נכשלה.";
    redirect(`/account/sales?err=${encodeURIComponent(msg)}`);
  }
  redirect("/account/sales?ok=1");
}
