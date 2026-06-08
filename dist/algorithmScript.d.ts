declare function calculateRoles(playerCount: number, isVoidEnabled: boolean): {
    numMinorities: number;
    numBlinds: number;
    numMajorities: number;
};
export interface SuperpowerCounts {
    numActivePowers: number;
    numPassivePowers: number;
}
/** How many distinct active / passive superpowers are in play this round. Always returns numbers (zeros when disabled or lobby too small). */
declare function calculateSuperpowers(playerCount: number, superpowersEnabled: boolean): SuperpowerCounts;
declare function roleFisherYatesShuffle<T>(array: T[]): T[];
/**
 * Assigns minority/blind roles with rotation so the same player(s) are not
 * repeatedly chosen. Mirrors the word-pair exhaustion pattern:
 *
 *  - Players who have NOT received a special role since the last reset are
 *    "fresh" and are always drawn first.
 *  - Once every player has been a special-role recipient (pool exhausted),
 *    the history resets and a new cycle begins.
 *
 * Returns:
 *  - `roleMap`       – email → GameRole for every player in `players`.
 *  - `updatedHistory`– new `roleHistory` value to persist in GameData.
 */
declare function assignRolesWithRotation(players: RoomPlayerData[], numMinorities: number, numBlinds: number, previousSpecialRoleEmails: string[]): {
    roleMap: Map<string, GameRole>;
    updatedHistory: string[];
};
/**
 * Returns a masked version of a word where all characters are hidden as "_"
 * except one randomly revealed letter (spaces are always kept visible).
 *
 * e.g. "HOSPITAL" → "_ _ S _ _ _ _ _"
 *      "Ice Cream" → "_ _ e   C _ _ _ _"
 *      null / ""   → "NO SIGNAL"
 */
declare function maskWordWithHint(word: string | null): string;
export { calculateRoles, calculateSuperpowers, assignRolesWithRotation, roleFisherYatesShuffle, maskWordWithHint };
//# sourceMappingURL=algorithmScript.d.ts.map