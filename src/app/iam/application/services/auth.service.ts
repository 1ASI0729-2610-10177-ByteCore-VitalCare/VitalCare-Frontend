import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, of, switchMap, tap } from 'rxjs';
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
    const params = new HttpParams()
      .set('email', email.trim())
      .set('password', password);

    return this.http.get<UserResource[]>(this.usersEndpointUrl, { params }).pipe(
      map(users => users[0] ? this.assembler.toEntityFromResource(users[0]) : null),
      tap(user => {
        if (user) {
          this.persistUser(user);
        }
      }),
    );
  }

  resetPassword(email: string, password: string): Observable<boolean> {
    const params = new HttpParams().set('email', email.trim());

    return this.http.get<UserResource[]>(this.usersEndpointUrl, { params }).pipe(
      switchMap(users => {
        const user = users[0];
        if (!user) {
          return of(false);
        }

        const updatedUser: UserResource = {
          ...user,
          password,
        };

        return this.http.put<UserResource>(`${this.usersEndpointUrl}/${user.id}`, updatedUser).pipe(
          map(() => true),
        );
      }),
    );
  }

  register(name: string, email: string, password: string): Observable<User | null> {
    const normalizedEmail = email.trim();
    const params = new HttpParams().set('email', normalizedEmail);

    return this.http.get<UserResource[]>(this.usersEndpointUrl, { params }).pipe(
      switchMap(users => {
        if (users.length > 0) {
          return of(null);
        }

        const newUser: Omit<UserResource, 'id'> = {
          name: name.trim(),
          email: normalizedEmail,
          password,
          created_at: new Date().toISOString(),
        };

        return this.http.post<UserResource>(this.usersEndpointUrl, newUser).pipe(
          map(resource => this.assembler.toEntityFromResource(resource)),
        );
      }),
    );
  }

  private get usersEndpointUrl(): string {
    const baseUrl = environment.platformProviderApiBaseUrl.replace(/\/$/, '');
    const usersPath = environment.platformProviderUsersEndpointPath.replace(/^\//, '');
    return `${baseUrl}/${usersPath}`;
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
