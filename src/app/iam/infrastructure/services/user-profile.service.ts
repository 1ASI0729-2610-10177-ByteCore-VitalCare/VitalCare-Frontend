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
  users_id: number;
  language: string;
  fontSize: string;
  backgroundColor: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface UserSubscription {
  id: number;
  plan: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  userId: number;
}

export interface CreateSubscriptionData {
  userId: number;
  plan: string;
  price: number;
  startDate: string;
  endDate: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private http = inject(HttpClient);
  private base = environment.platformProviderApiBaseUrl;

  getUser(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}api/v1/users/${userId}`);
  }

  getPreferences(userId: number): Observable<UserPreferences[]> {
    return this.http.get<UserPreferences[]>(`${this.base}api/v1/user_preferences?users_id=${userId}`);
  }

  getSubscription(userId: number): Observable<UserSubscription[]> {
    return this.http.get<UserSubscription[]>(`${this.base}api/v1/subscriptions?users_id=${userId}`);
  }

  createPreferences(data: Omit<UserPreferences, 'id'>): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(`${this.base}api/v1/user_preferences`, data);
  }

  createSubscription(data: CreateSubscriptionData): Observable<UserSubscription> {
    return this.http.post<UserSubscription>(`${this.base}api/v1/subscriptions`, data);
  }
}
