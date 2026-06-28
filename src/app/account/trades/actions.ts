"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { payForTrade, confirmTrade, EscrowError } from "@/db/escrow";

async function run(
  formData: FormData,
  fn: (tradeId: number, actorId: number) => Promise<void>,
): Promise<never> {
  const user = await currentUser();
  if (!user) redirect("/login");
  const id = Number(formData.get("id"));
  try {
    await fn(id, user.id);
  } catch (e) {
    const msg = e instanceof EscrowError ? e.message : "הפעולה נכשלה.";
    redirect(`/account/trades?err=${encodeURIComponent(msg)}`);
  }
  redirect("/account/trades?ok=1");
}

export async function payAction(formData: FormData) {
  return run(formData, payForTrade);
}
export async function confirmAction(formData: FormData) {
  return run(formData, confirmTrade);
}
