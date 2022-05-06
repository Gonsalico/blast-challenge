import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {

  constructor(
    private http: HttpClient
  ) { }

  getMatch(): Observable<string> {
    return this.http.get('assets/data/match-nuke.txt', {responseType: 'text'});
  }
}
