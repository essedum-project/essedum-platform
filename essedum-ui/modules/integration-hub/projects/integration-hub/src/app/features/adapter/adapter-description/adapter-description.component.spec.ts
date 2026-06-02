import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdapterDescriptionComponent } from './adapter-description.component';

describe('AdapterDescriptionComponent', () => {
  let component: AdapterDescriptionComponent;
  let fixture: ComponentFixture<AdapterDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdapterDescriptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdapterDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
