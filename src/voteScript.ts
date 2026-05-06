export interface TriggeredEffect {
  power: string;
  playerName: string;
  playerEmail: string;
}

export default function calculateVoteResults(players: PlayerWithRole[]) {
  if (!players?.length) {
    return {
      success: false,
      message: "No players to calculate votes for",
      data: { players: [] as PlayerWithRole[] },
      triggeredEffects: [] as TriggeredEffect[],
    };
  }

  const superpowerName = (p: PlayerWithRole) => p.superpower?.name ?? null;

  // ─── Step 1: Pre-compute effective vote counts ────────────────────────────────
  //
  // Briber shield: reduce the target's vote count by 1 when they have > 1 vote
  // and haven't used the power yet. We record the email here so we can mark
  // hasUsedSuperpower in the output — even if the round ends in a tie.

  let briberTriggeredEmail: string | null = null;
  const effectiveVotes = new Map<string, number>();

  for (const p of players) {
    if (!p.isAlive) continue;
    const raw = p.voters.length;
    let effective = raw;
    if (superpowerName(p) === "briber" && !p.hasUsedSuperpower && raw > 1) {
      effective = raw - 1;
      briberTriggeredEmail = p.playerEmail;
    }
    effectiveVotes.set(p.playerEmail, effective);
  }

  // ─── Step 2: Find the most-voted alive player ─────────────────────────────────

  const findTop = (votes: Map<string, number>) => {
    let maxVotes = -1;
    let topEmail: string | null = null;
    let topRole: GameRole | null = null;
    let isTie = false;

    for (const p of players) {
      if (!p.isAlive) continue;
      const count = votes.get(p.playerEmail) ?? 0;
      if (count > maxVotes) {
        maxVotes = count;
        topEmail = p.playerEmail;
        topRole = p.gameRole;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true;
      }
    }
    return { topEmail, topRole, isTie };
  };

  let { topEmail, topRole, isTie } = findTop(effectiveVotes);

  // ─── Step 3: Chief tie-break ──────────────────────────────────────────────────
  //
  // Only fires when the first pass ended in a tie AND there is a living chief
  // who has not yet used their power. The chief's vote target receives +1 weight.
  // chiefTriggeredEmail is only set when the bonus actually resolves the tie,
  // so an unsuccessful attempt does NOT consume the chief's power.

  let chiefTriggeredEmail: string | null = null;

  if (isTie) {
    const chief = players.find(
      p => p.isAlive && !p.hasUsedSuperpower && superpowerName(p) === "chief",
    );
    if (chief) {
      const chiefVotedForEmail =
        players.find(
          p => p.isAlive && p.voters.some(v => v.playerEmail === chief.playerEmail),
        )?.playerEmail ?? null;

      if (chiefVotedForEmail) {
        const boostedVotes = new Map(effectiveVotes);
        boostedVotes.set(
          chiefVotedForEmail,
          (boostedVotes.get(chiefVotedForEmail) ?? 0) + 1,
        );
        const tieBreak = findTop(boostedVotes);
        if (!tieBreak.isTie && tieBreak.topEmail != null && tieBreak.topRole != null) {
          topEmail = tieBreak.topEmail;
          topRole = tieBreak.topRole;
          isTie = false;
          chiefTriggeredEmail = chief.playerEmail;
        }
      }
    }
  }

  // ─── Step 4: Persist passive superpower usage ─────────────────────────────────
  //
  // This step runs BEFORE the tie-check so that the returned player list always
  // carries the updated hasUsedSuperpower state — even when no elimination
  // occurs. Without this, a tie round would return the original players array
  // and the briber/chief would be seen as "not yet used" on the next call.
  //
  // Rules:
  //   • Briber  — consumed whenever the shield fires (vote reduced), tie or not.
  //   • Chief   — consumed only when their bonus actually resolved a tie.
  //   • Saboteur — passive with no "used" state; always checked at elimination.

  const powersTriggered = new Set<string>();
  if (briberTriggeredEmail) powersTriggered.add(briberTriggeredEmail);
  if (chiefTriggeredEmail)  powersTriggered.add(chiefTriggeredEmail);

  const playersWithPowerUpdates =
    powersTriggered.size > 0
      ? players.map(p =>
          powersTriggered.has(p.playerEmail)
            ? { ...p, hasUsedSuperpower: true }
            : p,
        )
      : players;

  // ─── Step 4b: Collect triggered-effect descriptors for broadcasting ──────────
  //
  // Built from the same emails used in playersWithPowerUpdates so the data
  // is always in sync. An empty array means no passive powers fired this round.

  const triggeredEffects: TriggeredEffect[] = [];
  if (briberTriggeredEmail) {
    const briber = players.find(p => p.playerEmail === briberTriggeredEmail);
    if (briber) {
      triggeredEffects.push({
        power: "briber",
        playerName: briber.playerName,
        playerEmail: briber.playerEmail,
      });
    }
  }
  if (chiefTriggeredEmail) {
    const chief = players.find(p => p.playerEmail === chiefTriggeredEmail);
    if (chief) {
      triggeredEffects.push({
        power: "chief",
        playerName: chief.playerName,
        playerEmail: chief.playerEmail,
      });
    }
  }

  // ─── Step 5: Unresolved tie — no elimination ─────────────────────────────────
  //
  // Return the power-updated players so the consumed state is persisted.

  if (isTie || topEmail == null || topRole == null) {
    return {
      success: true,
      message: "Vote tied - no elimination",
      data: { players: playersWithPowerUpdates },
      triggeredEffects,
    };
  }

  // ─── Step 6: Mark the eliminated player as dead ───────────────────────────────
  //
  // Builds on top of playersWithPowerUpdates so all superpower flags are
  // already in place; we only need to flip the one isAlive field.

  const newPlayers: PlayerWithRole[] = playersWithPowerUpdates.map(p =>
    p.isAlive && p.playerEmail === topEmail ? { ...p, isAlive: false } : p,
  );

  // ─── Step 7: Count surviving roles ───────────────────────────────────────────

  let majorityCount = 0;
  let minorityCount = 0;
  let blindCount    = 0;

  for (const p of newPlayers) {
    if (!p.isAlive) continue;
    if      (p.gameRole === "majority") majorityCount++;
    else if (p.gameRole === "minority") minorityCount++;
    else if (p.gameRole === "blind")    blindCount++;
  }

  // ─── Step 8: Victory conditions (order is intentional) ───────────────────────
  //
  // 1. Saboteur  — wins immediately if they are the one eliminated.
  // 2. Blind     — always receives a guess attempt before win conditions resolve.
  //                (Must precede "Majority wins" so the guess isn't skipped even
  //                when all minorities are already dead.)
  // 3. Majority  — wins when every opposition player has been eliminated.
  // 4. Opposition — wins when they equal or outnumber the majority.
  // 5. Continue  — none of the above; next round begins.

  const eliminated = players.find(p => p.isAlive && p.playerEmail === topEmail);

  if (eliminated && superpowerName(eliminated) === "saboteur") {
    return {
      success: true,
      message: "Saboteur is the winner",
      data: { players: newPlayers },
      triggeredEffects,
    };
  }

  if (topRole === "blind") {
    return {
      success: true,
      message: "Blind guess the word",
      data: { players: newPlayers },
      triggeredEffects,
    };
  }

  if (minorityCount === 0 && blindCount === 0) {
    return {
      success: true,
      message: "Majority is the winner",
      data: { players: newPlayers },
      triggeredEffects,
    };
  }

  if (majorityCount <= minorityCount + blindCount) {
    return {
      success: true,
      message: minorityCount > 0 ? "Minority is the winner" : "Blind is the winner",
      data: { players: newPlayers },
      triggeredEffects,
    };
  }

  return {
    success: true,
    message: "Game continue",
    data: { players: newPlayers },
    triggeredEffects,
  };
}
