export default function calculateVoteResults(players: PlayerWithRole[]) {
  if (!players?.length) {
    return {
      success: false,
      message: "No players to calculate votes for",
      data: { players: [] as PlayerWithRole[] },
    };
  }

  // Find the highest-voted (alive) player, detecting ties without allocations.
  let maxVotes = -1;
  let topEmail: string | null = null;
  let topRole: string | null = null;
  let isTie = false;

  for (const p of players) {
    if (!p.isAlive) continue;
    const voters = p.voters?.length ?? 0;
    if (voters > maxVotes) {
      maxVotes = voters;
      topEmail = p.playerEmail;
      topRole = p.gameRole;
      isTie = false;
    } else if (voters === maxVotes) {
      isTie = true;
    }
  }

  // Tie (or no alive players): do not eliminate anyone.
  if (isTie || topEmail == null || topRole == null) {
    return {
      success: true,
      message: "Vote tied - no elimination",
      data: { players },
    };
  }

  // Mark only the voted-out player as dead (keep them in the list) and count alive roles.
  let originalCount = 0;
  let mimicCount = 0;
  let voidCount = 0;

  const newPlayers: PlayerWithRole[] = new Array(players.length);
  for (let i = 0; i < players.length; i += 1) {
    const p = players[i]!;
    const next =
      p.isAlive && p.playerEmail === topEmail ? { ...p, isAlive: false } : p;
    newPlayers[i] = next;

    if (!next.isAlive) continue;
    if (next.gameRole === "original") originalCount += 1;
    else if (next.gameRole === "mimic") mimicCount += 1;
    else if (next.gameRole === "void") voidCount += 1;
  }

  // Original wins only when all mimics AND voids are eliminated.
  if (mimicCount === 0 && voidCount === 0) {
    return {
      success: true,
      message: "Original is the winner",
      data: { players: newPlayers },
    };
  }

  // If a void is voted out, game continues (void-specific flow happens elsewhere).
  if (topRole === "void") {
    return {
      success: true,
      message: "Void guess the word",
      data: { players: newPlayers },
    };
  }

  // Opposition wins once they are >= originals.
  if (originalCount <= mimicCount + voidCount) {
    return {
      success: true,
      message: mimicCount > 0 ? "Mimic is the winner" : "Void is the winner",
      data: { players: newPlayers },
    };
  }

  return {
    success: true,
    message: "Game continue",
    data: { players: newPlayers },
  };
};
