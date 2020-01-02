import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css'],
})
export class PropertiesComponent implements OnInit {
  properties$ = this.http.get('/api/properties');

  constructor(private http: HttpClient) {}

  ngOnInit() {}
}
