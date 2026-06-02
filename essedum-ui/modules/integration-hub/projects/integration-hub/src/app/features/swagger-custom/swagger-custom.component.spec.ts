import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerCustomComponent } from './swagger-custom.component';

describe('SwaggerCustomComponent', () => {
  let component: SwaggerCustomComponent;
  let fixture: ComponentFixture<SwaggerCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SwaggerCustomComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
