# Lil-Mosey Motorcycle Dealers — connected admin dashboard

## Requirements
- Node.js 18+
- MySQL 8+ (XAMPP MySQL is fine)

## Setup on Windows/XAMPP
1. Extract this ZIP into a folder, e.g. `C:\xampp\htdocs\lil-mosey-admin` (or any folder).
2. Start **MySQL** from the XAMPP Control Panel. Apache is not required; Node serves the dashboard.
3. Open phpMyAdmin at `http://localhost/phpmyadmin`. Choose **Import**, select `database.sql`, and run it. This creates `lil_mosey_dealers` and its tables.
4. Copy `.env.example` to a new file named `.env`. Adjust `DB_USER` and `DB_PASSWORD` to match your MySQL account. For default XAMPP, user is often `root` with an empty password.
5. Open a terminal in the extracted project folder and run:
   ```
   npm install
   npm run dev
   ```
6. Visit **http://localhost:5000**. Test `http://localhost:5000/api/health` to check the database connection.

## Separate pages
The dashboard now has separate URLs for each area: `index.html` (Overview), `inventory.html`, `enquiries.html`, `reports.html`, `settings.html`, and `about.html`. Selecting a navigation item opens its own page.

## What is connected
- Dashboard reads motorcycle and enquiry records from the Express API backed by MySQL.
- Add/edit/delete motorcycle actions and enquiry status changes are persisted to MySQL.
- Browser storage remains as a fallback if the API is offline. The initial sample records shown by the demo are copied to the database on the first successful save; for a clean start, clear the browser demo storage and reload after connecting.

## Important security note
This is a local-development starter, **not safe to expose publicly as-is**. The API does not yet implement administrator login/authorization, and its sync endpoints replace each table's contents. Before public deployment, add authenticated admin routes, per-record CRUD, CSRF/rate limits as appropriate, and environment-specific CORS. Never publish your database password.


## Customer website pages added
- `home.html` — public homepage with featured motorcycles and motorcycle brand logos.
- `motorcycles.html` — browse, search, filter by brand, and sort available motorcycles.
- `motorcycle-details.html?id=MOTORCYCLE_ID` — full details for the selected motorcycle, enquiry email link, and return to inventory.
- `sell-motorcycle.html` — motorcycle submission form with seller name, email, phone, motorcycle details, optional photo upload and submission confirmation.

The homepage uses the local API first and displays sample motorcycles if the API is unavailable. Motorcycle submissions are stored in the `sell_requests` table; import the updated `database.sql` before using this feature. Uploaded photos are stored in `uploads/`. The submission stores the seller email for follow-up; automatic email delivery is not configured. Brand marks are loaded from Simple Icons CDN and require internet access.

Open `http://localhost:5000/home.html` for the customer-facing website. The admin dashboard remains at `http://localhost:5000/` and has a link to the customer website.


## Customer website and protected admin dashboard
- Customer website: `http://localhost:5000/home.html`
- Public About page: `http://localhost:5000/about.html` (business information only; no dashboard links)
- Admin dashboard: `http://localhost:5000/admin/` (redirects to password login until authenticated)

### Configure administrator password
1. Copy `.env.example` to `.env` in the project root.
2. Set `ADMIN_PASSWORD` to a strong, unique password.
3. Set `ADMIN_SESSION_SECRET` to a long random value of at least 32 characters.
4. Fill in your MySQL credentials, create the database using `database.sql`, then run `npm install` and `npm start`.

The admin password is read from the server environment and is not stored in browser code. Dashboard pages and dashboard inventory/enquiry APIs require a signed, HTTP-only session cookie that expires after 8 hours. Do not deploy without changing both placeholder secrets and enabling HTTPS.


### Motorcycle brand logos
The customer homepage now uses locally stored SVG wordmark badges for Honda, Yamaha, Kawasaki, Suzuki, KTM, Ducati, BMW Motorrad, Triumph, Harley-Davidson, Bajaj, TVS and Royal Enfield. These local assets do not depend on a third-party logo CDN, so the brand tiles remain visible if external logo services are unavailable. The wordmarks are simple fallback artwork, not official trademark logo files.


### Motorcycle brand logos
The homepage now loads brand-symbol SVGs from Simple Icons CDN for Honda, Yamaha, Kawasaki, Suzuki, KTM, Ducati, BMW Motorrad, Triumph, Harley-Davidson, Bajaj, TVS and Royal Enfield, with bundled local SVG fallback artwork if the CDN is unavailable. The remote logo artwork is provided by a third party and remains subject to each brand's trademark rights.
