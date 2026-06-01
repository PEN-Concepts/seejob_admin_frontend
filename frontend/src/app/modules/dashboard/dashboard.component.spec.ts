import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../services/api.service';

class MockApi { get = jest.fn().mockResolvedValue({ totalMembers: 1 }); }

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [{ provide: ApiService, useClass: MockApi as any }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load stats on init', async () => {
    await component.loadStats();
    expect(component.stats.totalMembers).toBe(1);
  });
});
