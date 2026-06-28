"use server";

import { revalidatePath } from "next/cache";
import { createVenue, deleteVenue } from "@/db/catalog";

export type FormState = { ok: boolean; message: string };

export async function createVenueAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "שם האולם חובה." };

  const city = String(formData.get("city") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const capRaw = String(formData.get("capacity") ?? "").trim();
  const capacity = capRaw ? Number(capRaw) : null;
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 0)) {
    return { ok: false, message: "קיבולת חייבת להיות מספר שלם אי-שלילי." };
  }

  await createVenue({ name, city, address, capacity });
  revalidatePath("/admin/venues");
  return { ok: true, message: `האולם "${name}" נוסף ✓` };
}

export async function deleteVenueAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await deleteVenue(id);
    revalidatePath("/admin/venues");
  }
}
