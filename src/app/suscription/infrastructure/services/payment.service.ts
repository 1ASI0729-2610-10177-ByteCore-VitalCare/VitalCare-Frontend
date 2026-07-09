import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface PaymentResult {
  success: boolean;
  transactionId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  processPayment(amount: number, planName: string): Observable<PaymentResult> {
    return of({
      success: true,
      transactionId: 'TXN-' + Date.now().toString(36).toUpperCase(),
    }).pipe(delay(2000));
  }
}
