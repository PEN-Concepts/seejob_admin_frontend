import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

class MockApi {
  post = jest.fn().mockResolvedValue({ token: 'abc' });
}

describe('AuthService', () => {
  let service: AuthService;
  let api: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: ApiService, useClass: MockApi as any }]
    });
    service = TestBed.inject(AuthService);
    api = TestBed.inject(ApiService as any);
    localStorage.clear();
  });

  it('should login and store token', async () => {
    await service.login('a', 'b');
    expect(localStorage.getItem('token')).toBe('abc');
  });
});
