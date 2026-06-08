declare const returnWordsBank: (lang: string) => {
    "food-drink": {
        id: string;
        label: string;
        words: {
            primary: string;
            secondary: string;
        }[];
    };
    animals: {
        id: string;
        label: string;
        words: {
            primary: string;
            secondary: string;
        }[];
    };
    movies: {
        id: string;
        label: string;
        words: {
            primary: string;
            secondary: string;
        }[];
    };
    places: {
        id: string;
        label: string;
        words: {
            primary: string;
            secondary: string;
        }[];
    };
    technology: {
        id: string;
        label: string;
        words: {
            primary: string;
            secondary: string;
        }[];
    };
};
declare const randomWordPair: (language: string, categoryId: string, usedWordPairs?: WordPair[]) => WordPair & {
    hasNoMoreWords: boolean;
};
export { returnWordsBank, randomWordPair };
//# sourceMappingURL=wordsBank.d.ts.map