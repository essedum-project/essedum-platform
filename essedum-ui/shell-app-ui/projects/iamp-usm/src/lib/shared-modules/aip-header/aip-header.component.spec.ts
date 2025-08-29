import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AipHeadersComponent } from './aip-header.component';

describe('AipHeadersComponent', () => {
  let component: AipHeadersComponent;
  let fixture: ComponentFixture<AipHeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AipHeadersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AipHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
