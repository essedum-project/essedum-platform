import { TestBed } from '@angular/core/testing';

import { PermissionApiService } from './permission-api.service';

describe('PermissionApiService', () => {
  let service: PermissionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
