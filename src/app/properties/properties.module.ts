import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { PropertiesRoutingModule } from './properties-routing.module';
import { PropertiesComponent } from './properties.component';

@NgModule({
  declarations: [PropertiesComponent],
  imports: [CommonModule, PropertiesRoutingModule, HttpClientModule],
})
export class PropertiesModule {}
