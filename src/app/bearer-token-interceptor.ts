import { Injectable, Optional } from '@angular/core';
import {
  OAuthStorage,
  OAuthResourceServerErrorHandler,
  OAuthModuleConfig,
} from 'angular-oauth2-oidc';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  constructor(
    private authStorage: OAuthStorage,
    private errorHandler: OAuthResourceServerErrorHandler,
    @Optional() private moduleConfig: OAuthModuleConfig
  ) {}

  private checkUrl(url: string): boolean {
    const found = this.moduleConfig.resourceServer.allowedUrls.find(u =>
      url.startsWith(u)
    );
    return !!found;
  }

  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const url = req.url.toLowerCase();

    console.log(url);

    if (!this.moduleConfig) {
      return next.handle(req);
    }
    if (!this.moduleConfig.resourceServer) {
      return next.handle(req);
    }
    if (!this.moduleConfig.resourceServer.allowedUrls) {
      return next.handle(req);
    }
    if (!this.checkUrl(url)) {
      return next.handle(req);
    }

    const sendAccessToken = this.moduleConfig.resourceServer.sendAccessToken;

    if (sendAccessToken) {
      const token = this.authStorage.getItem('access_token');
      const header = 'Bearer ' + token;

      const headers = req.headers.set('Authorization', header);

      req = req.clone({ headers });
    }

    return next.handle(req).pipe(catchError(err => of(err)));
  }
}
