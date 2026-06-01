import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactRequestComponent } from './contact-request.component';

describe('ContactRequestComponent', () => {
  let component: ContactRequestComponent;
  let fixture: ComponentFixture<ContactRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
