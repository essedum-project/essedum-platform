import { TestBed } from '@angular/core/testing';

import { ItsmService } from './itsm.service';

describe('ItsmService', () => {
  let service: ItsmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItsmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
