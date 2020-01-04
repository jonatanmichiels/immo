import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../api.service';
import { Subject, Observable } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { Property } from './property';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css'],
})
export class PropertiesComponent implements OnInit, OnDestroy {
  currentProperty: Partial<Property> = undefined;
  properties: [Property] = undefined;

  destroy$: Subject<boolean> = new Subject<boolean>();
  fetchProperties$: Observable<[Property]> = this.api
    .getProperties$()
    .pipe(takeUntil(this.destroy$));

  constructor(public api: ApiService) {}

  ngOnInit() {
    this.fetchProperties$.subscribe(res => this.setProperties(res));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  create() {
    this.currentProperty = {};
  }

  update(property: Property) {
    this.currentProperty = Object.assign({}, property);
  }

  destroy({ id }: Property) {
    window.alert('Are you sure?');

    this.api
      .destroyProperty$(id)
      .pipe(
        switchMap(() => this.fetchProperties$),
        takeUntil(this.destroy$)
      )
      .subscribe(res => this.setProperties(res));
  }

  submit() {
    if (!this.currentProperty) {
      return (this.currentProperty = undefined);
    }

    if (this.currentProperty.id) {
      this.api
        .updateProperty$(this.currentProperty)
        .pipe(
          switchMap(() => this.fetchProperties$),
          takeUntil(this.destroy$)
        )
        .subscribe(res => this.setProperties(res));
    } else {
      this.api
        .createProperty$(this.currentProperty)
        .pipe(
          switchMap(() => this.fetchProperties$),
          takeUntil(this.destroy$)
        )
        .subscribe(res => this.setProperties(res));
    }

    this.currentProperty = undefined;
  }

  resetForm() {
    this.currentProperty = undefined;
  }

  private setProperties(res: [Property]) {
    this.currentProperty = undefined;
    this.properties = res;
  }
}
