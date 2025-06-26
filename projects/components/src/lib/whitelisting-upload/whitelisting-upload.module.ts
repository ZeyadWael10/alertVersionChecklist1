import { APP_INITIALIZER, Injector, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WhitelistingUploadComponent } from "./whitelisting-upload.component";
import { createCustomElement } from "@angular/elements";
import { control } from './whitelisting-upload.control';
import { SviWindow } from "@sassoftware/vi-api";

@NgModule({
  imports: [CommonModule, FormsModule, WhitelistingUploadComponent],
  exports: [WhitelistingUploadComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (injector: Injector) => {
        return () => {
          customElements.define(
            control.directiveName,
            createCustomElement(WhitelistingUploadComponent, { injector: injector })
          );
          
          const sviWindow = window as SviWindow;
          sviWindow.sas.vi?.config.registerSolutionExtension(control);
        };
      },
      deps: [Injector],
    },
  ],
})
export class WhitelistingUploadModule {}
