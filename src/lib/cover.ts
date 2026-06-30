// Deterministic, colorful cover art derived from a name — gives every show a
// distinct vibrant gradient + initial (authentic feel, no stock imagery).

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function coverGradient(name: string): string {
  const h1 = hash(name) % 360;
  const h2 = (h1 + 55) % 360;
  return `linear-gradient(135deg, hsl(${h1} 80% 58%), hsl(${h2} 75% 42%))`;
}

export function initialOf(name: string): string {
  const t = (name || "").trim();
  return t ? t[0] : "🎵";
}
