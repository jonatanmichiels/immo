import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  OAuthService,
  AuthConfig,
  NullValidationHandler,
} from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { clientId, issuer } from 'auth.conf.json';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  config: AuthConfig = {
    issuer,
    clientId,
    redirectUri: window.location.origin, // redirect location after login. this should be whitelisted in your id provider configuration
    responseType: 'code', // configuration for the lib telling we want to use the code flow with PKCE
    scope: 'openid profile email offline_access api', // We grand our identity server to use tho following information about us publicly
    showDebugInformation: true, // debugging purposes, do not use in production
    disableAtHashCheck: true, // our server does not support this, even this is recommended by the OIDC specs
  };

  // tslint:disable-next-line:variable-name
  private _user$ = new BehaviorSubject(null);
  user$ = this._user$.asObservable();
  isAuthenticated$ = this.user$.pipe(map(() => this.hasValidIdToken()));
  isAdmin$ = this.user$.pipe(
    filter(user => !!user),
    map(({ roles }) => roles.includes('ADMIN'))
  );

  constructor(private oAuthService: OAuthService, private router: Router) {}

  setup() {
    this.oAuthService.configure(this.config); // pass configuration
    this.oAuthService.tokenValidationHandler = new NullValidationHandler(); // JwksValidationHandler is the default
    this.oAuthService.loadDiscoveryDocumentAndTryLogin(); // Setup login strategy (new tab, in app, new page, ...),
    this.oAuthService.setupAutomaticSilentRefresh();

    this.oAuthService.events.subscribe(e => {
      this._user$.next(this.getClaims());
      if (e.type === 'token_received' && this.oAuthService.state) {
        this.router.navigateByUrl(this.oAuthService.state);
      }
    });
  }

  login(targetUrl: string = this.router.url) {
    this.oAuthService.initCodeFlow(targetUrl);
  }

  logout() {
    this.oAuthService.logOut();
    this._user$.next(null);
  }

  hasValidIdToken() {
    return this.oAuthService.hasValidIdToken();
  }

  getClaims() {
    return this.oAuthService.getIdentityClaims();
  }
}
