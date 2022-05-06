import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundStepperComponent } from './round-stepper.component';

describe('RoundStepperComponent', () => {
  let component: RoundStepperComponent;
  let fixture: ComponentFixture<RoundStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundStepperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
