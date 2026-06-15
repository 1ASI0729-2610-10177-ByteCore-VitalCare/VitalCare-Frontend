import { Injectable } from '@angular/core';
import { Patient } from '../../domain/model/patient.entity';

export interface GeneratedVitalSign {
  patient: Patient;
  temperature: number;
  heartRate: number;
  bloodPressure: number;
  glucoseLevel: number;
  oxygenSaturation: number;
  lactateConcentration: number;
  humidity: number;
  sodiumPotassium: number;
  alcoholLevel: number;
  ketones: number;
  cytokines: number;
  specializedCells: number;
  atmosphericPressure: number;
  airQuality: number;
  alerts: VitalAlert[];
}

export interface VitalAlert {
  patientName: string;
  parameter: string;
  value: string;
  status: 'WARNING' | 'CRITICAL';
}

@Injectable({ providedIn: 'root' })
export class VitalSignGeneratorService {

  // ~25% de probabilidad de que un valor salga del rango normal
  private readonly ALERT_CHANCE = 0.25;

  private rand(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
  }

  private maybeOutOfRange(normalMin: number, normalMax: number, alertMin: number, alertMax: number): number {
    if (Math.random() < this.ALERT_CHANCE) {
      // Salir del rango: arriba o abajo
      return Math.random() < 0.5
        ? this.rand(alertMin, normalMin - 0.1)
        : this.rand(normalMax + 0.1, alertMax);
    }
    return this.rand(normalMin, normalMax);
  }

  generateForPatients(patients: Patient[]): GeneratedVitalSign[] {
    return patients.map(patient => this.generateForPatient(patient));
  }

  generateForPatient(patient: Patient): GeneratedVitalSign {
    const temperature      = this.maybeOutOfRange(36.0, 37.5,  34.0, 41.0);
    const heartRate        = this.maybeOutOfRange(60,   100,   30,   150);
    const bloodPressure    = this.maybeOutOfRange(90,   130,   60,   180);
    const glucoseLevel     = this.maybeOutOfRange(70,   110,   40,   200);
    const oxygenSaturation = this.maybeOutOfRange(95,   100,   80,   100);
    const lactateConcentration = this.rand(0.5, 2.0);
    const humidity         = this.rand(30, 70);
    const sodiumPotassium  = this.rand(135, 145);
    const alcoholLevel     = this.rand(0, 0.05);
    const ketones          = this.rand(0.1, 1.0);
    const cytokines        = this.rand(1.0, 10.0);
    const specializedCells = this.rand(4.5, 11.0);
    const atmosphericPressure = this.rand(990, 1020);
    const airQuality       = this.rand(10, 50);

    const alerts: VitalAlert[] = [];

    if (temperature < 36.0 || temperature > 37.5) {
      alerts.push({
        patientName: patient.name,
        parameter: 'Temperatura',
        value: `${temperature}°C`,
        status: temperature > 39.0 || temperature < 35.0 ? 'CRITICAL' : 'WARNING',
      });
    }
    if (heartRate < 60 || heartRate > 100) {
      alerts.push({
        patientName: patient.name,
        parameter: 'Frecuencia cardíaca',
        value: `${heartRate} bpm`,
        status: heartRate > 130 || heartRate < 40 ? 'CRITICAL' : 'WARNING',
      });
    }
    if (bloodPressure < 90 || bloodPressure > 130) {
      alerts.push({
        patientName: patient.name,
        parameter: 'Presión arterial',
        value: `${bloodPressure} mmHg`,
        status: bloodPressure > 160 || bloodPressure < 70 ? 'CRITICAL' : 'WARNING',
      });
    }
    if (glucoseLevel < 70 || glucoseLevel > 110) {
      alerts.push({
        patientName: patient.name,
        parameter: 'Glucosa',
        value: `${glucoseLevel} mg/dL`,
        status: glucoseLevel > 180 || glucoseLevel < 50 ? 'CRITICAL' : 'WARNING',
      });
    }
    if (oxygenSaturation < 95) {
      alerts.push({
        patientName: patient.name,
        parameter: 'Saturación O₂',
        value: `${oxygenSaturation}%`,
        status: oxygenSaturation < 88 ? 'CRITICAL' : 'WARNING',
      });
    }

    return {
      patient, temperature, heartRate, bloodPressure, glucoseLevel, oxygenSaturation,
      lactateConcentration, humidity, sodiumPotassium, alcoholLevel, ketones,
      cytokines, specializedCells, atmosphericPressure, airQuality, alerts,
    };
  }
}
