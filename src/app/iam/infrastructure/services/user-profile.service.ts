import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface UserPreferences {
  id: number;
  language: string;
  font_size: string;
  background_color: string;
  email_notifications: number;
  push_notifications: number;
  users_id: number;
}

export interface UserSubscription {
  id: number;
  plan: string;
  price: number;
  start_date: string;
  end_date: string;
  status: string;
  users_id: number;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private http = inject(HttpClient);
  private base = environment.platformProviderApiBaseUrl;

  getUser(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}users/${userId}`);
  }

  getPreferences(userId: number): Observable<UserPreferences[]> {
    return this.http.get<UserPreferences[]>(`${this.base}user_preferences?users_id=${userId}`);
  }

  getSubscription(userId: number): Observable<UserSubscription[]> {
    return this.http.get<UserSubscription[]>(`${this.base}subscriptions?users_id=${userId}`);
  }

  createSubscription(data: Omit<UserSubscription, 'id'>): Observable<UserSubscription> {
    return this.http.post<UserSubscription>(`${this.base}subscriptions`, { id: Date.now(), ...data });
  }

  createPreferences(data: Omit<UserPreferences, 'id'>): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(`${this.base}user_preferences`, { id: Date.now(), ...data });
  }
}
