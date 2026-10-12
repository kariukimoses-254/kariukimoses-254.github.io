import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Listing } from '../../services/api.service';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="display-6" style="margin:0">MongoDB Listings</h1>
        <span class="badge bg-success fs-6">MongoDB via Node.js</span>
      </div>

      <div class="spinner-border text-success" *ngIf="loading"></div>

      <table class="table table-hover shadow-sm" *ngIf="!loading">
        <thead class="table-dark">
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Price</th>
            <th>Views</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let l of listings">
            <td>{{ l.title }}</td>
            <td>{{ l.location?.city || '-' }}</td>
            <td>\${{ l.price | number }}</td>
            <td><span class="badge bg-info text-dark">{{ l.views }}</span></td>
            <td>
              <span class="badge" [ngClass]="l.status === 'available' ? 'bg-success' : 'bg-warning'">
                {{ l.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`h1 { color: #0d2955 }`],
})
export class DashboardComponent implements OnInit {
  listings: Listing[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getListings().subscribe((data) => {
      this.listings = data.listings || [];
      this.loading = false;
      $(document).trigger('angularLoaded');
    });
  }
}