export interface TriggeredEffect {
    power: string;
    playerName: string;
    playerEmail: string;
}
type UsePassivePowersState = GameData["usePassivePowers"];
export default function calculateVoteResults(players: PlayerWithRole[], usePassivePowers?: UsePassivePowersState): {
    success: boolean;
    message: string;
    data: {
        players: PlayerWithRole[];
    };
    triggeredEffects: TriggeredEffect[];
};
export {};
//# sourceMappingURL=voteScript.d.ts.map