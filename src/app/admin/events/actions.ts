"use server";

import { revalidatePath } from "next/cache";
import { createEvent, deleteEvent } from "@/db/catalog";

export type FormState = { ok: boolean; message: string };

export async function createEventAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "שם ההופעה חובה." };

  const artist = String(formData.get("artist") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;

  await createEvent({ name, artist, category });
  revalidatePath("/admin/events");
  return { ok: true, message: `ההופעה "${name}" נוספה ✓` };
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await deleteEvent(id);
    revalidatePath("/admin/events");
  }
}
