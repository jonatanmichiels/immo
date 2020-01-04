import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PropertiesRoutingModule } from './properties-routing.module';
import { PropertiesComponent } from './properties.component';

@NgModule({
  declarations: [PropertiesComponent],
  imports: [CommonModule, FormsModule, PropertiesRoutingModule],
})
export class PropertiesModule {}
