import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { bumpAffinityBySlugs, bumpAffinityByArtistNames } from "@/db/affinity";
import { exchangeCode, getSpotifyTaste, mapGenresToSlugCounts, redirectUri, originOf } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = originOf(req);
  const done = (status: string) => NextResponse.redirect(`${origin}/account?spotify=${status}`);

  const session = await getSession();
  if (!session) return NextResponse.redirect(`${origin}/login`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieState = req.headers.get("cookie")?.match(/sp_state=([^;]+)/)?.[1];

  if (error) return done("denied");
  if (!code || !state || !cookieState || state !== cookieState) return done("state");

  try {
    const token = await exchangeCode(code, redirectUri(req));
    const taste = await getSpotifyTaste(token);

    // 1) if Spotify returned genres, use them; 2) always also derive from names
    const genreTouched = await bumpAffinityBySlugs(session.uid, mapGenresToSlugCounts(taste.genres));
    const byName = await bumpAffinityByArtistNames(session.uid, taste.artistNames);
    const touched = genreTouched + byName.genresTouched;

    await db.insert(auditLog).values({
      actorId: session.uid,
      action: "spotify_import",
      entity: "user",
      entityId: String(session.uid),
      payload: {
        artists: taste.artistCount,
        tracks: taste.trackCount,
        spotifyGenres: taste.genres.length,
        namedArtists: taste.artistNames.length,
        matchedArtists: byName.matchedArtists,
        genresTouched: touched,
        sample: taste.artistNames.slice(0, 12),
      },
    });

    const res = done(touched > 0 ? "ok" : "empty");
    res.cookies.delete("sp_state");
    return res;
  } catch (e) {
    console.error("spotify callback failed", e);
    return done("error");
  }
}
