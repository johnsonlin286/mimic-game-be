"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomWordPair = exports.returnWordsBank = void 0;
const wordsBankEn = {
    "food-drink": {
        "id": "food-drink",
        "label": "Food & Drink",
        "words": [
            { "primary": "Pancake", "secondary": "Waffle" },
            { "primary": "Ice Cream", "secondary": "Gelato" },
            { "primary": "Coffee", "secondary": "Tea" },
            { "primary": "Burger", "secondary": "Sandwich" },
            { "primary": "Sushi", "secondary": "Sashimi" },
            { "primary": "Pizza", "secondary": "Calzone" },
            { "primary": "Spaghetti", "secondary": "Noodles" },
            { "primary": "Soup", "secondary": "Stew" },
            { "primary": "Butter", "secondary": "Margarine" },
            { "primary": "Beer", "secondary": "Cider" },
            { "primary": "Muffin", "secondary": "Cupcake" },
            { "primary": "Sausage", "secondary": "Hot Dog" },
            { "primary": "Yogurt", "secondary": "Pudding" },
            { "primary": "Lemonade", "secondary": "Juice" },
            { "primary": "Tortilla", "secondary": "Pita" },
            { "primary": "Chocolate", "secondary": "Caramel" },
            { "primary": "Biscuit", "secondary": "Cookie" },
            { "primary": "Bacon", "secondary": "Ham" },
            { "primary": "Ketchup", "secondary": "Mustard" },
            { "primary": "Apple", "secondary": "Pear" }
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
            { "primary": "Bee", "secondary": "Wasp" },
            { "primary": "Turtle", "secondary": "Tortoise" },
            { "primary": "Mouse", "secondary": "Rat" },
            { "primary": "Cheetah", "secondary": "Leopard" },
            { "primary": "Moth", "secondary": "Butterfly" },
            { "primary": "Seal", "secondary": "Walrus" },
            { "primary": "Alpaca", "secondary": "Llama" },
            { "primary": "Monkey", "secondary": "Ape" },
            { "primary": "Sheep", "secondary": "Goat" },
            { "primary": "Donkey", "secondary": "Mule" },
            { "primary": "Ostrich", "secondary": "Emu" },
            { "primary": "Lizard", "secondary": "Salamander" },
            { "primary": "Ant", "secondary": "Termite" },
            { "primary": "Penguin", "secondary": "Puffin" },
            { "primary": "Crow", "secondary": "Raven" },
            { "primary": "Squid", "secondary": "Octopus" }
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
            { "primary": "Actor", "secondary": "Extra" },
            { "primary": "Comedy", "secondary": "Drama" },
            { "primary": "Cinema", "secondary": "Theater" },
            { "primary": "Screenplay", "secondary": "Script" },
            { "primary": "Subtitles", "secondary": "Dubbing" },
            { "primary": "Protagonist", "secondary": "Antagonist" },
            { "primary": "Stuntman", "secondary": "Double" },
            { "primary": "Audition", "secondary": "Casting" },
            { "primary": "Ticket", "secondary": "Pass" },
            { "primary": "Cameo", "secondary": "Appearance" },
            { "primary": "Trilogy", "secondary": "Saga" },
            { "primary": "Animation", "secondary": "Live-Action" },
            { "primary": "Trailer", "secondary": "Teaser" },
            { "primary": "Review", "secondary": "Critique" },
            { "primary": "Spinoff", "secondary": "Reboot" },
            { "primary": "Premiere", "secondary": "Screening" }
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
            { "primary": "Mountain", "secondary": "Hill" },
            { "primary": "Library", "secondary": "Bookstore" },
            { "primary": "Museum", "secondary": "Gallery" },
            { "primary": "Airport", "secondary": "Station" },
            { "primary": "Desert", "secondary": "Tundra" },
            { "primary": "Village", "secondary": "Town" },
            { "primary": "Castle", "secondary": "Palace" },
            { "primary": "Stadium", "secondary": "Arena" },
            { "primary": "Forest", "secondary": "Jungle" },
            { "primary": "River", "secondary": "Canal" },
            { "primary": "Pharmacy", "secondary": "Dispensary" },
            { "primary": "Bakery", "secondary": "Cafe" },
            { "primary": "Gym", "secondary": "Spa" },
            { "primary": "Island", "secondary": "Peninsula" },
            { "primary": "Apartment", "secondary": "Condo" },
            { "primary": "Highway", "secondary": "Boulevard" }
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
            { "primary": "Email", "secondary": "Text Message" },
            { "primary": "Smartphone", "secondary": "Tablet" },
            { "primary": "Keyboard", "secondary": "Mouse" },
            { "primary": "Monitor", "secondary": "Screen" },
            { "primary": "Password", "secondary": "PIN" },
            { "primary": "Server", "secondary": "Database" },
            { "primary": "Hardware", "secondary": "Software" },
            { "primary": "Printer", "secondary": "Scanner" },
            { "primary": "Router", "secondary": "Modem" },
            { "primary": "App", "secondary": "Website" },
            { "primary": "Virtual Reality", "secondary": "Augmented Reality" },
            { "primary": "Battery", "secondary": "Charger" },
            { "primary": "Antivirus", "secondary": "Firewall" },
            { "primary": "Algorithm", "secondary": "Heuristic" },
            { "primary": "Drone", "secondary": "Helicopter" },
            { "primary": "Browser", "secondary": "Search Engine" }
        ]
    }
};
const wordsBankId = {
    "food-drink": {
        "id": "food-drink",
        "label": "Makanan & Minuman",
        "words": [
            { "primary": "Mie", "secondary": "Bihun" },
            { "primary": "Kari", "secondary": "Gulai" },
            { "primary": "Soto", "secondary": "Sop" },
            { "primary": "Es Krim", "secondary": "Gelato" },
            { "primary": "Kopi", "secondary": "Teh" },
            { "primary": "Tahu", "secondary": "Tempe" },
            { "primary": "Nasi Goreng", "secondary": "Mie Goreng" },
            { "primary": "Bakso", "secondary": "Sosis" },
            { "primary": "Siomay", "secondary": "Batagor" },
            { "primary": "Gado-gado", "secondary": "Ketoprak" },
            { "primary": "Kerupuk", "secondary": "Keripik" },
            { "primary": "Lontong", "secondary": "Ketupat" },
            { "primary": "Rendang", "secondary": "Semur" },
            { "primary": "Susu", "secondary": "Yoghurt" },
            { "primary": "Jus", "secondary": "Sirup" },
            { "primary": "Keju", "secondary": "Mentega" },
            { "primary": "Donat", "secondary": "Roti" },
            { "primary": "Cokelat", "secondary": "Karamel" },
            { "primary": "Sate", "secondary": "Kebab" },
            { "primary": "Bubur", "secondary": "Ketan" }
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
            { "primary": "Lebah", "secondary": "Tawon" },
            { "primary": "Katak", "secondary": "Kodok" },
            { "primary": "Harimau", "secondary": "Singa" },
            { "primary": "Monyet", "secondary": "Orangutan" },
            { "primary": "Kucing", "secondary": "Anjing" },
            { "primary": "Elang", "secondary": "Rajawali" },
            { "primary": "Sapi", "secondary": "Kerbau" },
            { "primary": "Kambing", "secondary": "Domba" },
            { "primary": "Cumi-cumi", "secondary": "Gurita" },
            { "primary": "Nyamuk", "secondary": "Lalat" },
            { "primary": "Kupu-kupu", "secondary": "Ngengat" },
            { "primary": "Ular", "secondary": "Cacing" },
            { "primary": "Ayam", "secondary": "Bebek" },
            { "primary": "Tikus", "secondary": "Curut" },
            { "primary": "Kuda", "secondary": "Keledai" },
            { "primary": "Kelelawar", "secondary": "Burung Hantu" }
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
            { "primary": "Bioskop", "secondary": "Teater" },
            { "primary": "Sutradara", "secondary": "Produser" },
            { "primary": "Horor", "secondary": "Thriller" },
            { "primary": "Prekuel", "secondary": "Sekuel" },
            { "primary": "Subtitle", "secondary": "Dubbing" },
            { "primary": "Sinetron", "secondary": "FTV" },
            { "primary": "Protagonis", "secondary": "Antagonis" },
            { "primary": "Syuting", "secondary": "Casting" },
            { "primary": "Trailer", "secondary": "Teaser" },
            { "primary": "Tiket", "secondary": "Voucher" },
            { "primary": "Dokumenter", "secondary": "Fiksi" },
            { "primary": "Aksi", "secondary": "Drama" },
            { "primary": "Trilogi", "secondary": "Saga" },
            { "primary": "Pemeran Pengganti", "secondary": "Stuntman" },
            { "primary": "Kostum", "secondary": "Makeup" },
            { "primary": "Kamera", "secondary": "Lensa" }
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
            { "primary": "Gunung", "secondary": "Bukit" },
            { "primary": "Pasar", "secondary": "Supermarket" },
            { "primary": "Apotek", "secondary": "Toko Obat" },
            { "primary": "Bandara", "secondary": "Stasiun" },
            { "primary": "Terminal", "secondary": "Halte" },
            { "primary": "Sekolah", "secondary": "Kampus" },
            { "primary": "Perpustakaan", "secondary": "Toko Buku" },
            { "primary": "Museum", "secondary": "Galeri" },
            { "primary": "Pantai", "secondary": "Pesisir" },
            { "primary": "Sungai", "secondary": "Selokan" },
            { "primary": "Stadion", "secondary": "Lapangan" },
            { "primary": "Apartemen", "secondary": "Kos-kosan" },
            { "primary": "Hutan", "secondary": "Taman" },
            { "primary": "Istana", "secondary": "Kastil" },
            { "primary": "Desa", "secondary": "Kota" },
            { "primary": "Pulau", "secondary": "Benua" }
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
            { "primary": "Wi-Fi", "secondary": "Bluetooth" },
            { "primary": "Smartphone", "secondary": "Tablet" },
            { "primary": "Keyboard", "secondary": "Mouse" },
            { "primary": "Earphone", "secondary": "Headset" },
            { "primary": "Aplikasi", "secondary": "Website" },
            { "primary": "Password", "secondary": "PIN" },
            { "primary": "Server", "secondary": "Database" },
            { "primary": "Router", "secondary": "Modem" },
            { "primary": "Printer", "secondary": "Scanner" },
            { "primary": "Antivirus", "secondary": "Firewall" },
            { "primary": "Kabel", "secondary": "Nirkabel" },
            { "primary": "Email", "secondary": "SMS" },
            { "primary": "Drone", "secondary": "Helikopter" },
            { "primary": "Monitor", "secondary": "Layar" },
            { "primary": "Sistem Operasi", "secondary": "Software" },
            { "primary": "Kamera", "secondary": "Camcorder" }
        ]
    }
};
const returnWordsBank = (lang) => {
    return lang === "id" ? wordsBankId : wordsBankEn;
};
exports.returnWordsBank = returnWordsBank;
/** Canonical key so a pair matches regardless of majority/minority or primary/secondary order. */
function canonicalPairKey(a, b) {
    return a <= b ? `${a}\0${b}` : `${b}\0${a}`;
}
const randomWordPair = (language, categoryId, usedWordPairs = []) => {
    const wordsBank = returnWordsBank(language);
    const selectedCategory = wordsBank[categoryId] ?? wordsBank["food-drink"];
    const allWords = selectedCategory.words;
    const usedKeys = new Set(usedWordPairs.map(p => canonicalPairKey(p.majorityWord, p.minorityWord)));
    const remaining = allWords.filter(w => !usedKeys.has(canonicalPairKey(w.primary, w.secondary)));
    const exhausted = remaining.length === 0;
    const pool = exhausted ? allWords : remaining;
    const wordPair = pool[Math.floor(Math.random() * pool.length)];
    const primary = wordPair?.primary ?? "";
    const secondary = wordPair?.secondary ?? "";
    // 50% swap: which bank word maps to majority vs minority is random each draw.
    const [majorityWord, minorityWord] = Math.random() < 0.5 ? [primary, secondary] : [secondary, primary];
    return {
        majorityWord,
        minorityWord,
        hasNoMoreWords: exhausted,
    };
};
exports.randomWordPair = randomWordPair;
//# sourceMappingURL=wordsBank.js.map