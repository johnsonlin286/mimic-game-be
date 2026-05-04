const wordsBankEn = {
  "food-drink": {
    "id": "food-drink",
    "label": "Food & Drink",
    "words": [
      { "primary": "Pancake", "secondary": "Waffle" },
      { "primary": "Ice Cream", "secondary": "Gelato" },
      { "primary": "Coffee", "secondary": "Tea" },
      { "primary": "Burger", "secondary": "Sandwich" },
      { "primary": "Sushi", "secondary": "Sashimi" }
    ]
  },
  "animals": {
    "id": "animals",
    "label": "Animals",
    "words": [
      { "primary": "Alligator", "secondary": "Crocodile" },
      { "primary": "Frog", "secondary": "Toad" },
      { "primary": "Rabbit", "secondary": "Hare" },
      { "primary": "Dolphin", "secondary": "Whale" },
      { "primary": "Bee", "secondary": "Wasp" }
    ]
  },
  "movies": {
    "id": "movies",
    "label": "Movies",
    "words": [
      { "primary": "Horror", "secondary": "Thriller" },
      { "primary": "Director", "secondary": "Producer" },
      { "primary": "Prequel", "secondary": "Sequel" },
      { "primary": "Blockbuster", "secondary": "Indie" },
      { "primary": "Actor", "secondary": "Extra" }
    ]
  },
  "places": {
    "id": "places",
    "label": "Places",
    "words": [
      { "primary": "Hospital", "secondary": "Clinic" },
      { "primary": "Hotel", "secondary": "Motel" },
      { "primary": "Ocean", "secondary": "Lake" },
      { "primary": "Supermarket", "secondary": "Grocery" },
      { "primary": "Mountain", "secondary": "Hill" }
    ]
  },
  "technology": {
    "id": "technology",
    "label": "Technology",
    "words": [
      { "primary": "Laptop", "secondary": "Desktop" },
      { "primary": "Wi-Fi", "secondary": "Bluetooth" },
      { "primary": "Robot", "secondary": "Cyborg" },
      { "primary": "Headphones", "secondary": "Earbuds" },
      { "primary": "Email", "secondary": "Text Message" }
    ]
  }
}

const wordsBankId = {
  "food-drink": {
    "id": "food-drink",
    "label": "Makanan & Minuman",
    "words": [
      { "primary": "Mie", "secondary": "Bihun" },
      { "primary": "Kari", "secondary": "Gulai" },
      { "primary": "Soto", "secondary": "Sop" },
      { "primary": "Es Krim", "secondary": "Gelato" },
      { "primary": "Kopi", "secondary": "Teh" }
    ]
  },
  "animals": {
    "id": "animals",
    "label": "Hewan",
    "words": [
      { "primary": "Penyu", "secondary": "Kura-kura" },
      { "primary": "Buaya", "secondary": "Biawak" },
      { "primary": "Kelinci", "secondary": "Marmut" },
      { "primary": "Lumba-lumba", "secondary": "Paus" },
      { "primary": "Lebah", "secondary": "Tawon" }
    ]
  },
  "movies": {
    "id": "movies",
    "label": "Film",
    "words": [
      { "primary": "Animasi", "secondary": "Kartun" },
      { "primary": "Naskah", "secondary": "Skenario" },
      { "primary": "Aktor", "secondary": "Figuran" },
      { "primary": "Komedi", "secondary": "Romantis" },
      { "primary": "Bioskop", "secondary": "Teater" }
    ]
  },
  "places": {
    "id": "places",
    "label": "Tempat",
    "words": [
      { "primary": "Restoran", "secondary": "Kafe" },
      { "primary": "Rumah Sakit", "secondary": "Klinik" },
      { "primary": "Hotel", "secondary": "Villa" },
      { "primary": "Laut", "secondary": "Danau" },
      { "primary": "Gunung", "secondary": "Bukit" }
    ]
  },
  "technology": {
    "id": "technology",
    "label": "Teknologi",
    "words": [
      { "primary": "Flashdisk", "secondary": "Hardisk" },
      { "primary": "Baterai", "secondary": "Powerbank" },
      { "primary": "Televisi", "secondary": "Proyektor" },
      { "primary": "Laptop", "secondary": "Komputer PC" },
      { "primary": "Wi-Fi", "secondary": "Bluetooth" }
    ]
  }
}

const returnWordsBank = (lang: string) => {
  return lang === "id" ? wordsBankId : wordsBankEn;
}

/** Canonical key so a pair matches regardless of majority/minority or primary/secondary order. */
function canonicalPairKey(a: string, b: string): string {
  return a <= b ? `${a}\0${b}` : `${b}\0${a}`;
}

const randomWordPair = (
  language: string,
  categoryId: string,
  usedWordPairs: WordPair[] = [],
): WordPair & { hasNoMoreWords: boolean } => {
  const wordsBank = returnWordsBank(language);
  const selectedCategory = wordsBank[categoryId as keyof typeof wordsBank] ?? wordsBank["food-drink"];
  const allWords = selectedCategory.words;

  const usedKeys = new Set(
    usedWordPairs.map(p => canonicalPairKey(p.majorityWord, p.minorityWord)),
  );
  const remaining = allWords.filter(
    w => !usedKeys.has(canonicalPairKey(w.primary, w.secondary)),
  );

  const exhausted = remaining.length === 0;
  const pool = exhausted ? allWords : remaining;
  const wordPair = pool[Math.floor(Math.random() * pool.length)];
  const primary = wordPair?.primary ?? "";
  const secondary = wordPair?.secondary ?? "";
  // 50% swap: which bank word maps to majority vs minority is random each draw.
  const [majorityWord, minorityWord] =
    Math.random() < 0.5 ? [primary, secondary] : [secondary, primary];

  return {
    majorityWord,
    minorityWord,
    hasNoMoreWords: exhausted,
  };
}

export { returnWordsBank, randomWordPair };