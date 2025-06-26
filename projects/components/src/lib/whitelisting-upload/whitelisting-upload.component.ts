import { Component, OnInit, Input, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Control, ControlMemberApi, TypeAttributes } from "@sassoftware/vi-api/control";
import { PageModel } from "@sassoftware/vi-api/page-model";
import { SviWindow } from "@sassoftware/vi-api";
import * as XLSX from 'xlsx';


@Component({
  selector: 'sol-whitelisting-upload',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './whitelisting-upload.component.html',
  styleUrls: ['./whitelisting-upload.component.css']  
})
export class WhitelistingUploadComponent implements OnInit {
  @Input() childNode!: Control;
  @Input() pageModel!: PageModel;
  @Input() controlApi!: ControlMemberApi<TypeAttributes, any>

  constructor(private ngZone: NgZone) {
  }

  parsedData: any[] = [];
  sviWindow = window as SviWindow;
  options: any = {
    headers: {
      "Accept": "application/vnd.sas.datahub.file+json",
      "Content-Type": "application/vnd.sas.datahub.file+json",
    }
  };
  showConfirm = false;
  viewMode= false;
  fileDetails: { original: File, name: string, description?: string }[] = [];
  confirmedFiles: FileList | null = null;

  ngOnInit(): void {
    console.log("Page Model",this.pageModel);
    this.controlApi.page.onChange((change) => {
      if (change.type === 'mode') {
        this.ngZone.run(() => {
          this.viewMode = change.value.new === 'view';
          console.log('Updated viewMode:', this.viewMode);
        });
      }
    });



  }


  confirmUpload(files: FileList | null): void {
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    this.fileDetails = Array.from(files).map(file => ({
      original: file,
      name: file.name, // default to original name
      description: ''
    }));

    this.showConfirm = true;
  }

  cancelUpload(): void {
    this.showConfirm = false;
    this.fileDetails = [];
  }
  
  async uploadFiles() {
    this.showConfirm = false;

    for (let fileMeta of this.fileDetails) {
      await this.sviWindow.sas.vi.file.uploadToViFolder(fileMeta.original).then(async (resp) => {
        console.log("Uploaded:", resp);

        const metadata = {
          name: fileMeta.name,
          description: fileMeta.description || '',
          location: `/files/files/${resp.id}`,
          type: resp.type,
          size: resp.size,
        };

        console.log("Metadata:", metadata);

        await this.sviWindow.sas.vi.http.post(
          `/svi-datahub/documents/${this.controlApi.page.objectName}/${this.controlApi.page.objectId}/attachments`,
          metadata,
          this.options
        ).then((res) => {
          console.log("Attachment saved:", res);
        });
      });
    }

    const parsePromises = this.fileDetails.map(fileMeta => {
      const file = fileMeta.original;
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
        alert(`Unsupported file type: ${file.name}`);
        return Promise.resolve();
      }

      return this.readAndParseFile(file).then(async parsed => {
        console.log(`Parsed content of ${file.name}:`, parsed);

        const keyMap: Record<string, string> = {
          "party name": "party_name",
          "party number": "party_number"
        };

        const maskedRecords = parsed.map(row => {
          const newRow: any = {};
          for (const key in row) {
            const normalizedKey = key.trim().toLowerCase();
            const mappedKey = keyMap[normalizedKey];
            if (mappedKey) {
              let value = row[key];
              if (mappedKey === 'party_number' && value != null) {
                value = String(value);
              }
              newRow[mappedKey] = value;
            }
          }


          return {
            objectTypeId: this.childNode.typeAttributes['internalEntityStoredObjectID'], // make it dynamically 
            fieldValues: {
              party_name: newRow.party_name || '',
              party_number: newRow.party_number || ''
            }
          };
        });

        if (!Array.isArray(this.pageModel.data['whitelist_record'])) {
          this.pageModel.data['whitelist_record'] = [];
        }

        await this.pageModel.data['whitelist_record'].push(...maskedRecords);
        console.log("Updated whitelist_record:", this.pageModel.data['whitelist_record']);
        console.log("Page Model Data",this.pageModel.data);
        await this.controlApi.page.save(true, false);
        this.controlApi.page.refreshAttachments();
      }).catch(err => {
        alert(`Error reading ${file.name}`);
        console.error(`Error reading ${file.name}:`, err);
      });
    });

  }



  readAndParseFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assume first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        resolve(json);
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }


}
