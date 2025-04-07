import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureTemplatesComponent } from './configure-templates.component';

describe('ConfigureTemplatesComponent', () => {
  let component: ConfigureTemplatesComponent;
  let fixture: ComponentFixture<ConfigureTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigureTemplatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigureTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
