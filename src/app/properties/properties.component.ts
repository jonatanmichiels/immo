import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { Property } from './property';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css'],
})
export class PropertiesComponent implements OnInit {
  properties$: Observable<[Property]> = this.api.getProperties$();

  constructor(public api: ApiService) {}

  ngOnInit() {}
}
