import { APP_INITIALIZER, Injector, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DibAlertVersionChecklistComponent } from "./dib-alert-version-checklist.component";
import { createCustomElement } from "@angular/elements";
import { control } from './dib-alert-version-checklist.control';
import { SviWindow } from "@sassoftware/vi-api";

@NgModule({
  imports: [CommonModule, FormsModule, DibAlertVersionChecklistComponent],
  exports: [DibAlertVersionChecklistComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (injector: Injector) => {
        return () => {
          customElements.define(
            control.directiveName,
            createCustomElement(DibAlertVersionChecklistComponent, { injector: injector })
          );
          
          const sviWindow = window as SviWindow;
          sviWindow.sas.vi?.config.registerSolutionExtension(control);
        };
      },
      deps: [Injector],
    },
  ],
})
export class DibAlertVersionChecklistModule {}
