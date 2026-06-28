import "server-only";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./index";
import {
  listings,
  listingPriceTiers,
  shows,
  events,
  venues,
} from "./schema";

export type PriceType = "at_cost" | "above_cost" | "discount";
export type DeliveryType = "physical" | "digital";

export type NewListing = {
  sellerId: number;
  showId: number;
  note?: string | null;
  priceType: PriceType;
  deliveryType: DeliveryType;
  quantityTotal: number;
  soldIndividually: boolean;
  minTicketsPerSale: number;
};

export type Tier = { minQty: number; unitPriceAgorot: number };

/** Create a listing + its price tiers atomically. */
export async function createListing(input: NewListing, tiers: Tier[]) {
  return db.transaction(async (tx) => {
    const [listing] = await tx
      .insert(listings)
      .values({
        sellerId: input.sellerId,
        showId: input.showId,
        note: input.note ?? null,
        priceType: input.priceType,
        deliveryType: input.deliveryType,
        quantityTotal: input.quantityTotal,
        quantityAvailable: input.quantityTotal,
        soldIndividually: input.soldIndividually,
        minTicketsPerSale: input.minTicketsPerSale,
      })
      .returning();

    if (tiers.length > 0) {
      await tx.insert(listingPriceTiers).values(
        tiers.map((t) => ({
          listingId: listing.id,
          minQty: t.minQty,
          unitPriceAgorot: t.unitPriceAgorot,
        })),
      );
    }
    return listing;
  });
}

/** List listings with show/event/venue names and the qty-1 base price. */
export function listListings() {
  return db
    .select({
      id: listings.id,
      eventName: events.name,
      venueName: venues.name,
      startsAt: shows.startsAt,
      priceType: listings.priceType,
      deliveryType: listings.deliveryType,
      quantityTotal: listings.quantityTotal,
      quantityAvailable: listings.quantityAvailable,
      soldIndividually: listings.soldIndividually,
      minTicketsPerSale: listings.minTicketsPerSale,
      status: listings.status,
      basePriceAgorot: listingPriceTiers.unitPriceAgorot,
    })
    .from(listings)
    .innerJoin(shows, eq(listings.showId, shows.id))
    .innerJoin(events, eq(shows.eventId, events.id))
    .innerJoin(venues, eq(shows.venueId, venues.id))
    .leftJoin(
      listingPriceTiers,
      and(
        eq(listingPriceTiers.listingId, listings.id),
        eq(listingPriceTiers.minQty, 1),
      ),
    )
    .orderBy(desc(listings.createdAt));
}

/** Return all tiers for a listing, sorted by min quantity. */
export function listTiers(listingId: number) {
  return db
    .select()
    .from(listingPriceTiers)
    .where(eq(listingPriceTiers.listingId, listingId));
}

export async function deleteListing(id: number) {
  await db.transaction(async (tx) => {
    await tx.delete(listingPriceTiers).where(eq(listingPriceTiers.listingId, id));
    await tx.delete(listings).where(eq(listings.id, id));
  });
}
