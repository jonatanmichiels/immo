# Technical notes
## Step 1
The goal of this branch is to succesfull login or authenticate by our identity provider

branch: `start`

	* Change URL in `api.service.ts`
	* Install package
	`npm install angular-oauth2.0-oidc`
	[GitHub - manfredsteyer/angular-oauth2-oidc: Support for OAuth 2 and OpenId Connect (OIDC) in Angular.](https://github.com/manfredsteyer/angular-oauth2-oidc)
	* Generate service
	`ng g service auth`
	* Paste the following
```
import { Injectable } from ‘@angular/core’;
import {
  OAuthService,
  AuthConfig,
  NullValidationHandler,
} from ‘angular-oauth2-oidc’;
import { clientId, issuer } from ‘auth.conf.json’;

@Injectable({
  providedIn: ‘root’
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

  constructor(private oAuthService: OAuthService) {}

  setup() {
    this.oAuthService.configure(this.config); // pass configuration
    this.oAuthService.tokenValidationHandler = new NullValidationHandler(); // JwksValidationHandler is the default
    this.oAuthService.loadDiscoveryDocumentAndTryLogin(); // Setup login strategy (new tab, in app, new page, ...),
  }

  login() {
    this.oAuthService.initCodeFlow();
  }
}

```
	* Go to `app.component.ts`
```
import { Component } from ‘@angular/core’;
import { AuthService } from ‘./auth.service’;

@Component({
  selector: ‘app-root',
  templateUrl: ‘./app.component.html',
  styleUrls: [‘./app.component.css'],
})
export class AppComponent {
  title = ‘Immo’;

  constructor(private authService: AuthService) {
    this.authService.setup();
  }
}
```
	* Go to app.module.ts
```
OAuthModule.forRoot()
```
	* Go to app.component.html
```
<button (click)=“authService.login()”>
  Login
</button>
```

## Step 2
The goal of this branch is to make our nabvbar more clever and add user state. Also provide a logout button

branch: `navbar-and-current-user`

	* Go to `auth.service.ts`

```
private _user$ = new BehaviorSubject(null);
user$ = this._user$.asObservable();
isAuthenticated$ = this.user$.pipe(map(() => this.hasValidIdToken()));
```
```
  setup() {
	  …
    this.oAuthService.events.subscribe(e => {
      this._user$.next(this.getClaims());
    });
  }

```
```
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
```
	* Go to `app.component.html`
```
<ng-container
  *ngIf=“{
    isAuthenticated: authService.isAuthenticated$ | async,
    user: authService.user$ | async
  } as data”
>…</ng-container>
```
```
<a *ngIf=“data.isAuthenticated”>…properties…</a>
<a *ngIf=“data.isAuthenticated && data.user”>…user…</a>
```
```
<button *ngIf=“data.isAuthenticated” (click)=“authService.login()”>Login</button>
<button *ngIf=“data.isAuthenticated” (click)=“authService.logout()”>Logout</button>
```

## Step 3

branch: `authorization-and-guards`

	* Go to `app.module.ts`
```
…
OAuthModule.forRoot({
  resourceServer: {
    allowedUrls: [‘https://immo-keycloak.meys.io’],
    sendAccessToken: true,
  },
}),
```
	* Generate guard and choose onActivate hook
`ng g guard auth`
	* Paste the following
```
import { Injectable } from ‘@angular/core’;
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from ‘@angular/router';
import { Observable } from ‘rxjs’;
import { AuthService } from './auth.service’;

@Injectable({
  providedIn: ‘root’,
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.hasValidIdToken();
  }
}
```
	* Add guards to route file
```
canActivate: [AuthGuard]
```

## Step 4
We will add the following nice additions:

	* Setup silent refresh
	* Setup keeping state
	* Setup roles

branch: `state-and-beyond`
	* Go to `auth.service.ts`
```
setup() {
	…
	this.oAuthService.setupAutomaticSilentRefresh();
	…
}
```
- - - -
	* Go to `auth.guard.ts`
```
if (this.authService.hasValidIdToken()) {
  return true;
}
this.authService.login(state.url);
return false;

```
	* Go to `auth.service.ts`
```
constructor(private oAuthService: OAuthService, private router: Router) {}
```
```
login(targetUrl: string = this.router.url) {
  this.oAuthService.initCodeFlow(targetUrl);
}

```
```
this.oAuthService.events.subscribe(e => {
  this._user$.next(this.getClaims());
  if (e.type === ‘token_received’ && this.oAuthService.state) {
    this.router.navigateByUrl(this.oAuthService.state);
  }
});
```
- - - -
	* Go to `auth.service.ts`
```
isAdmin$ = this.user$.pipe(
  filter(user => !!user),
  map(user => (user && user.roles ? user.roles.includes(‘ADMIN’) : false))
);
```
Go to `properties.component.ts`
```
hasRights = false;
…
constructor(public api: ApiService, private authService: AuthService) {}
…
ngOnInit() {
	…
  this.isAdmin();
}
private isAdmin() {
  this.authService.isAdmin$
    .pipe(takeUntil(this.destroy$))
    .subscribe(isAdmin => (this.hasRights = isAdmin));
}
```
Go to `properties.component.html`
On add, edit and delete actions:
```
<button *ngIf=“hasRights”…></button>
```

## Step 5
Switching to auth0

branch: `auth0`

	* Go to auth.config.json
```
{
  “jwksUri”: “https://jonatanm.eu.auth0.com/.well-known/jwks.json”,
  “issuer”: “https://jonatanm.eu.auth0.com/“,
  “clientId”: “j6rEDVKcrAGW3CPegUxPlEgQUUpjVYnd”
}
```
	* Go to `app.module.ts`
```
OAuthModule.forRoot({
  resourceServer: {
    allowedUrls: [‘https://immo-keycloak.meys.io', ‘https://immo-auth0.meys.io’],
    sendAccessToken: true,
  },
}),
```
	* Go to `api.service.ts`
```
const API = ‘https://immo-auth0.meys.io/api’;
```
	* Go to `auth.service.ts`
```
config: AuthConfig = {
  …
  customQueryParams: {
    audience: 'https://immo-auth0.meys.io',
  },
};
```
