import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../application/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly hasResetError = signal(false);
  readonly passwordMismatch = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  submit(): void {
    this.passwordMismatch.set(false);
    this.hasResetError.set(false);

    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }

    this.isLoading.set(true);
    this.authService.resetPassword(email, newPassword).subscribe({
      next: wasUpdated => {
        this.isLoading.set(false);
        if (wasUpdated) {
          this.router.navigate(['/login']);
          return;
        }
        this.hasResetError.set(true);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasResetError.set(true);
      },
    });
  }
}
