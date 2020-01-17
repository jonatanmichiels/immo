import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  OAuthService,
  AuthConfig,
  NullValidationHandler,
} from 'angular-oauth2-oidc';
import { map } from 'rxjs/operators';
import { issuer, clientId } from 'auth.conf.json';

const authConfig: AuthConfig = {
  issuer,
  clientId,
  redirectUri: window.location.origin,
  responseType: 'code',
  scope: 'openid profile email offline_access api',
  showDebugInformation: true,
  disableAtHashCheck: true,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$ = this.oauthService.events.pipe(map(() => this.getClaims()));
  isAuthenticated$ = this.user$.pipe(map(() => this.hasValidIdToken()));

  constructor(private oauthService: OAuthService, private router: Router) {}

  setup() {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new NullValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.oauthService.setupAutomaticSilentRefresh();
  }

  login(targetUrl: string = this.router.url) {
    this.oauthService.initCodeFlow(targetUrl);
  }

  logout() {
    this.oauthService.logOut();
  }

  hasValidIdToken() {
    return this.oauthService.hasValidIdToken();
  }

  getClaims() {
    return this.oauthService.getIdentityClaims();
  }
}
