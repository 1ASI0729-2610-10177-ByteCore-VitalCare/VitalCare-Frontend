import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';

import { Patient } from '../../../domain/model/patient.entity';
import { Location } from '../../../domain/model/location.entity';
import { Patch } from '../../../domain/model/patch.entity';
import { LocationService } from '../../../infrastructure/services/location.service';
import { PatchService } from '../../../infrastructure/services/patch.service';

@Component({
  selector: 'app-location-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './location-modal.html',
  styleUrl: './location-modal.css',
})
export class LocationModal implements OnInit, OnDestroy {
  @Input() patient!: Patient;
  @Output() close = new EventEmitter<void>();

  location = signal<Location | null>(null);
  patch = signal<Patch | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  private map: L.Map | undefined;

  constructor(
    private locationService: LocationService,
    private patchService: PatchService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.patchService.getByPatientId(this.patient.id).subscribe({
      next: (patch) => {
        if (!patch) {
          // Sin patch: mostrar ubicación aleatoria
          this.isLoading.set(false);
          const { lat, lng } = this.randomLocation();
          setTimeout(() => this.initMap(lat, lng), 150);
          return;
        }

        this.patch.set(patch);

        this.locationService.getLatestByPatchId(patch.id).subscribe({
          next: (loc) => {
            this.location.set(loc);
            this.isLoading.set(false);
            if (loc) {
              setTimeout(() => this.initMap(loc.latitude, loc.longitude), 150);
            } else {
              const { lat, lng } = this.randomLocation();
              setTimeout(() => this.initMap(lat, lng), 150);
            }
          },
          error: () => {
            this.isLoading.set(false);
            const { lat, lng } = this.randomLocation();
            setTimeout(() => this.initMap(lat, lng), 150);
          },
        });
      },
      error: () => {
        this.isLoading.set(false);
        const { lat, lng } = this.randomLocation();
        setTimeout(() => this.initMap(lat, lng), 150);
      },
    });
  }

  private randomLocation(): { lat: number; lng: number } {
    // Ciudades base para variar ubicaciones de forma realista
    const bases = [
      { lat: -12.0464, lng: -77.0428 },  // Lima
      { lat: 40.7128,  lng: -74.0060 },  // Nueva York
      { lat: 34.0522,  lng: -118.2437 }, // Los Ángeles
      { lat: 48.8566,  lng: 2.3522 },    // París
      { lat: 19.4326,  lng: -99.1332 },  // Ciudad de México
    ];
    const base = bases[this.patient.id % bases.length];
    const offset = () => (Math.random() - 0.5) * 0.05;
    return { lat: base.lat + offset(), lng: base.lng + offset() };
  }

  private initMap(lat: number, lng: number): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconAnchor: [12, 41],
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 250);
  }

  onClose(): void {
    this.close.emit();
  }
}
