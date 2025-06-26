import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WhitelistingUploadComponent } from "./whitelisting-upload.component";

describe("WhitelistingUploadComponent", () => {
  let component: WhitelistingUploadComponent;
  let fixture: ComponentFixture<WhitelistingUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhitelistingUploadComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhitelistingUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
