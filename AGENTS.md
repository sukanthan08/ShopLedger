# AGENTS.md

## Stack
- Node.js application using Express (`express`) and JSON request parsing (`body-parser`).
- Browser assets are served from `public/` by `server.js`.
- Persistence is synchronous JSON file I/O through `lib/store.js` to `data/db.json`.

## Module map
- `routes/products.js`: product listing and active coupon endpoints.
- `routes/orders.js`: order listing, creation, lookup, and cancellation endpoints.
- `routes/customers.js`: customer listing and Khata settlement endpoint.
- `routes/reports.js`: dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js`: coupon normalization, lookup, validation, discount calculation, and listing.
- `lib/dates.js`: current date, normalized date keys, and fiscal-year helpers.
- `lib/inventory.js`: product lookup, sellable stock, stock checks, reservation, release, and summaries.
- `lib/invoice.js`: invoice figures and printable HTML rendering.
- `lib/ledger.js`: customer lookup/listing, Khata charges/reversals, and settlements.
- `lib/orders.js`: order add/get/cancel/list operations.
- `lib/pricing.js`: subtotal, discount delegation, and checkout totals.
- `lib/reports.js`: dashboard summary and GST reconciliation.
- `lib/store.js`: JSON database read/write, structure defaults, and audit entries.
- `lib/tax.js`: HSN GST-rate lookup, slab percentage, and CGST/SGST split.

## Commands
- Start the app: `node server.js` (also exposed as `npm start`).
- Run tests: `node --test` (no test files are currently present).

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed.
Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
