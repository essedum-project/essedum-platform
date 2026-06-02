import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowOutputArtifactsComponent } from './show-output-artifacts.component';

describe('ShowOutputArtifactsComponent', () => {
  let component: ShowOutputArtifactsComponent;
  let fixture: ComponentFixture<ShowOutputArtifactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowOutputArtifactsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowOutputArtifactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
