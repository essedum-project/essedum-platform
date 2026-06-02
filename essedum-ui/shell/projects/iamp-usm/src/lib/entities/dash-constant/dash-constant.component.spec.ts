import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashConstantComponent } from './dash-constant.component';

describe('DashConstantComponent', () => {
  let component: DashConstantComponent;
  let fixture: ComponentFixture<DashConstantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashConstantComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashConstantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
