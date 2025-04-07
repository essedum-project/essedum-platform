import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusteringComponent } from './clustering.component';

describe('ClusteringComponent', () => {
  let component: ClusteringComponent;
  let fixture: ComponentFixture<ClusteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClusteringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClusteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
