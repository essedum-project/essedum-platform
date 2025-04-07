import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginViewComponent } from './plugin-view.component';

describe('PluginViewComponent', () => {
  let component: PluginViewComponent;
  let fixture: ComponentFixture<PluginViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PluginViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
