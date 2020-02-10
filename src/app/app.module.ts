import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { /* HTTP_INTERCEPTORS, */ HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { BearerTokenInterceptor } from './bearer-token-interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['https://immo-keycloak.meys.io', 'https://immo-auth0.meys.io'],
        sendAccessToken: true,
      },
    }),
  ],
  bootstrap: [AppComponent],
  // providers: [
  //   {
  //     provide: HTTP_INTERCEPTORS,
  //     useClass: BearerTokenInterceptor,
  //     multi: true,
  //   },
  // ],
})
export class AppModule {}
