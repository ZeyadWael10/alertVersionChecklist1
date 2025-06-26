import { ControlType } from "@sassoftware/vi-api/config";

export const control = {
  category: "Fields",
  controlDescription: {
    defaultText: "whitelistingUpload"
  },
  directiveName: "sol-whitelisting-upload",
  displayName: {
    defaultText: "whitelistingUpload"
  },
  name: "whitelistingUpload",
  controlAttributes: {
    attributes: {
      internalEntityStoredObjectID:{
        displayName:{
          defaultText:'Internal Entity Stored Object ID'
        },
        type:"TextInput"
      },
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
