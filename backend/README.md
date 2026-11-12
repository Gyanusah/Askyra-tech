# AskYRA API

Node.js and MongoDB API for authentication, dashboards, enrollments, service
requests, and NPR payments.

## Local setup

1. Install Node.js and run MongoDB locally, or create a MongoDB Atlas database.
   For Atlas, create a database user and add the machine's public IP address to
   the project's Network Access IP access list.
2. From `backend`, run `npm install`.
3. Copy `.env.example` to `.env`. Replace `JWT_SECRET`, `ADMIN_EMAIL`, and
   `ADMIN_PASSWORD` with private values. The admin password must be at least
   12 characters.
    To email service request reference numbers, set `GMAIL_USER` and
    `GMAIL_APP_PASSWORD` using a Gmail account and its Google app password.
4. Set `MONGODB_URI` to your database connection string. Never commit `.env`.
   If Node.js reports `querySrv ECONNREFUSED`, optionally set
   `MONGODB_DNS_SERVERS` to comma-separated DNS resolver IP addresses reachable
   from your network (for example, `8.8.8.8,8.8.4.4` where permitted). This only
   configures SRV lookup; it does not replace Atlas's IP access list.
5. Start the API with `npm run dev`. The default API port is 5000.
6. In another terminal, start the frontend with `cd ../frontend && npm run dev`.

The Vite development server proxies `/api` requests to `http://localhost:5000`.
The backend uses the MongoDB driver's default pool settings; no workload-specific
pool sizing has been assumed for this small local deployment.

## Backend source layout

- `src/server.js`: application setup, middleware, startup, and shutdown.
- `src/routes/`: Express route handlers grouped by feature.
- `src/middleware/`: authentication, role checks, and async route helpers.
- `src/models/`: Mongoose models and schemas.
- `src/data/`: static catalog data used by the API.

## Authentication and access

- `POST /api/auth/signup`: create a student or company account.
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Successful authentication uses an HTTP-only 12-hour session cookie.
- Admin registration is disabled. The first admin account is bootstrapped from
  `ADMIN_EMAIL` and `ADMIN_PASSWORD` at startup.
- Dashboard APIs check account roles on the server. Admin API routes must not be
  exposed by relying only on frontend route hiding.

## Dashboard and workflow APIs

- `GET /api/dashboard/student`: enrollments and payments for the signed-in student.
- `GET /api/dashboard/company`: service requests and invoices for that company.
- `GET /api/dashboard/admin`: account, enrollment, service, and payment records.
- `GET /api/courses`, `GET /api/services`: public catalog data.
- `POST /api/enrollments`: signed-in students enroll in a catalog course.
- `POST /api/service-requests`: submit a service request without signing in. Include company name, email, phone, service, and the service recipient's name, email, and position. Signed-in companies' requests are linked to their account.
- `PATCH /api/admin/enrollments/:id/progress`: update enrollment progress.
- `PATCH /api/admin/service-requests/:id`: update status, progress, and milestone.
- `POST /api/admin/service-requests/:id/invoice`: create an NPR service invoice.
- `PATCH /api/admin/payments/:id/bank-transfer`: record manual bank verification.

## Payment safety

Payments default to test mode and live processing is intentionally disabled.
Add sandbox credentials only to the backend `.env`. Configure `API_PUBLIC_URL`
as an HTTPS URL reachable by the provider callbacks before testing hosted
checkout. Khalti and eSewa payments are marked paid only after server-to-server
provider verification; the browser redirect alone is not trusted. Bank transfers
remain pending until an administrator records a verification note.

Course prices use the existing numeric catalog amounts expressed in NPR; the
backend is authoritative for payment amounts. There is no card processor
configured. Do not collect or store card numbers in this application.

The local dashboard is not a production-ready billing or accounting system.
Before live launch, configure production gateway accounts and callback URLs,
HTTPS, backups, audit retention, monitoring, privacy/retention policies, and
review the provider-specific integration against current gateway documentation.
