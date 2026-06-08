declare const superpowers: Superpower[];
declare const AGENT: Superpower;
/**
 * After `gameRole` is set on each player, assigns at most one superpower per
 * player: `numActivePowers` distinct actives + `numPassivePowers` distinct
 * passives, respecting `allowedRoles` (minority/blind never get chief/saboteur).
 * Unfilled players keep `agent` (no superpower). Unplaceable powers are skipped.
 *
 * Superpowers that were assigned in the previous round (`previousSuperpowerNames`)
 * are excluded from this round's pool — they become eligible again next round.
 * If excluding them leaves too few options the excluded set is ignored as a fallback.
 *
 * @returns The names of the superpowers actually assigned this round (to be
 *          stored as `superpowerHistory` for the next round).
 */
declare function assignSuperpowersForRound(players: PlayerWithRole[], numActivePowers: number, numPassivePowers: number, previousSuperpowerNames?: string[]): string[];
declare const randomSuperpower: (previous?: string) => Superpower;
export { superpowers, randomSuperpower, assignSuperpowersForRound, AGENT };
//# sourceMappingURL=superpowers.d.ts.map