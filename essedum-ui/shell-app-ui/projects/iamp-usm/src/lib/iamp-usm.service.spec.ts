import { TestBed } from '@angular/core/testing';

import { IampUsmService } from './iamp-usm.service';

describe('IampUsmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IampUsmService = TestBed.get(IampUsmService);
    expect(service).toBeTruthy();
  });
});
