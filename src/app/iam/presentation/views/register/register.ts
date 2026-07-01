import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../application/services/auth.service';
import { UserProfileService } from '../../../infrastructure/services/user-profile.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(UserProfileService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly emailExists = signal(false);
  readonly hasError = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  submit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.emailExists.set(false);
    this.hasError.set(false);

    const { name, email, password } = this.form.getRawValue();
    this.authService.register(name, email, password).subscribe({
      next: (user) => {
        if (user === null) {
          this.isLoading.set(false);
          this.emailExists.set(true);
          return;
        }

        const today = new Date();
        const endDate = new Date(today);
        endDate.setFullYear(endDate.getFullYear() + 1);
        const fmt = (d: Date) => d.toISOString().split('T')[0];

        forkJoin([
          this.profileService.createSubscription({
            userId: user.id,
            plan: 'BASIC',
            price: 0,
            startDate: fmt(today),
            endDate: fmt(endDate),
          }),
          this.profileService.createPreferences({
            language: 'es',
            fontSize: 'MEDIUM',
            backgroundColor: 'DEFAULT',
            emailNotifications: false,
            pushNotifications: false,
            users_id: user.id,
          }),
        ]).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/login']);
          },
          error: () => {
            this.isLoading.set(false);
            this.router.navigate(['/login']);
          },
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }
}
