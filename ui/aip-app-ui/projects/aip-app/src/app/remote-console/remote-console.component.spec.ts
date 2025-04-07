import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteConsoleComponent } from './remote-console.component';

describe('RemoteConsoleComponent', () => {
  let component: RemoteConsoleComponent;
  let fixture: ComponentFixture<RemoteConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoteConsoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
