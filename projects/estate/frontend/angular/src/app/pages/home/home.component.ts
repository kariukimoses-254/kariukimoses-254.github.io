import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

declare var jQuery: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="text-white py-5" style="background: linear-gradient(135deg, #0d2955, #1e7fd0)">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <span class="badge bg-warning text-dark mb-3">Angular 18 + Bootstrap + Tailwind + jQuery</span>
            <h1 class="display-4 fw-bold">EstateHub</h1>
            <p class="lead">
              Angular frontend consuming REST + GraphQL APIs across
              <strong> Java, PHP, Ruby, Node.js</strong> and
              <strong> PostgreSQL, MySQL, MongoDB</strong>.
            </p>
          </div>
          <div class="col-lg-4" *ngIf="health">
            <div class="card text-dark shadow" style="margin-top:0">
              <div class="card-body">
                <h6>API Health</h6>
                <p class="mb-1">Service: {{ health.service }}</p>
                <p class="mb-0">
                  MongoDB: <span class="badge bg-success">ok</span> |
                  PostgreSQL: <span class="badge bg-success">ok</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="container py-5">
      <div class="row g-4">
        <div class="col-md-4" *ngFor="let tech of techStack">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ tech.header }}</h5>
              <p class="text-muted small">{{ tech.body }}</p>
            </div>
          </div>
        </div>
      </div>
      <p class="text-muted mt-4" *ngIf="listingCount !== null">
        Total MongoDB listings: <strong>{{ listingCount }}</strong> (loaded via REST)
      </p>
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #f8fafc; }
  `],
})
export class HomeComponent implements OnInit {
  health: any = null;
  listingCount: number | null = null;

  techStack = [
    {
      header: 'REST + GraphQL APIs',
      body: 'Consumes Node.js Express REST endpoints plus GraphQL queries for flexible data retrieval.',
    },
    {
      header: 'Three Databases',
      body: 'PostgreSQL, MySQL, and MongoDB all power this platform through separate backend services.',
    },
    {
      header: 'Multi-Language Backend',
      body: 'Java (Spring Boot), PHP (Laravel), Ruby (Sinatra), and JavaScript (Node.js) working together.',
    },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getHealth().subscribe((h) => (this.health = h));
    this.api.getListings().subscribe((d) => {
      this.listingCount = d.total;
      jQuery('#portfolio').append('');
    });
  }
}