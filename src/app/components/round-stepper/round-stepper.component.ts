import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Round } from 'src/app/models/round';

@Component({
  selector: 'app-round-stepper',
  templateUrl: './round-stepper.component.html',
  styleUrls: ['./round-stepper.component.scss']
})
export class RoundStepperComponent implements OnInit {

  @Input() rounds: Round[];
  @Input() roundSelected: number;

  @Output() roundSelectedChange: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  getWinner(round: Round) {
    if(round.endCounterTerroristRecord > round.startCounterTerroristRecord)  {
      return 'ct-winner';
    } else {
      return 't-winner';
    }
  }

  roundChange(round: Round) {
    this.roundSelectedChange.emit(round.roundNumber);
  }

}
