import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../domain/model/user.entity';
import { UserAssembler } from '../../infrastructure/model/user.assembler';
import { UserResource } from '../../infrastructure/model/user.resource';

const SESSION_STORAGE_KEY = 'vital-care-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly assembler = new UserAssembler();
  private readonly currentUserSignal = signal<User | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  login(email: string, password: string): Observable<User | null> {
    return this.http.post<UserResource>(
      `${this.authEndpointUrl}/sign-in`,
      { email: email.trim(), password }
    ).pipe(
      map(user => this.assembler.toEntityFromResource(user)),
      tap(user => this.persistUser(user)),
    );
  }

  register(name: string, email: string, password: string): Observable<User | null> {
    return this.http.post<UserResource>(
      `${this.authEndpointUrl}/sign-up`,
      {
        name: name.trim(),
        email: email.trim(),
        password,
      }
    ).pipe(
      map(user => this.assembler.toEntityFromResource(user)),
      tap(user => this.persistUser(user)),
    );
  }

  resetPassword(email: string, password: string): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.authEndpointUrl}/reset-password`,
      { email: email.trim(), password }
    );
  }

  private get authEndpointUrl(): string {
    const baseUrl = environment.platformProviderApiBaseUrl.replace(/\/$/, '');
    return `${baseUrl}/api/v1/authentication`;
  }

  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private persistUser(user: User): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private readStoredUser(): User | null {
    const rawUser = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }
}
