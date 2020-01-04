import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Property } from './properties/property';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getProperties$(): Observable<[Property]> {
    return this.http
      .get<[Property]>('/api/properties')
      .pipe(catchError(err => throwError(err)));
  }

  createProperty$(property: Partial<Property>): Observable<{}> {
    return this.http
      .post<Property>('/api/properties', property)
      .pipe(catchError(err => throwError(err)));
  }

  updateProperty$(property: Partial<Property>): Observable<{}> {
    return this.http
      .put<Property>(`/api/properties/${property.id}`, property)
      .pipe(catchError(err => throwError(err)));
  }

  destroyProperty$(id: number): Observable<{}> {
    return this.http
      .delete<number>(`/api/properties/${id}`)
      .pipe(catchError(err => throwError(err)));
  }
}
