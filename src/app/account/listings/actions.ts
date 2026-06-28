"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { cancelListing } from "@/db/listings";

export async function cancelListingAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await cancelListing(id, user.id);
    revalidatePath("/account/listings");
  }
}
