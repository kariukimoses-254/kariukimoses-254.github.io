LIL-MOSEY CAR DEALERS FULL-STACK STARTER
=================================

PROJECT CONTENTS
- index.html, style.css, script.js: public responsive dealership frontend
- backend/: Node.js + Express REST API, MySQL connection, authentication, vehicle inventory, enquiries, image upload and admin endpoints
- backend/database.sql: creates tables and adds four sample vehicles
- backend/seed-admin.js: safely creates/promotes an administrator using environment variables
- admin/: separate password-protected dashboard for overview, vehicle inventory, customer enquiries, seller submissions, article previews, and contact details

REQUIREMENTS
- Node.js 18+ (LTS recommended)
- MySQL 8+ or compatible MariaDB
- A browser; internet connection for hosted fonts and sample photos

SETUP ON WINDOWS WITH XAMPP / MYSQL
1. Start MySQL in XAMPP. Apache is not required for the Node API.
2. Open phpMyAdmin at http://localhost/phpmyadmin.
3. Import backend/database.sql using the Import tab. This creates the antixorcar database, tables and sample inventory.
4. Copy backend/.env.example to backend/.env.
5. Edit backend/.env with your local MySQL username/password. Create a long random JWT_SECRET before use.
6. Open a terminal in the backend folder and run:
     npm install
7. In backend/.env, add these lines with your own private credentials:
     ADMIN_NAME=Lil-Mosey Car Dealers Administrator
     ADMIN_EMAIL=you@example.com
     ADMIN_PASSWORD=use-a-unique-password-at-least-12-characters
8. Create the administrator account:
     npm run seed-admin
   (Add "seed-admin": "node seed-admin.js" to the scripts in package.json, or run `node seed-admin.js` directly.)
9. Start the API:
     npm run dev
   or `npm start`.
10. Check http://localhost:5000/api/health. It should show status ok and database connected.
11. Open the frontend using VS Code Live Server. If Live Server uses port 5500, the example CLIENT_ORIGIN is already set for it. If another port is used, update CLIENT_ORIGIN in backend/.env and restart the API.
12. Open admin/index.html using Live Server to sign in and manage inventory.

API ROUTES
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile (Bearer token)
- GET /api/vehicles and GET /api/vehicles/:id
- POST /api/vehicles, PUT /api/vehicles/:id, DELETE /api/vehicles/:id (admin token)
- POST /api/enquiries
- GET /api/enquiries (admin token)
- GET /api/admin/stats (admin token)

IMPORTANT NOTES
- This is a starter implementation, not a fully audited production service.
- The frontend uses sample cards if the API is offline, and switches to MySQL inventory when the API is available.
- Prices and sample listing values are demonstration data and shown in USD; adjust currency and business content to your market.
- The admin panel has no public administrator registration. Use seed-admin.js to create an admin securely. Open admin/index.html to sign in. Dashboard access requires an account with the admin role. The dashboard supports vehicle CRUD, enquiry status updates, seller submission review, contact detail display, and article previews. Articles are currently maintained in the website files, not edited from the dashboard.
- Uploaded images are stored in backend/uploads and limited to 5 MB per image. Back up this folder with the database.
- Before deployment: use HTTPS, a strong secret, production CORS allowlist, rate limiting, request validation, database backups, secure hosting, and a real email provider. Never commit backend/.env or share admin credentials.
- Payment processing, saved-vehicle persistence, and email notifications are not implemented yet; do not collect payment details using this starter.

MULTI-PAGE WEBSITE
Open index.html for Home. Separate pages are available as cars.html, sell.html, financing.html, about.html, and contact.html. The navigation menu links to each dedicated page.

LATEST INTERACTIONS
- Each featured/sample vehicle opens its own details view at car-details.html.
- Live inventory cards open the matching database vehicle using car-details.html?id=VEHICLE_ID.
- The Sell Your Car page includes seller contact details, vehicle specifications, description and optional image upload (JPG/PNG/WEBP up to 5 MB). Submissions are saved as enquiries in MySQL and uploaded photos are stored under backend/uploads.
- Buy a Car/search tabs, brand logos and vehicle category tiles navigate to the inventory with the relevant filter.
- Brand marks use Simple Icons' hosted SVG logos, so an internet connection is needed to display the logos.

For the image upload to work, run `npm install` in the backend directory, configure `.env`, import `database.sql`, start XAMPP MySQL and run `npm run dev`. Uploaded listing photos are recorded in the enquiry message and the file is served from /uploads/filename.
