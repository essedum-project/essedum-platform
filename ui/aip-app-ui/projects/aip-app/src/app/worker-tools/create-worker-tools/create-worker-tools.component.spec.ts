import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkerToolsComponent } from './create-worker-tools.component';

describe('CreateWorkerToolsComponent', () => {
  let component: CreateWorkerToolsComponent;
  let fixture: ComponentFixture<CreateWorkerToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWorkerToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWorkerToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
