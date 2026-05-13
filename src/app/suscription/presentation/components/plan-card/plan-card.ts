import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Plan } from '../../../domain/model/plan.entity';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-card.html',
  styleUrls: ['./plan-card.css'],
})
export class PlanCard {
  @Input({ required: true }) plan!: Plan;

  @Input() isActive: boolean = false;
}
