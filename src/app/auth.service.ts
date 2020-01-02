import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

import {
  Observable,
  BehaviorSubject,
  from,
  throwError,
  of,
  combineLatest,
} from 'rxjs';
import { shareReplay, catchError, concatMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject$ = new BehaviorSubject<any>(null);
  private domain = 'jonatanm.eu.auth0.com';
  private clientId = 'j6rEDVKcrAGW3CPegUxPlEgQUUpjVYnd';
  private redirectUri = `${window.location.origin}`;
  private apiIdentifier = 'http://localhost:3000/';

  client$ = (from(
    createAuth0Client({
      domain: this.domain,
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      audience: this.apiIdentifier,
    })
  ) as Observable<Auth0Client>).pipe(
    shareReplay(1),
    catchError(err => throwError(err))
  );
  isAuthenticated$ = this.client$.pipe(
    concatMap((client: Auth0Client) => from(client.isAuthenticated())),
    tap(res => (this.isAuthenticated = res))
  );
  handleRedirectCallback$ = this.client$.pipe(
    concatMap((client: Auth0Client) => from(client.handleRedirectCallback()))
  );
  user$ = this.userSubject$.asObservable();
  isAuthenticated: boolean = null;

  constructor(private router: Router) {
    this.localAuthSetup();
    this.handleAuthCallback();
  }

  getUser$(options?): Observable<any> {
    return this.client$.pipe(
      concatMap((client: Auth0Client) => from(client.getUser(options))),
      tap(user => this.userSubject$.next(user))
    );
  }

  getTokenSilently$(options?): Observable<string> {
    return this.client$.pipe(
      concatMap((client: Auth0Client) => from(client.getTokenSilently(options)))
    );
  }

  login(redirectPath: string = '/') {
    this.client$.subscribe((client: Auth0Client) => {
      client.loginWithRedirect({
        redirect_uri: `${window.location.origin}`,
        appState: { target: redirectPath },
      });
    });
  }

  logout() {
    this.client$.subscribe((client: Auth0Client) =>
      client.logout({
        client_id: this.clientId,
        returnTo: this.redirectUri,
      })
    );
  }

  private localAuthSetup() {
    this.isAuthenticated$
      .pipe(
        concatMap((isAuthenticted: boolean) => {
          if (isAuthenticted) {
            return this.getUser$();
          }
          return of(isAuthenticted);
        })
      )
      .subscribe();
  }

  private handleAuthCallback() {
    const params = window.location.search;
    if (params.includes('code=') && params.includes('state=')) {
      let targetRoute: string;
      return this.handleRedirectCallback$
        .pipe(
          tap(cbRes => {
            targetRoute =
              cbRes.appState && cbRes.appState.target
                ? cbRes.appState.target
                : '/';
          }),
          concatMap(() =>
            combineLatest([this.getUser$(), this.isAuthenticated$])
          )
        )
        .subscribe(([user, isAuthenticted]) => {
          this.router.navigate([targetRoute]);
        });
    }
  }
}
