import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvmRecentArtifactsComponent } from './ivm-recent-artifacts.component';

describe('IvmRecentArtifactsComponent', () => {
  let component: IvmRecentArtifactsComponent;
  let fixture: ComponentFixture<IvmRecentArtifactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvmRecentArtifactsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvmRecentArtifactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
