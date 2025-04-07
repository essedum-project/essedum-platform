import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AibrainViewComponent } from './aibrain-view.component';

describe('AibrainViewComponent', () => {
  let component: AibrainViewComponent;
  let fixture: ComponentFixture<AibrainViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AibrainViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AibrainViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
