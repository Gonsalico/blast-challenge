import { RoundPlayerStats } from "./round-player-stat";

export class Round {
    roundNumber: number; //
    length: string; //
    startCounterTerroristRecord: number; //
    endCounterTerroristRecord: number; //
    startTerroristRecord: number; //
    endTerroristRecord: number; //
    counterTerroristTeam: string; //
    terroristTeam: string; //
    counterTerroristStats: RoundPlayerStats[] = [];
    terroristStats: RoundPlayerStats[] = [];
}