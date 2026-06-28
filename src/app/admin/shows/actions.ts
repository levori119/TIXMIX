"use server";

import { revalidatePath } from "next/cache";
import { createShow, deleteShow } from "@/db/catalog";

export type FormState = { ok: boolean; message: string };

export async function createShowAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const eventId = Number(formData.get("eventId"));
  const venueId = Number(formData.get("venueId"));
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();

  if (!Number.isInteger(eventId) || !Number.isInteger(venueId)) {
    return { ok: false, message: "יש לבחור הופעה ואולם." };
  }
  if (!startsAtRaw) {
    return { ok: false, message: "יש לבחור תאריך ושעה." };
  }
  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false, message: "תאריך לא תקין." };
  }

  await createShow({ eventId, venueId, startsAt });
  revalidatePath("/admin/shows");
  return { ok: true, message: "המופע נוסף ✓" };
}

export async function deleteShowAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await deleteShow(id);
    revalidatePath("/admin/shows");
  }
}
