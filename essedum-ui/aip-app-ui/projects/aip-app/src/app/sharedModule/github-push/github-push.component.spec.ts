import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GitHubPushComponent } from './github-push.component';

describe('GitHubPushComponent', () => {
  let component: GitHubPushComponent;
  let fixture: ComponentFixture<GitHubPushComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GitHubPushComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GitHubPushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
