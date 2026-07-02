// Spotify deprecated artist `genres` (empty for new apps since 2025), but artist
// NAMES are still returned. We derive genres from names: match against our own
// events catalog (see affinity.ts) + this curated map of popular artists.

export function normalizeArtist(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

// normalized name -> our genre slugs
export const STAR_ARTISTS: Record<string, string[]> = {
  // Israeli — mizrahi / pop
  "עומר אדם": ["mizrahi", "pop"], "omer adam": ["mizrahi", "pop"],
  "אייל גולן": ["mizrahi"], "eyal golan": ["mizrahi"],
  "משה פרץ": ["mizrahi"], "moshe peretz": ["mizrahi"],
  "שרית חדד": ["mizrahi"], "sarit hadad": ["mizrahi"],
  "עדן בן זקן": ["mizrahi"], "eden ben zaken": ["mizrahi"],
  "אושר כהן": ["mizrahi"], "osher cohen": ["mizrahi"],
  "שלומי שבת": ["mizrahi", "pop"],
  "נסרין קדרי": ["mizrahi"],
  // Israeli — pop / rock
  "נועה קירל": ["pop"], "noa kirel": ["pop"],
  "סטטיק ובן אל תבורי": ["pop", "hiphop"], "static & ben el": ["pop", "hiphop"], "static & ben el tavori": ["pop", "hiphop"],
  "אניה בוקשטיין": ["pop"],
  "שלמה ארצי": ["rock", "pop"], "shlomo artzi": ["rock", "pop"],
  "אביב גפן": ["rock"], "aviv geffen": ["rock"],
  "שלום חנוך": ["rock"], "כוורת": ["rock"], "משינה": ["rock"], "mashina": ["rock"],
  "אתניקס": ["rock", "mizrahi"], "יהודה פוליקר": ["rock", "world"],
  "דודו טסה": ["rock", "world"], "ברי סחרוף": ["rock"], "אהוד בנאי": ["rock", "folk"],
  "מוניקה סקס": ["rock"], "קפה שחור חזק": ["rock"], "היהודים": ["rock"],
  // Israeli — hip hop
  "הדג נחש": ["hiphop"], "hadag nahash": ["hiphop"],
  "טונה": ["hiphop"], "tuna": ["hiphop"], "פלד": ["hiphop"], "peled": ["hiphop"],
  "רביד פלוטניק": ["hiphop"], "נצ'י נצ'": ["hiphop"], "נועה קירל ": ["pop"],
  "עדן חסון": ["mizrahi", "pop"], "eden hason": ["mizrahi", "pop"],
  // Israeli — world / folk
  "עידן רייכל": ["world", "folk"], "idan raichel": ["world", "folk"],
  "אברהם טל": ["pop", "rock"], "ריטה": ["pop"], "רמי קלינשטיין": ["pop"],
  // Global — pop
  "ed sheeran": ["pop"], "taylor swift": ["pop"], "dua lipa": ["pop", "electronic"],
  "billie eilish": ["pop"], "ariana grande": ["pop"], "justin bieber": ["pop"],
  "coldplay": ["rock", "pop"], "imagine dragons": ["rock", "pop"], "maroon 5": ["pop"],
  // Global — hip hop / r&b
  "drake": ["hiphop"], "eminem": ["hiphop"], "kendrick lamar": ["hiphop"],
  "travis scott": ["hiphop"], "kanye west": ["hiphop"], "post malone": ["hiphop", "pop"],
  "the weeknd": ["rnb", "pop"], "beyonce": ["rnb", "pop"], "beyoncé": ["rnb", "pop"],
  "rihanna": ["pop", "rnb"], "sza": ["rnb"], "bruno mars": ["rnb", "pop"],
  // Global — rock / metal
  "metallica": ["metal"], "iron maiden": ["metal"], "system of a down": ["metal"],
  "queen": ["rock"], "ac/dc": ["rock"], "guns n' roses": ["rock"], "nirvana": ["rock"],
  "red hot chili peppers": ["rock"], "arctic monkeys": ["rock", "indie"], "radiohead": ["rock", "indie"],
  "pink floyd": ["rock"], "the beatles": ["rock"],
  // Global — electronic / jazz
  "david guetta": ["electronic"], "calvin harris": ["electronic"], "avicii": ["electronic"],
  "martin garrix": ["electronic"], "daft punk": ["electronic"], "the chainsmokers": ["electronic", "pop"],
  "miles davis": ["jazz"], "john coltrane": ["jazz"], "louis armstrong": ["jazz"],
  "bob marley": ["world"],
};
