import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DibAlertVersionChecklistComponent } from "./dib-alert-version-checklist.component";

describe("DibAlertVersionChecklistComponent", () => {
  let component: DibAlertVersionChecklistComponent;
  let fixture: ComponentFixture<DibAlertVersionChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DibAlertVersionChecklistComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DibAlertVersionChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
