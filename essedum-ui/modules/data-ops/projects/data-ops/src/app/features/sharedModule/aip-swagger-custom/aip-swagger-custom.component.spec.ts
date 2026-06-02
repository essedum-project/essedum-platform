import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AipSwaggerCustomComponent } from './aip-swagger-custom.component';

describe('AipSwaggerCustomComponent', () => {
  let component: AipSwaggerCustomComponent;
  let fixture: ComponentFixture<AipSwaggerCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipSwaggerCustomComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AipSwaggerCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
