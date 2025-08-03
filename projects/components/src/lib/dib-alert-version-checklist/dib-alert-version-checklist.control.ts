import { ControlType } from "@sassoftware/vi-api/config";

export const control = {
  category: "Fields",
  controlDescription: {
    defaultText: "dibAlertVersionChecklist"
  },
  directiveName: "sol-dib-alert-version-checklist",
  displayName: {
    defaultText: "dibAlertVersionChecklist"
  },
  name: "dibAlertVersionChecklist",
  controlAttributes: {
    attributes: {
      internalEntityStoredObjectID:{
        displayName:{
          defaultText:'Internal Entity Stored Object ID'
        },
        type:"TextInput"
      },
      internalEntityObjectTypeName:{
        displayName:{
          defaultText:'Internal Entity Object Type Name'
        },
        type:"TextInput"
      },
      alertVersionJobPath:{
        displayName:{
          defaultText:'Alert Version Job Path'
        },
        type:"TextInput"
      }
    },
    metadata: {
      renderAs: ControlType.WebComponent,
      states: {
        readOnly: true,
        required: true
      }
    }
  }
};
