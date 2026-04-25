const wordsBankEn = {
  "food-drink": {
    "id": "food-drink",
    "label": "Food & Drink",
    "words": [
      { "original": "Pancake", "mimic": "Waffle" },
      { "original": "Ice Cream", "mimic": "Gelato" },
      { "original": "Coffee", "mimic": "Tea" },
      { "original": "Burger", "mimic": "Sandwich" },
      { "original": "Sushi", "mimic": "Sashimi" }
    ]
  },
  "animals": {
    "id": "animals",
    "label": "Animals",
    "words": [
      { "original": "Alligator", "mimic": "Crocodile" },
      { "original": "Frog", "mimic": "Toad" },
      { "original": "Rabbit", "mimic": "Hare" },
      { "original": "Dolphin", "mimic": "Whale" },
      { "original": "Bee", "mimic": "Wasp" }
    ]
  },
  "movies": {
    "id": "movies",
    "label": "Movies",
    "words": [
      { "original": "Horror", "mimic": "Thriller" },
      { "original": "Director", "mimic": "Producer" },
      { "original": "Prequel", "mimic": "Sequel" },
      { "original": "Blockbuster", "mimic": "Indie" },
      { "original": "Actor", "mimic": "Extra" }
    ]
  },
  "places": {
    "id": "places",
    "label": "Places",
    "words": [
      { "original": "Hospital", "mimic": "Clinic" },
      { "original": "Hotel", "mimic": "Motel" },
      { "original": "Ocean", "mimic": "Lake" },
      { "original": "Supermarket", "mimic": "Grocery" },
      { "original": "Mountain", "mimic": "Hill" }
    ]
  },
  "technology": {
    "id": "technology",
    "label": "Technology",
    "words": [
      { "original": "Laptop", "mimic": "Desktop" },
      { "original": "Wi-Fi", "mimic": "Bluetooth" },
      { "original": "Robot", "mimic": "Cyborg" },
      { "original": "Headphones", "mimic": "Earbuds" },
      { "original": "Email", "mimic": "Text Message" }
    ]
  }
}

const wordsBankId = {
  "food-drink": {
    "id": "food-drink",
    "label": "Makanan & Minuman",
    "words": [
      { "original": "Mie", "mimic": "Bihun" },
      { "original": "Kari", "mimic": "Gulai" },
      { "original": "Soto", "mimic": "Sop" },
      { "original": "Es Krim", "mimic": "Gelato" },
      { "original": "Kopi", "mimic": "Teh" }
    ]
  },
  "animals": {
    "id": "animals",
    "label": "Hewan",
    "words": [
      { "original": "Penyu", "mimic": "Kura-kura" },
      { "original": "Buaya", "mimic": "Biawak" },
      { "original": "Kelinci", "mimic": "Marmut" },
      { "original": "Lumba-lumba", "mimic": "Paus" },
      { "original": "Lebah", "mimic": "Tawon" }
    ]
  },
  "movies": {
    "id": "movies",
    "label": "Film",
    "words": [
      { "original": "Animasi", "mimic": "Kartun" },
      { "original": "Naskah", "mimic": "Skenario" },
      { "original": "Aktor", "mimic": "Figuran" },
      { "original": "Komedi", "mimic": "Romantis" },
      { "original": "Bioskop", "mimic": "Teater" }
    ]
  },
  "places": {
    "id": "places",
    "label": "Tempat",
    "words": [
      { "original": "Restoran", "mimic": "Kafe" },
      { "original": "Rumah Sakit", "mimic": "Klinik" },
      { "original": "Hotel", "mimic": "Villa" },
      { "original": "Laut", "mimic": "Danau" },
      { "original": "Gunung", "mimic": "Bukit" }
    ]
  },
  "technology": {
    "id": "technology",
    "label": "Teknologi",
    "words": [
      { "original": "Flashdisk", "mimic": "Hardisk" },
      { "original": "Baterai", "mimic": "Powerbank" },
      { "original": "Televisi", "mimic": "Proyektor" },
      { "original": "Laptop", "mimic": "Komputer PC" },
      { "original": "Wi-Fi", "mimic": "Bluetooth" }
    ]
  }
}

const returnWordsBank = (lang: string) => {
  switch (lang) {
    case "en":
      return wordsBankEn;
    case "id":
      return wordsBankId;
    default:
      return wordsBankEn;
  }
}

const randomWordPair = (language: string, categoryId: string, usedWordPairs?: WordPair[]) => {
  const wordsBank = returnWordsBank(language);
  const selectedCategory = wordsBank[categoryId as keyof typeof wordsBank];
  let wordsArray = selectedCategory.words;
  if (usedWordPairs) {
    // remove usedWordPairs from wordsBank array
    wordsArray = wordsArray.filter(wordPair => !usedWordPairs.some(usedWordPair => usedWordPair.originalWord === wordPair.original && usedWordPair.mimicWord === wordPair.mimic));
  }
  console.log(usedWordPairs)
  console.log(wordsArray)
  let hasNoMoreWords = false;
  if (wordsArray.length === 0) {
    wordsArray = selectedCategory.words;
    hasNoMoreWords = true;
  }
  const randomIndex = Math.floor(Math.random() * wordsArray.length);
  const wordPair = wordsArray[randomIndex];
  console.log("wordPair", wordPair);
  return {
    originalWord: wordPair?.original || '',
    mimicWord: wordPair?.mimic || '',
    hasNoMoreWords,
  }
}

export { returnWordsBank, randomWordPair };