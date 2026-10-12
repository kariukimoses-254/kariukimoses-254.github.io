import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  agent?: { name: string };
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location?: { city?: string; state?: string; country?: string };
  status: string;
  views: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getProperties(): Observable<any> {
    return this.http.get(`${this.base}/properties`);
  }

  getListings(): Observable<{ listings: Listing[]; total: number }> {
    return this.http.get<{ listings: Listing[]; total: number }>(`${this.base}/listings`);
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.base}/`);
  }
}