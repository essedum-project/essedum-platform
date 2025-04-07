import { TestBed } from '@angular/core/testing';

import { WranglingUtilsService } from './wrangling-utils.service';

describe('WranglingUtilsService', () => {
  let service: WranglingUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WranglingUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
