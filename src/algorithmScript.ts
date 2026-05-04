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

function roleFisherYatesShuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export { calculateRoles, calculateSuperpowers, roleFisherYatesShuffle };