import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Plan } from '../../../domain/model/plan.entity';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './plan-card.html',
  styleUrls: ['./plan-card.css'],
})
export class PlanCard {
  @Input({ required: true }) plan!: Plan;
  @Input() isActive: boolean = false;
  @Input() isRecommended: boolean = false;

  @Output() selectPlan = new EventEmitter<Plan>();

  onSelect(): void {
    if (!this.isActive) {
      this.selectPlan.emit(this.plan);
    }
  }
}
