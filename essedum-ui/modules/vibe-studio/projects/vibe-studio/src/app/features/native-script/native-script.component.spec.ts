import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeScriptComponent } from './native-script.component';

describe('NativeScriptComponent', () => {
  let component: NativeScriptComponent;
  let fixture: ComponentFixture<NativeScriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NativeScriptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NativeScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
