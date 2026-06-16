import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { VitalAlert } from '../../../infrastructure/services/vital-sign-generator.service';

@Component({
  selector: 'app-vital-alert-banner',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './vital-alert-banner.html',
  styleUrl: './vital-alert-banner.css',
})
export class VitalAlertBanner {
  @Input() alerts: VitalAlert[] = [];
  @Output() dismiss = new EventEmitter<void>();
}
