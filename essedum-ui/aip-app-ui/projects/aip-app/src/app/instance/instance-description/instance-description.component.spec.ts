import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstanceDescriptionComponent } from './instance-description.component';

describe('InstanceDescriptionComponent', () => {
  let component: InstanceDescriptionComponent;
  let fixture: ComponentFixture<InstanceDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstanceDescriptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstanceDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
