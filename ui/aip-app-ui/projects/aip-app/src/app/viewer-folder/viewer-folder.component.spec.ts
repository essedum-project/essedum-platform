import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerFolderComponent } from './viewer-folder.component';

describe('ViewerFolderComponent', () => {
  let component: ViewerFolderComponent;
  let fixture: ComponentFixture<ViewerFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerFolderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
