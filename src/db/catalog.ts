import "server-only";
import { eq, desc, asc } from "drizzle-orm";
import { db } from "./index";
import { events, venues, shows } from "./schema";

// ---------- venues ----------
export function listVenues() {
  return db.select().from(venues).orderBy(asc(venues.name));
}

export async function createVenue(input: {
  name: string;
  city?: string | null;
  address?: string | null;
  capacity?: number | null;
}) {
  const [row] = await db.insert(venues).values(input).returning();
  return row;
}

export async function deleteVenue(id: number) {
  await db.delete(venues).where(eq(venues.id, id));
}

// ---------- events ----------
export function listEvents() {
  return db.select().from(events).orderBy(asc(events.name));
}

export async function createEvent(input: {
  name: string;
  artist?: string | null;
  category?: string | null;
}) {
  const [row] = await db.insert(events).values(input).returning();
  return row;
}

export async function deleteEvent(id: number) {
  await db.delete(events).where(eq(events.id, id));
}

// ---------- shows (joined with event + venue names) ----------
export function listShows() {
  return db
    .select({
      id: shows.id,
      eventId: shows.eventId,
      venueId: shows.venueId,
      eventName: events.name,
      venueName: venues.name,
      startsAt: shows.startsAt,
      status: shows.status,
    })
    .from(shows)
    .innerJoin(events, eq(shows.eventId, events.id))
    .innerJoin(venues, eq(shows.venueId, venues.id))
    .orderBy(desc(shows.startsAt));
}

export async function createShow(input: {
  eventId: number;
  venueId: number;
  startsAt: Date;
}) {
  const [row] = await db.insert(shows).values(input).returning();
  return row;
}

export async function deleteShow(id: number) {
  await db.delete(shows).where(eq(shows.id, id));
}
