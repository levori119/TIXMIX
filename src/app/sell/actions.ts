"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { parseListingForm } from "@/lib/listing-input";
import { createListing } from "@/db/listings";
import { runMatcherForShow } from "@/db/matching";

export type ListingFormState = { ok: boolean; message: string };

export async function createMyListingAction(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await currentUser();
  if (!user) return { ok: false, message: "יש להתחבר כדי למכור כרטיס." };

  const parsed = parseListingForm(formData);
  if (!parsed.ok) return { ok: false, message: parsed.error };
  const { tiers, ...listing } = parsed.data;

  await createListing({ sellerId: user.id, ...listing }, tiers);
  // waiting buyers in the FCFS queue may grab this immediately
  await runMatcherForShow(listing.showId);

  revalidatePath("/account/listings");
  return { ok: true, message: "הכרטיס פורסם למכירה! 🎉 עקוב ב\"הכרטיסים שלי\"." };
}
