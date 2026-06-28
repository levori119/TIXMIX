"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { deliverTrade, refundTrade, EscrowError } from "@/db/escrow";

async function run(
  formData: FormData,
  fn: (tradeId: number, actorId: number) => Promise<void>,
): Promise<never> {
  const user = await currentUser();
  if (!user || user.role !== "admin") redirect("/login");
  const id = Number(formData.get("id"));
  try {
    await fn(id, user.id);
  } catch (e) {
    const msg = e instanceof EscrowError ? e.message : "הפעולה נכשלה.";
    redirect(`/admin/trades?err=${encodeURIComponent(msg)}`);
  }
  redirect("/admin/trades?ok=1");
}

export async function deliverAction(formData: FormData) {
  return run(formData, deliverTrade);
}
export async function refundAction(formData: FormData) {
  return run(formData, refundTrade);
}
