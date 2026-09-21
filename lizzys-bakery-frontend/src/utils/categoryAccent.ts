// Gives each menu category its own colour so the menu grid reads like a
// bakery display case instead of a wall of identical pink cards. Curated
// matches for the categories the bakery actually promotes; any other
// category name (the baker can add her own) falls back to a deterministic
// pick from the same palette, so it's always one of these four, never
// unstyled.
export interface CategoryAccent {
  border: string; // border-t-4 accent on a product card
  // Pale tint, always paired with text-bakery-brown — every one of these
  // clears WCAG AA against dark brown text, which a solid/saturated
  // version of the same colour would not against white text.
  chipBg: string;
}

const PALETTE: CategoryAccent[] = [
  { border: 'border-bakery-pink-dark', chipBg: 'bg-bakery-pink/15' },
  { border: 'border-bakery-gold', chipBg: 'bg-bakery-gold-light' },
  { border: 'border-bakery-mint', chipBg: 'bg-bakery-mint-light' },
  { border: 'border-bakery-lavender', chipBg: 'bg-bakery-lavender-light' },
];

const CURATED: Record<string, number> = {
  'wedding cakes': 3, // lavender — bridal
  'birthday cakes': 1, // gold — celebratory
  'cupcakes': 0, // pink — the brand colour for the everyday favourite
  'graduation cakes': 2, // mint — fresh start
  'muffins & pastries': 1, // gold — warm, baked
  'coffee & beverages': 2, // mint — cool drinks alongside the warm bakes
};

function hashIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length;
  }
  return hash;
}

export default function categoryAccent(categoryName: string): CategoryAccent {
  const key = categoryName.trim().toLowerCase();
  const index = key in CURATED ? CURATED[key] : hashIndex(key);
  return PALETTE[index];
}
