import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { RoundStepperComponent } from './components/round-stepper/round-stepper.component';
import { MatchHeaderComponent } from './components/match-header/match-header.component';
import { StatsTableComponent } from './components/stats-table/stats-table.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoundStepperComponent,
    MatchHeaderComponent,
    StatsTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
