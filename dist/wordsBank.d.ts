declare const returnWordsBank: (lang: string) => {
    "food-drink": {
        id: string;
        label: string;
        words: {
            original: string;
            mimic: string;
        }[];
    };
    animals: {
        id: string;
        label: string;
        words: {
            original: string;
            mimic: string;
        }[];
    };
    movies: {
        id: string;
        label: string;
        words: {
            original: string;
            mimic: string;
        }[];
    };
    places: {
        id: string;
        label: string;
        words: {
            original: string;
            mimic: string;
        }[];
    };
    technology: {
        id: string;
        label: string;
        words: {
            original: string;
            mimic: string;
        }[];
    };
};
declare const randomWordPair: (language: string, categoryId: string, usedWordPairs?: WordPair[]) => WordPair & {
    hasNoMoreWords: boolean;
};
export { returnWordsBank, randomWordPair };
//# sourceMappingURL=wordsBank.d.ts.map