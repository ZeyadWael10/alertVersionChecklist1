import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DibAlertVersionChecklistModule } from './lib/dib-alert-version-checklist/dib-alert-version-checklist.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    DibAlertVersionChecklistModule,
    BrowserModule,
    BrowserAnimationsModule, // Required for animations
  ],
  providers: [],
})
export class ComponentsAppModule {
}

