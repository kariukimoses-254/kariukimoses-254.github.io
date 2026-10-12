import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background:#0d2955">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/">
          EstateHub <span class="badge bg-warning text-dark ms-2">Angular</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#angularNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="angularNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/properties">Properties</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard">Dashboard</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <router-outlet />
  `,
})
export class AppComponent {
  title = 'EstateHub Angular';
}