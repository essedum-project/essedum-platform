import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEnchrichmentComponent } from './data-enchrichment.component';

describe('DataEnchrichmentComponent', () => {
  let component: DataEnchrichmentComponent;
  let fixture: ComponentFixture<DataEnchrichmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataEnchrichmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataEnchrichmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
