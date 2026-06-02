import { TestBed } from '@angular/core/testing';

import { RaiservicesService } from './raiservices.service';

describe('RaiservicesService', () => {
  let service: RaiservicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RaiservicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
