import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsNodeComponent } from './js-node.component';

describe('JsNodeComponent', () => {
  let component: JsNodeComponent;
  let fixture: ComponentFixture<JsNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsNodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
