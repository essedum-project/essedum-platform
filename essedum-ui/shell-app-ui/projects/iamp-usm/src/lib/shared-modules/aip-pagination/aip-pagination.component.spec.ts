import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AipPaginationsComponent } from './aip-pagination.component';

describe('AipPaginationComponent', () => {
  let component: AipPaginationsComponent;
  let fixture: ComponentFixture<AipPaginationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipPaginationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipPaginationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
