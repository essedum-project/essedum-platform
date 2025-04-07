import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotateConfigComponent } from './annotate-config.component';

describe('AnnotateConfigComponent', () => {
  let component: AnnotateConfigComponent;
  let fixture: ComponentFixture<AnnotateConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotateConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnotateConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
