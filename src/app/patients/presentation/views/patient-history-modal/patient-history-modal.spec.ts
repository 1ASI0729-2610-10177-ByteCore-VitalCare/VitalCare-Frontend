import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHistoryModal } from './patient-history-modal';

describe('PatientHistoryModal', () => {
  let component: PatientHistoryModal;
  let fixture: ComponentFixture<PatientHistoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientHistoryModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientHistoryModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
