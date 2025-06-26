import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DibAlertVersionChecklistModule } from './lib/dib-alert-version-checklist/dib-alert-version-checklist.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgToastModule } from 'ng-angular-popup';
import { WhitelistingUploadModule } from './lib/whitelisting-upload/whitelisting-upload.module';

@NgModule({
  imports: [
    DibAlertVersionChecklistModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule, // Required for animations
    NgToastModule, WhitelistingUploadModule
  ],
  providers: [],
})
export class ComponentsAppModule {
}

