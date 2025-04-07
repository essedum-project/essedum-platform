import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeStructureComponent } from './tree-structure.component';

describe('TreeStructureComponent', () => {
  let component: TreeStructureComponent;
  let fixture: ComponentFixture<TreeStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeStructureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
