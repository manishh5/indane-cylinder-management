# IndaneSewa — M/S Sarvat Indane Sewa

LPG cylinder distribution management system for Indane gas distributor.

## Tech Stack
- **Frontend**: React + Vite, TailwindCSS, Shadcn UI, TanStack Query, Wouter
- **Backend**: Node.js + Express, Passport.js session auth, Drizzle ORM
- **Database**: PostgreSQL
- **Shared schema**: `shared/schema.ts`

## Credentials
- **Admin login**: username `ADMIN`, password `newAdmin`
- **Customer login**: phone number (10 digits) as username
- **Vendor login**: assigned by admin after KYC approval

## Roles
1. **Admin** — Full control: orders, vendors, KYC, inventory, payments, rates
2. **Vendor** — Deliveries, cylinder requests, payment submissions
3. **Customer** — Quick booking (no login) or account booking with history

## Key Features
- Quick booking without login (home page form)
- Order tracking by Track ID
- Admin tabbed dashboard: Orders, Vendors, KYC, Cylinder Requests, Payments, Customers, Rates
- Vendor tabbed dashboard: Orders, Cylinder Requests, Payments
- Cylinder inventory tracking: taken/returned/netEmpty/balance
- Vendor payment request submission (cash/UPI/bank transfer)
- Cylinder type selection: 14.2kg Domestic, 19kg Commercial, 10kg Composite, 5kg, 5kg Commercial
- Cylinder rates management by admin
- Vendor assignment to orders
- Booking type: refill or new connection

## Database Tables
- `users` — customers, vendors, admin
- `bookings` — all orders (quick + logged in)
- `vendor_kycs` — KYC applications
- `vendor_inventories` — per-vendor cylinder stock
- `vendor_requests` — cylinder take/return requests
- `vendor_payment_requests` — vendor payment submissions
- `cylinder_rates` — per-type pricing

## Contact Info
- Phone: +91-9355241824
- Address: Jaswantpuri Sarvat, Muzaffarnagar 251001, UP
- Emergency: 100
