function calculateRoles(playerCount: number, isVoidEnabled: boolean) {
  let numMinorities = 1;
  let numBlinds = 0;

  // 1. Calculate Mimics based on your rules
  if (playerCount >= 9) {
      numMinorities = 3;
  } else if (playerCount >= 7) {
      numMinorities = 2;
  }

  // 2. Calculate Voids if the host enabled them
  if (isVoidEnabled) {
      if (playerCount >= 10) {
          numBlinds = 2;
      } else if (playerCount >= 5) {
          numBlinds = 1;
      }
  }

  // 3. The rest are Originals
  const numMajorities = playerCount - numMinorities - numBlinds;

  return { numMinorities, numBlinds, numMajorities };
}

export interface SuperpowerCounts {
  numActivePowers: number;
  numPassivePowers: number;
}

/** How many distinct active / passive superpowers are in play this round. Always returns numbers (zeros when disabled or lobby too small). */
function calculateSuperpowers(
  playerCount: number,
  superpowersEnabled: boolean,
): SuperpowerCounts {
  if (!superpowersEnabled) {
    return { numActivePowers: 0, numPassivePowers: 0 };
  }
  if (playerCount >= 7) {
    return { numActivePowers: 2, numPassivePowers: 1 };
  }
  if (playerCount >= 3) { // 5 is the minimum number of players for superpowers
    return { numActivePowers: 1, numPassivePowers: 1 };
  }
  return { numActivePowers: 0, numPassivePowers: 0 };
}

function roleFisherYatesShuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i]!, array[j]!] = [array[j]!, array[i]!];
  }
  return array;
}

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
function assignRolesWithRotation(
  players: RoomPlayerData[],
  numMinorities: number,
  numBlinds: number,
  previousSpecialRoleEmails: string[],
): { roleMap: Map<string, GameRole>; updatedHistory: string[] } {
  const numSpecial = numMinorities + numBlinds;
  const prevSet = new Set(previousSpecialRoleEmails);

  const fresh: RoomPlayerData[] = [];
  const used: RoomPlayerData[] = [];
  for (const p of players) {
    (prevSet.has(p.playerEmail) ? used : fresh).push(p);
  }
  roleFisherYatesShuffle(fresh);
  roleFisherYatesShuffle(used);

  // Draw special-role candidates from fresh first; fall back to used when exhausted.
  const exhausted = fresh.length < numSpecial;
  const specialPool = exhausted
    ? [...fresh, ...used].slice(0, numSpecial)
    : fresh.slice(0, numSpecial);

  // Shuffle within the pool so minority vs blind assignment is random.
  roleFisherYatesShuffle(specialPool);

  const specialEmails = new Set(specialPool.map(p => p.playerEmail));

  const roleMap = new Map<string, GameRole>();
  specialPool.slice(0, numMinorities).forEach(p => roleMap.set(p.playerEmail, "minority"));
  specialPool.slice(numMinorities).forEach(p => roleMap.set(p.playerEmail, "blind"));
  players
    .filter(p => !specialEmails.has(p.playerEmail))
    .forEach(p => roleMap.set(p.playerEmail, "majority"));

  // On exhaustion start a new cycle; otherwise keep accumulating.
  const updatedHistory = exhausted
    ? specialPool.map(p => p.playerEmail)
    : [...previousSpecialRoleEmails, ...specialPool.map(p => p.playerEmail)];

  return { roleMap, updatedHistory };
}

export { calculateRoles, calculateSuperpowers, assignRolesWithRotation, roleFisherYatesShuffle };