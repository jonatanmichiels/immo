import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Property } from './properties/property';

const API = 'https://immo-auth0.meys.io/api';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getProperties$(): Observable<Property[]> {
    return this.http.get<[Property]>(`${API}/properties`).pipe(
      map(arr => arr.map(p => ({ ...p, type: p.type.toLowerCase() }))),
      catchError(err => throwError(err))
    );
  }

  createProperty$(property: Partial<Property>): Observable<{}> {
    return this.http
      .post<Property>(`${API}/properties`, property)
      .pipe(catchError(err => throwError(err)));
  }

  updateProperty$(property: Partial<Property>): Observable<{}> {
    return this.http
      .put<Property>(`${API}/properties/${property.id}`, property)
      .pipe(catchError(err => throwError(err)));
  }

  destroyProperty$(id: string): Observable<{}> {
    return this.http
      .delete<number>(`${API}/properties/${id}`)
      .pipe(catchError(err => throwError(err)));
  }
}
