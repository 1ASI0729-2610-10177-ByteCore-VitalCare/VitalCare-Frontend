import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService } from '../../../infrastructure/services/payment.service';
import { Plan } from '../../../domain/model/plan.entity';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatProgressSpinnerModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css',
})
export class PaymentModal {
  @Input({ required: true }) plan!: Plan;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private paymentService = inject(PaymentService);

  readonly processing = signal(false);
  readonly error = signal(false);

  readonly cardNumber = signal('');
  readonly cardName = signal('');
  readonly cardExpiry = signal('');
  readonly cardCvc = signal('');

  cancel(): void {
    this.cancelled.emit();
  }

  pay(): void {
    this.processing.set(true);
    this.error.set(false);

    const amount = parseFloat(this.plan.price);
    this.paymentService.processPayment(amount, this.plan.name).subscribe({
      next: result => {
        this.processing.set(false);
        if (result.success) {
          this.confirmed.emit();
        } else {
          this.error.set(true);
        }
      },
      error: () => {
        this.processing.set(false);
        this.error.set(true);
      },
    });
  }
}
