import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

class MockAuth { login = jest.fn().mockResolvedValue(undefined); }
class MockRouter { navigate = jest.fn(); }

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useClass: MockAuth as any },
        { provide: Router, useClass: MockRouter as any }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call auth.login and navigate on submit', async () => {
    component.email = 'a';
    component.password = 'b';
    await component.login();
    const auth = TestBed.inject(AuthService as any) as any;
    expect(auth.login).toHaveBeenCalled();
    const router = TestBed.inject(Router as any) as any;
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
