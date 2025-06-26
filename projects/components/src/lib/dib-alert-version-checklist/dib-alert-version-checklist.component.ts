import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Control, ControlMemberApi, TypeAttributes } from "@sassoftware/vi-api/control";
import { PageModel } from "@sassoftware/vi-api/page-model";
import { SviWindow } from "@sassoftware/vi-api";

@Component({
  selector: 'sol-dib-alert-version-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dib-alert-version-checklist.component.html',
  styleUrls: ['./dib-alert-version-checklist.component.css']  
})
export class DibAlertVersionChecklistComponent implements OnInit, OnDestroy {
  @Input() childNode!: Control;
  @Input() pageModel!: PageModel;
  @Input() controlApi!: ControlMemberApi<TypeAttributes, any>;

  constructor(private cdr: ChangeDetectorRef) {}

  sviWindow = window as SviWindow;
  alertId: string = "";
  pageMode: string | undefined;
  previousMode: string | undefined;
  modeWatcherInterval: any;

  alertDetailsArr: any;
  alertVersionsArr: any[] = [];
  checklistArr: any[] = [];

  internalEntityID: any;
  selectedAlertlistItem: any;
  selectedChecklistItem: any;

  isEditing: boolean = false;
  hasExistingRecord: boolean = false;

  internalEntityStoredObjectId: any;
  internalEntityObjectTypeName: any;

  reqBody = { filter: '', start: 0, limit: 1, depth: 1 };
  options: any = {
    headers: {
      "Accept": "application/vnd.sas.collection+json",
      "Content-Type": "application/vnd.sas.investigation.data.document.filter.request+json",
      "Accept-Item": "application/vnd.sas.investigation.data.enriched.document+json"
    }
  };

  apiObject = {
    comments: [],
    objectTypeName: '',
    objectTypeId: 0,
    fieldValues: {
      alert_id: '',
      curr_alerting_event_id: '',
      actionable_entity_id: '',
      actionable_entity_nm: '',
      actionable_entity_type_nm: '',
      alert_status_id: '',
      selected_checklist_label: '',
      selected_checklist_code: ''
    }
  };

  async ngOnInit(): Promise<void> {
    this.alertId = this.pageModel.data['alert_id'];
    this.pageMode = this.pageModel.mode;
    this.previousMode = this.pageMode;
    this.internalEntityStoredObjectId = this.childNode.typeAttributes['internalEntityStoredObjectID'];
    this.internalEntityObjectTypeName = this.childNode.typeAttributes['internalEntityObjectTypeName'];

    await this.getAlertDetails();
    await this.getAlertVersions();
    await this.getChecklistItems();

    if (this.alertVersionsArr.length) {
      this.selectedAlertlistItem = this.alertVersionsArr[0].alertingEventId;
      await this.onAlertListItemChange();
    }
    console.log("Entity Type",this.pageModel.type);
    if (this.pageModel.type === 'alerts') {
      this.pageModel?.mode === 'edit'; 
    }
    if (this.pageModel.type === 'alerts') console.log("Mode",this.pageModel.mode);
    this.startModeWatcher();
    console.log("Page Model",this.pageModel);
    
  }

  async getAlertDetails() {
    const result = await this.sviWindow.sas.vi.http.get(`/svi-alert/alerts/${this.alertId}`);
    const parsed = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    this.alertDetailsArr = parsed;
    console.log("Alert Details",result);
  }

  async getAlertVersions() {
    const result = await this.sviWindow.sas.vi.http.get(`/svi-alert/alertingEvents?filter=and(eq(alertId,%22${this.alertId}%22),eq(alertVersionNumber,1))&limit=9999&sortBy=creationTimeStamp:descending`);
    const parsed = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    this.alertVersionsArr = parsed?.items || [];
  }

  async getChecklistItems() {
    const result = await this.sviWindow.sas.vi.http.get(`/svi-datahub/admin/lists?name=dib_checklist`);
    const parsed = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    this.checklistArr = parsed?.items || [];
  }

  async onAlertListItemChange() {
    const eventId = this.selectedAlertlistItem;
    if (!eventId) return;

    this.reqBody.filter = `and(eq(alert_id,"${this.alertId}"),eq(curr_alerting_event_id,"${eventId}"))`;

    const result = await this.sviWindow.sas.vi.http.post(`/svi-datahub/documents/${this.internalEntityObjectTypeName}`, this.reqBody, this.options);
    console.log("result",result);
    
    const parsed = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    let record;
    parsed?.items?.length > 0 ? record = parsed?.items?.[0] : undefined;
    console.log("Internal Entity Record",record);
    
    if (record != undefined) {
      const checklistCode = record.fieldValues?.selected_checklist_code;
      this.selectedChecklistItem = checklistCode;
      this.internalEntityID = record.id;
      this.hasExistingRecord = true;
      this.isEditing = false;
    } else {
      this.selectedChecklistItem = null;
      this.hasExistingRecord = false;
      this.isEditing = true;
      this.updateApiObject(eventId);
    }

    this.cdr.detectChanges();
  }

  onListItemChange(): void {
    const selectedItem = this.checklistArr.find(item => item.code === this.selectedChecklistItem);
    if (!selectedItem) return;
    this.apiObject.fieldValues.selected_checklist_code = selectedItem.code;
    this.apiObject.fieldValues.selected_checklist_label = selectedItem.label;
    
  }

  updateApiObject(alertingEventId: string): void {
    this.apiObject.objectTypeId = parseInt(this.internalEntityStoredObjectId);
    this.apiObject.objectTypeName = this.internalEntityObjectTypeName;
    this.apiObject.comments = [];
    this.apiObject.fieldValues.alert_id = this.alertDetailsArr?.alertId;
    this.apiObject.fieldValues.curr_alerting_event_id = alertingEventId;
    this.apiObject.fieldValues.actionable_entity_id = this.alertDetailsArr?.actionableEntityId;
    this.apiObject.fieldValues.actionable_entity_nm = this.alertDetailsArr?.actionableEntityLabel;
    this.apiObject.fieldValues.actionable_entity_type_nm = this.alertDetailsArr?.actionableEntityType;
    this.apiObject.fieldValues.alert_status_id = this.alertDetailsArr?.alertStatusId;
  }

  async saveAlertVersionChecklist() {
    const result = await this.sviWindow.sas.vi.http.post(`/svi-datahub/documents`, this.apiObject);
    if (result.status === 201) {
      window.alert("Data Saved Successfully!");
      this.hasExistingRecord = true;
      this.isEditing = false;
    }
  }

  toggleEditSave(): void {
    if (this.isEditing) {
      console.log("isEditing",this.isEditing);
      this.onListItemChange();
      this.updateApiObject(this.selectedAlertlistItem);
      console.log("Api Object",this.apiObject);
      this.saveAlertVersionChecklist();
    } else {
      this.updateApiObject(this.selectedAlertlistItem);
      this.updateRecord(this.apiObject);
      this.isEditing = true;
    }
  }

  async updateRecord(apiObject:any) {
    await this.sviWindow.sas.vi.http.get(`/svi-datahub/documents/${this.internalEntityObjectTypeName}/${this.internalEntityID}`).then(async (getResult) =>{
        if(getResult.status == 200){
            console.log("Document Got Successfully",getResult);
            const parsed = typeof getResult.body === 'string' ? JSON.parse(getResult.body) : getResult.body;
            console.log("parsed get response",parsed);
            parsed.fieldValues.selected_checklist_code = apiObject.fieldValues.selected_checklist_code;
            parsed.fieldValues.selected_checklist_label = apiObject.fieldValues.selected_checklist_label;
            console.log("Updated checklist code",parsed.fieldValues.selected_checklist_code);
            console.log("Updated checklist label",parsed.fieldValues.selected_checklist_label);
            await this.sviWindow.sas.vi.http.post(`/svi-datahub/locks/documents?type=${this.internalEntityObjectTypeName}&id=${this.internalEntityID}`,null).then(async (lockResult) => {
                if(lockResult.status == 201){
                    console.log("Document Locked Successfully");
                    await this.sviWindow.sas.vi.http.put(`/svi-datahub/documents/${this.internalEntityObjectTypeName}/${this.internalEntityID}`,parsed).then(async (result) => {
                        if(result.status == 200){
                            await this.sviWindow.sas.vi.http.delete(`/svi-datahub/locks/documents?type=${this.internalEntityObjectTypeName}&id=${this.internalEntityID}`).then(async (unlockResult) => {
                              console.log("Record Updated Successfully...");
                              alert("Alert Version Updated Successfully!");
                              this.controlApi.page.cancelEdit(false);
                            });
                          }
                        });
                      }
                    });
                  }
                });

  }

  get isViewMode(): boolean {
    return this.pageModel?.mode === 'view';
  }

  startModeWatcher(): void {
    this.modeWatcherInterval = setInterval(() => {
      if (!this.pageModel) return;
      const currentMode = this.pageModel.mode;
      if (currentMode !== this.previousMode) {
        this.previousMode = currentMode;
        this.cdr.detectChanges();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    clearInterval(this.modeWatcherInterval);
  }
}
