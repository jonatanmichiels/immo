import { Component } from '@angular/core';
import {
  OAuthService,
  NullValidationHandler,
  AuthConfig,
} from 'angular-oauth2-oidc';

import { issuer, clientId } from 'auth.conf.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Immo';

  constructor(private oauthService: OAuthService) {
    this.configure();
  }

  public login() {
    this.oauthService.initLoginFlow();
  }

  public logout() {
    this.oauthService.logOut();
  }

  public get name() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims;
  }

  private configure() {
    const authConfig: AuthConfig = {
      issuer,
      clientId,
      redirectUri: window.location.origin,
      responseType: 'code',
      scope: 'openid profile email offline_access api',
      showDebugInformation: true,
      disableAtHashCheck: true,
    };

    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new NullValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    // this.oauthService.refreshToken();
    this.oauthService.setupAutomaticSilentRefresh();
  }
}
