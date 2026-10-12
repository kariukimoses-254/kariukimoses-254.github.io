import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Property } from '../../services/api.service';

declare var $: any;

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="display-6">Property Catalog</h1>
        <span class="badge bg-primary fs-6">PostgreSQL via Node.js REST</span>
      </div>

      <div class="spinner-border text-primary" *ngIf="loading"></div>

      <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

      <div class="row g-4">
        <div class="col-md-6 col-lg-4" *ngFor="let p of properties">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <span class="badge bg-info text-dark mb-2">{{ p.status }}</span>
              <h5 class="card-title">{{ p.title }}</h5>
              <p class="text-muted small">{{ p.location }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="h5 mb-0 text-primary">\${{ p.price | number }}</span>
                <small class="text-muted">{{ p.bedrooms }} bd / {{ p.bathrooms }} ba</small>
              </div>
              <button class="btn btn-sm btn-outline-primary w-100 mt-3" (click)="favorite(p.id)">
                <i class="bi bi-heart"></i> Favorite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`h1 { color: #0d2955 }`],
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getProperties().subscribe({
      next: (data) => {
        this.properties = data.properties || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  favorite(id: number) {
    $(`#fav-${id}`).toggleClass('text-danger');
  }
}