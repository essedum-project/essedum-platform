import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AipComponent } from './aip.component';

describe('AipComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AipComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AipComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'aip-app'`, () => {
    const fixture = TestBed.createComponent(AipComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('aip-app');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AipComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('aip-app app is running!');
  });
});
