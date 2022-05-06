import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Match } from 'src/app/models/match';
import { Player } from 'src/app/models/player';
import { Round } from 'src/app/models/round';
import { RoundPlayerStats } from 'src/app/models/round-player-stat';
import { MatchesService } from 'src/app/services/matches.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  loading: boolean = true; 
  fileLines: string[];
  startMatchIndex = -1;
  players: Map<string, Player> = new Map();
  rounds: Map<number, string[]> = new Map();
  finalStats: Round[];
  match: Match = new Match();

  roundSelected: number = 1;

  roundChanged: Subject<number> = new Subject<number>();

  constructor(
    private matchesService: MatchesService
  ) { }

  ngOnInit(): void {
    this.matchesService.getMatch().subscribe((data) => {
      this.fileLines = data.split(/[\r\n]+/);
      this.checkMatchStart();
    });
  }

  roundSelectedChange(roundNumber: number) {
    this.roundSelected = roundNumber;
    this.roundChanged.next(roundNumber);
  }

  checkMatchStart() {
    let liveIndex = Number.MAX_SAFE_INTEGER;
    this.fileLines.forEach((line, index) => {
      if (line.includes('LIVE!')) { liveIndex = index }
      if (line.includes('Match_Start') && index > liveIndex) { 
        this.startMatchIndex = index;
        this.match.mapSelected = line.split('"')[3];
        this.match.date = line.substring(0, 10);
        this.match.teamOne = this.fileLines[index + 1].split('":')[1].slice(1);
        this.match.teamTwo = this.fileLines[index + 2].split('":')[1].slice(1);
      }
    });
    this.fileLines.splice(0, this.startMatchIndex);
    this.addPlayers();
  }

  addPlayers() {
    this.players.clear();
    let index = 0;
    do {
      if (this.fileLines[index].includes('STEAM')) {
        this.players.set(this.fileLines[index].match(/"([^"]+)"/)[1].split('<')[2].slice(0, -1), this.getPlayerFromString(this.fileLines[index]));
      }
      index = index + 1;
    } while (this.players.size < 10);
    this.spliByRounds();
  }

  spliByRounds() {
    let currentStartRoundIndex = 0;
    let roundIndex = 1;
    this.fileLines.forEach((line, index) => {
      if(line.includes('Round_End')) {
        this.rounds.set(roundIndex, this.fileLines.slice(currentStartRoundIndex, index + 1));
        currentStartRoundIndex = index + 1;
        roundIndex++;
      }
    });
    this.analyzeRounds();
  }

  analyzeRounds() {
    this.finalStats = [];
    this.rounds.forEach((value, key) => {
      let newRound = new Round();
      newRound.roundNumber = key;
      newRound.length = this.calculateRoundLength(value);
      value.forEach(line => {
        if(line.includes('MatchStatus: Team playing "CT"')) {
          newRound.counterTerroristTeam = line.split('":')[1].slice(1);
        }
        if(line.includes('MatchStatus: Team playing "TERRORIST"')) {
          newRound.terroristTeam = line.split('":')[1].slice(1);
        }
        if(line.includes('MatchStatus: Score:')) {
          if(newRound.startCounterTerroristRecord == undefined ) {
            newRound.startCounterTerroristRecord = +line.match(/[0-9]+:[0-9]+/g)[1].split(':')[0];
            newRound.startTerroristRecord = +line.match(/[0-9]+:[0-9]+/g)[1].split(':')[1];
          } else {
            newRound.endCounterTerroristRecord = +line.match(/[0-9]+:[0-9]+/g)[1].split(':')[0];
            newRound.endTerroristRecord = +line.match(/[0-9]+:[0-9]+/g)[1].split(':')[1];
          }
        }
        if(line.includes('STEAM')){
          let player = this.getPlayerFromString(line);
          if(line.includes('killed') && line.split('STEAM').length > 2) {
            let playerStatsIndex = -1;
            if(player.side == 'CT') {
              playerStatsIndex = newRound.counterTerroristStats.findIndex( ct => ct.playerId == player.steamId);
            } else {
              playerStatsIndex = newRound.terroristStats.findIndex( t => t.playerId == player.steamId);
            }
  
            if(playerStatsIndex > -1){
              if(player.side == 'CT') {
                newRound.counterTerroristStats[playerStatsIndex].kills = newRound.counterTerroristStats[playerStatsIndex].kills + 1;
              } else {
                newRound.terroristStats[playerStatsIndex].kills = newRound.terroristStats[playerStatsIndex].kills + 1;
              }
            } else {
              let roundPlayerStats = new RoundPlayerStats();
              roundPlayerStats.playerId = player.steamId;
              roundPlayerStats.playerName = player.name;
              roundPlayerStats.kills = 1;
              if(player.side == 'CT') {
                newRound.counterTerroristStats.push(roundPlayerStats);
              } else {
                newRound.terroristStats.push(roundPlayerStats);
              }
            }
          }
        }
      });
      this.finalStats.push(newRound);
    });
    this.setResult();
    this.loading = false;
  }

  getPlayerFromString(line: string, secondPlayer: boolean = false): Player {
    let player = new Player();
    if(secondPlayer) line = line.split("killed")[1];
    let lineSplitter = line.match(/"([^"]+)"/)[1].split('<');
    if(lineSplitter.length > 1){
      player.name = lineSplitter[0];
      player.id = lineSplitter[1].slice(0, -1);
      player.steamId = lineSplitter[2].slice(0, -1);
      if(lineSplitter.length > 3) player.side = lineSplitter[3].slice(0, -1);
    }

    return player;
  }

  calculateRoundLength(roundString: string[]): string {
    let startRound: string;
    let endRound: string;
    roundString.forEach((line, index) => {
      if(line.includes('Round_Start')) {
        startRound = line.substring(13, 21);
      }
      if(line.includes('Round_End')) {
        endRound = line.substring(13, 21);
      }
    });
    let msStart = new Date().setHours(+startRound.split(':')[0],+startRound.split(':')[1], +startRound.split(':')[2] );
    let msEnd = new Date().setHours(+endRound.split(':')[0],+endRound.split(':')[1], +endRound.split(':')[2] );
    let diff = msEnd - msStart;
    return this.msToTime(diff);
  }

  setResult() {
    let lastRound = this.finalStats[this.finalStats.length - 1];
    if(this.match.teamOne == lastRound.counterTerroristTeam) {
      this.match.teamOneScore = lastRound.endCounterTerroristRecord;
      this.match.teamTwoScore = lastRound.endTerroristRecord;
    } else {
      this.match.teamOneScore = lastRound.endTerroristRecord;
      this.match.teamTwoScore = lastRound.endCounterTerroristRecord;
    }
  }

   msToTime(duration: any) {
    let minutes, seconds;
    let stringReturn = "";

    minutes = Math.floor((duration/1000/60/60)*60);
    seconds = Math.floor(((duration/1000/60/60)*60 - minutes)*60);
  
    if(minutes) {
      stringReturn = stringReturn.concat(""+minutes)
    } else {
      stringReturn = stringReturn.concat("00")
    }
    if(seconds) {
      stringReturn = seconds > 9 ? stringReturn.concat(":" + seconds) : stringReturn.concat(":0" + seconds)
    } else {
      stringReturn = stringReturn.concat(":00")
    }
    return stringReturn;
  }

}
