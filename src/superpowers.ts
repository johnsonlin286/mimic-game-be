function shuffleInPlace<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i]!, array[j]!] = [array[j]!, array[i]!];
  }
  return array;
}

const superpowers: Superpower[] = [
  {
    name: "interrogator",
    type: "active",
    description: "Force any player to immediately give a second, completely different clue. Use this to put the pressure on someone acting suspicious.",
    allowedRoles: ["minority", "majority"],
  },
  {
    name: "detective",
    type: "active",
    description: "Secretly scan one player to reveal their true alignment (Friend or Enemy). You will know the truth, but you still have to convince the group.",
    allowedRoles: ["minority", "majority"],
  },
  {
    name: "chief",
    type: "passive",
    description: "You hold the ultimate deciding vote. If the elimination round ends in a tie, your vote automatically breaks the tie and seals their fate.",
    allowedRoles: ["majority"],
  },
  {
    name: "saboteur",
    type: "passive",
    description: "You are playing a completely different game. Your only goal is to trick the group into eliminating you. If you are voted out, you win alone.",
    allowedRoles: ["majority"],
  },
  {
    name: "briber",
    type: "passive",
    description: "You have a natural defense against the mob. If you receive more than one vote during the elimination phase, your total vote count is automatically reduced by one.",
    allowedRoles: ["minority", "majority", "blind"],
  },
];

const AGENT: Superpower = {
  name: "agent",
  type: "passive",
  description: "You are the backbone of the operation. With no special gadgets to rely on, your only weapon is your mind. Pay close attention to the clues, trust your instincts, and vote out the enemy.",
  allowedRoles: ["majority"],
};

const defByName = new Map(superpowers.map(s => [s.name, s]));

/**
 * After `gameRole` is set on each player, assigns at most one superpower per
 * player: `numActivePowers` distinct actives + `numPassivePowers` distinct
 * passives, respecting `allowedRoles` (minority/blind never get chief/saboteur).
 * Unfilled players keep `agent` (no superpower). Unplaceable powers are skipped.
 */
function assignSuperpowersForRound(
  players: PlayerWithRole[],
  numActivePowers: number,
  numPassivePowers: number,
): void {
  for (const p of players) {
    p.superpower = AGENT;
  }

  const totalSlots = numActivePowers + numPassivePowers;
  if (totalSlots === 0 || players.length === 0) return;

  const activeDefs = superpowers.filter(s => s.type === "active");
  const passiveDefs = superpowers.filter(s => s.type === "passive");

  const activeNames = shuffleInPlace([...activeDefs.map(s => s.name)]).slice(
    0,
    Math.min(numActivePowers, activeDefs.length),
  );
  const passiveNames = shuffleInPlace([...passiveDefs.map(s => s.name)]).slice(
    0,
    Math.min(numPassivePowers, passiveDefs.length),
  );

  type Slot = { name: string };
  const slots: Slot[] = [
    ...activeNames.map(name => ({ name })),
    ...passiveNames.map(name => ({ name })),
  ];
  shuffleInPlace(slots);

  for (const { name } of slots) {
    const def = defByName.get(name);
    if (!def) continue;

    const candidates = players.filter(
      p => p.superpower === AGENT && def.allowedRoles.includes(p.gameRole),
    );
    if (candidates.length === 0) continue;

    shuffleInPlace(candidates);
    const pick = candidates[0];
    if (pick) pick.superpower = def;
  }
}

const randomSuperpower = (previous?: string): Superpower => {
  const remaining = superpowers.filter(power => power.name !== previous);
  return remaining[Math.floor(Math.random() * remaining.length)] as Superpower;
};

export { superpowers, randomSuperpower, assignSuperpowersForRound, AGENT };
