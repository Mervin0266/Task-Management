import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'task-tracker-auth';
  private readonly loggedIn$ = new BehaviorSubject<boolean>(this.getInitialState());

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  login(): Observable<boolean> {
    this.setState(true);
    return of(true);
  }

  logout(): void {
    this.setState(false);
  }

  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  private setState(state: boolean): void {
    this.loggedIn$.next(state);
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  private getInitialState(): boolean {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : false;
  }
}
