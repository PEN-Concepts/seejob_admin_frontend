import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform GET requests to the base url', async () => {
    const mock = { ok: true };
    service.get('/test').then((res: any) => {
      expect(res).toEqual(mock);
    });

    const req = http.expectOne(service.base + '/test');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
