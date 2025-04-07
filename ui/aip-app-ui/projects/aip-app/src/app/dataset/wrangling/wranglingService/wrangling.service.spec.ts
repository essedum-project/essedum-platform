import { TestBed } from '@angular/core/testing';

import { WranglingService } from './wrangling.service';

describe('WranglingService', () => {
  let service: WranglingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WranglingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
