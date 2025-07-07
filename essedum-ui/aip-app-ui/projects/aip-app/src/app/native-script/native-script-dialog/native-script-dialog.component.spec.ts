import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeScriptDialogComponent } from './native-script-dialog.component';

describe('NativeScriptDialogComponent', () => {
  let component: NativeScriptDialogComponent;
  let fixture: ComponentFixture<NativeScriptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NativeScriptDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NativeScriptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
