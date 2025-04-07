import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginDialogComponent } from './plugin-dialog.component';

describe('PluginDialogComponent', () => {
  let component: PluginDialogComponent;
  let fixture: ComponentFixture<PluginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PluginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
