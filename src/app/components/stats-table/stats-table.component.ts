import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Player } from 'src/app/models/player';
import { Round } from 'src/app/models/round';

@Component({
  selector: 'app-stats-table',
  templateUrl: './stats-table.component.html',
  styleUrls: ['./stats-table.component.scss']
})
export class StatsTableComponent implements OnInit, OnDestroy {

  @Input() players: Map<string, Player> = new Map();
  @Input() rounds: Round[];
  @Input() roundChangeEvent: Observable<number>;

  teamOne: Player[] = [];
  teamTwo: Player[] = [];

  isHalfMatch: boolean = false;
  roundSelected: number = 1;
  loadingt: boolean;
  private roundChangedSubscription: Subscription;

  constructor(private ngZone: NgZone, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.divideTeams();
    this.roundChangedSubscription = this.roundChangeEvent.subscribe((value) => {
      this.updateRoundSelected(value);
    });
    this.updateAndSortTeams();
  }

  ngOnDestroy() {
    this.roundChangedSubscription.unsubscribe();
  }

  divideTeams() {
    this.players.forEach((value, key) => {
      if (value.side == 'CT') {
        this.teamOne.push(value);
      } else {
        this.teamTwo.push(value);
      }
    });
  }

  updateRoundSelected(roundSelected: number) {
    this.roundSelected = roundSelected;
    this.isHalfMatch = this.roundSelected > 15;
    this.updateAndSortTeams();
  }

  updateAndSortTeams() {
    this.teamOne.forEach( (player) => {
      player.roundKills = this.getKills(player, false);
      player.totalKills = this.getKills(player, true);
    });
    this.teamTwo.forEach( (player) => {
      player.roundKills = this.getKills(player, false);
      player.totalKills = this.getKills(player, true);
    });
    this.teamOne.sort((a, b) => a.totalKills > b.totalKills ? -1 : a.totalKills < b.totalKills ? 1 : 0);
    this.teamTwo.sort((a, b) => a.totalKills > b.totalKills ? -1 : a.totalKills < b.totalKills ? 1 : 0);
  }

  getKills(player: Player, allKills: boolean): number {
    let totalKills = 0;
    this.rounds.forEach((value) => {
      if (allKills && value.roundNumber <= this.roundSelected) {
        let ct = value.counterTerroristStats.find(ct => ct.playerId == player.steamId);
        let t = value.terroristStats.find(t => t.playerId == player.steamId);
        if (ct != undefined) { totalKills = totalKills + ct.kills; }
        if (t != undefined) { totalKills = totalKills + t.kills; }
      } else {
        if (value.roundNumber == this.roundSelected) {
          if (!this.isTerrorist(player.side)) {
            let ct = value.counterTerroristStats.find(ct => ct.playerId == player.steamId);
            if (ct != undefined) { totalKills = totalKills + ct.kills; }
          } else {
            let t = value.terroristStats.find(t => t.playerId == player.steamId);
            if (t != undefined) {totalKills = totalKills + t.kills; }
          }
        }
      }
    });
    return totalKills;
  }

  isTerrorist(playerSide: string) {
    return (playerSide == 'CT' && this.isHalfMatch) || (playerSide == 'TERRORIST' && !this.isHalfMatch);
  }

  getArrayFromNumbers(numberOfItems: number) {
    return Array(numberOfItems).fill(0).map((x, i) => i);
  }

  getRoundTime() {
    return this.rounds.find( round => round.roundNumber == this.roundSelected).length;
  }
}
