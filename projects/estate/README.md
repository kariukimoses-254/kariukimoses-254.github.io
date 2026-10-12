# EstateHub — Full-Stack Real Estate Platform

A demonstration web application that runs the **same** real estate product across a complete
multi-technology stack:

| Layer      | Technologies                                                              |
|------------|---------------------------------------------------------------------------|
| Frontend   | **React**, **Angular**, **Vue** (three separate SPAs)                       |
| Libraries  | **Bootstrap** + **Tailwind CSS** + **jQuery**                               |
| Languages  | **HTML**, **CSS**, **JavaScript** (client)                                  |
| Backend    | **Java** (Spring Boot), **PHP** (Laravel), **Ruby** (Sinatra), **Node.js** (Express) |
| APIs       | **REST** + **GraphQL** (both exposed by nearly every backend)              |
| Databases  | **PostgreSQL**, **MySQL**, **MongoDB**                                     |

---

## Architecture

```
                        ┌──────────────────────────────────────┐
                        │  Landing page (HTML/CSS/JS + jQuery) │  :8083
                        │  shared/css  shared/js  shared/*.html│
                        └──────────────┬───────────────────────┘
                                       │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        │              │              │              │              │
   React (5173)   Angular (4200)   Vue (5174)
        │              │              │
        └──────────────┴──────┬───────┘
                              │  REST + GraphQL
        ┌─────────────────────┼────────────────────────┐
        │                     │                        │
   Node.js :3000          Java :8080              PHP :8081    Rails? no — Ruby :8082
   Express REST + GQL     Spring REST + GQL      Laravel REST + GQL   Sinatra REST + GQL
   ├── PostgreSQL         └── MySQL              ├── PostgreSQL         └── in-memory demo store
   └── MongoDB                                  └── MySQL
```

---

## Directory Layout

```
├── backend/
│   ├── nodejs/            Node.js + Express  (REST & GraphQL; MongoDB + PostgreSQL)
│   ├── java/              Spring Boot (REST & GraphQL; MySQL)
│   ├── php/               Laravel (REST & GraphQL; PostgreSQL + MySQL)
│   └── ruby/              Sinatra (REST & GraphQL; in-memory demo store)
├── frontend/
│   ├── react/             React SPA (Vite, Bootstrap, Tailwind, jQuery)
│   ├── angular/           Angular 18 SPA (Bootstrap, Tailwind, jQuery)
│   └── vue/               Vue 3 SPA (Vite, Bootstrap, Tailwind, jQuery)
├── shared/                Vanilla HTML/CSS/JS landing page w/ jQuery API demo
├── database/
│   ├── schemas/           DDL for PostgreSQL, MySQL, MongoDB
│   └── seeds/             Seed data for each database
├── docker/                docker-compose for the full stack
└── README.md
```

---

## Quick Start (Docker)

```bash
cd docker
docker-compose up -d
```

The compose file launches all three databases, all four backends, and the landing page.

| Service         | Port  | URL                                    |
|-----------------|-------|----------------------------------------|
| Landing page    | 8083  | http://localhost:8083                   |
| Node.js API     | 3000  | http://localhost:3000/api               |
| Node GraphQL    | 3000  | http://localhost:3000/graphql (GraphiQL)|
| Java API        | 8080  | http://localhost:8080/api/listings      |
| PHP API         | 8081  | http://localhost:8081/api/health        |
| Ruby API        | 8082  | http://localhost:8082/api/health        |
| PostgreSQL      | 5432  | `fullstack_estate` (postgres/postgres)     |
| MySQL           | 3306  | `fullstack_estate_mysql` (root/root)      |
| MongoDB         | 27017 | `fullstack_estate`                        |

---

## Running Locally (no Docker)

### Prerequisites
- Node.js 20+, Java 17, PHP 8.2+, Ruby 3.x, plus PostgreSQL/MySQL/MongoDB running locally.

### 1. Databases
Run the DDL + seed scripts under `database/` against each engine, or just start Node's seeder:

### 2. Node.js backend (port 3000)
```bash
cd backend/nodejs
npm install
cp .env.example .env      # set DB credentials for your machine
npm run seed              # inserts PostgreSQL + MongoDB sample data
npm start
```
- REST: `http://localhost:3000/api/properties`, `/api/listings`
- GraphQL + GraphiQL IDE: `http://localhost:3000/graphql`

### 3. Java backend (port 8080, MySQL)
```bash
cd backend/java
gradle bootRun
```
- REST: `http://localhost:8080/api/listings`
- GraphQL: `http://localhost:8080/playground`

### 4. PHP backend (port 8081, PostgreSQL + MySQL)
```bash
cd backend/php
composer install
cp .env.example .env
php artisan migrate --seed
php artisan serve --port=8081
```
- REST: `http://localhost:8081/api/properties`
- GraphQL: `POST http://localhost:8081/api/graphql`

### 5. Ruby backend (port 8082)
```bash
cd backend/ruby
bundle install
ruby app.rb
```
- REST: `http://localhost:8082/api/reviews`, `/api/market-stats`

### 6. Frontends

| App     | Port  | Command (inside its dir) |
|---------|-------|--------------------------|
| React   | 5173  | `npm install && npm run dev` |
| Angular | 4200  | `npm install && npx ng serve` |
| Vue     | 5174  | `npm install && npm run dev` |

### 7. Landing page
Open `shared/index.html` directly, or serve it:
```bash
cd shared
python -m http.server 8083
```
The landing page includes a live **jQuery API demo** that pings every backend.

---

## API Surface

| Backend     | REST examples                                     | GraphQL                                 |
|-------------|---------------------------------------------------|------------------------------------------|
| Node.js     | `/api/properties`  `/api/listings`  `/api/listings/visit/:id` | `listings(filter)`, `properties(filter)`, mutations |
| Java        | `/api/listings`  `/api/customers`                 | `listings`, `listing(id)`, mutations     |
| PHP         | `/api/properties`  `/api/tour-visitors`           | `properties`, `agents`, `tourVisitors`   |
| Ruby        | `/api/reviews`  `/api/market-stats`               | `reviews`, `marketStats`, `addReview`    |

---

## Tech Stack Check (as requested)

- **API**: REST ✅ GraphQL ✅
- **Databases**: PostgreSQL ✅ MySQL ✅ MongoDB ✅
- **Backend languages**: Java ✅ PHP ✅ Ruby ✅ JavaScript (Node.js) ✅
- **Frontend frameworks**: Angular ✅ Vue ✅ React ✅
- **Frontend libraries**: Bootstrap ✅ Tailwind CSS ✅ jQuery ✅
- **Frontend languages**: HTML ✅ CSS ✅ JavaScript ✅