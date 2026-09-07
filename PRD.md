# LIZZY'S BAKERY

## Product Requirements Document (PRD)

*Creating sweet memories for every occasion · v1.1 · 2026*

> **Changelog (v1.1):** Amended Section F6, related Goals/Non-Goals bullets, the F7
> "Confirmed" status, the Tech Stack payments row, the Data Model summary, and the
> Assumptions/Risks table to reflect a deliberate scope decision made during
> development: **no on-site M-Pesa integration**. The bakery already takes payment
> via an existing M-Pesa paybill; the site shows prices and places orders as
> "Pending Confirmation," and the baker confirms the order and arranges payment
> directly with the customer by phone/WhatsApp. v1.0's M-Pesa STK Push plan is
> superseded by this section. Everything else in this document reflects v1.0
> unchanged.

This document defines what the Lizzy's Bakery ordering website is, who it is for, and exactly what it must do. It is the
single source of truth used to build the Frontend Roadmap, Backend Roadmap, and Project Schedule that accompany
it.

## 1. Product Overview & Objectives

Lizzy's Bakery is a custom-built ordering website for a home/small-business bakery ("Made with love, just for you"). It
replaces order-taking by phone call or WhatsApp message with a proper online storefront: customers browse the
cake, cupcake, muffin, and pastry menu, request a fully custom cake design, choose a date and fulfilment method,
and place a pre-order — all without needing to speak to anyone until pickup or delivery day, aside from the baker's
follow-up call/WhatsApp message to confirm the order and arrange payment.

The bakery currently takes orders for weddings, birthdays, graduations, cupcakes, and muffins, and prides itself on
freshly baked, made-to-order, handmade products (as shown on its promotional poster). The website must reflect
this identity: warm, feminine, pink-and-cream branding, a personal "made with love" tone, and the same product
categories the bakery already offers.

### 1.1 Goals

- Let a customer browse the full menu (cakes, cupcakes, muffins, and other pastries) with photos, flavours, and
  prices without creating an account.
- Let a customer design a fully custom cake (occasion, size, flavour, filling, frosting, colours, toppings, message,
  and a reference photo upload) and submit it as a quote request or order.
- Enforce the bakery's real operating rule: every order — standard or custom — must be placed at least 5 days
  before the date it is needed.
- Let a customer choose how they receive their order: pickup at the bakery, their own delivery rider/courier, or
  the bakery's own delivery (with a delivery fee and radius).
- Give the baker (admin) one dashboard to manage the menu, see incoming orders, confirm dates, and update
  order status from a phone or laptop.
- ~~Take payment (or a deposit) online via M-Pesa, so orders are confirmed rather than just requested.~~
  **(v1.1) Show clear pricing and collect orders as "Pending Confirmation"; the baker confirms the order and
  arranges payment directly with the customer via her existing M-Pesa paybill, outside the website.** See F6.

### 1.2 Non-Goals (MVP Scope Exclusions)

- No real-time 3D cake preview or drag-and-drop visual cake designer — custom cakes are configured through a
  structured multi-step form plus an optional reference image upload.
- No multi-baker / multi-branch support in the MVP — the platform serves one bakery location.
- No native mobile app — the site is a responsive web app that works well on phones, since most customers will
  order from their phone.
- No live chat support system — contact is via the order form, phone number, and WhatsApp link.
- No inventory/ingredient-level stock management — only per-product "available / sold out" toggles.
- **(v1.1) No online payment integration of any kind (M-Pesa STK Push or otherwise).** The site never touches
  payment credentials or funds. Every order is placed as "Pending Confirmation"; the baker follows up with the
  customer by phone/WhatsApp to confirm the order and collect payment via her existing M-Pesa paybill. This
  replaces the v1.0 plan to build M-Pesa Daraja STK Push — see F6 for the full reasoning.

## 2. User Roles & Account Model

The platform defines three roles. Ordering does not strictly require an account (guest checkout is allowed), but a
signed-in customer can track order history and re-order favourites.

| Role | Description | Key Permissions |
|---|---|---|
| Customer (Guest) | Unauthenticated visitor browsing the site. | Browse menu, view product detail, use the custom cake builder, start checkout as a guest with name, phone, and email. |
| Customer (Registered) | Signed-up customer with an account. | Everything a guest can do, plus: saved delivery details, order history, order status tracking, re-order in one click. |
| Admin (Baker) | Owner/operator of the bakery. | Manage menu items and categories, view and manage all orders and custom cake requests, update order status, set available order dates, manage delivery zones and fees, view basic sales stats. |

### 2.1 Registration & Authentication

- Customers can check out as a guest (name, phone number, email optional) — no account required to place an
  order.
- Customers can optionally register with email and password to save details and view order history.
- JWT-based authentication for registered customers and the admin. Access token expires in 15 minutes; refresh
  token extends the session silently.
- Password reset via email link, expiring after 30 minutes.
- The Admin account is a single seeded account (or a small, invite-only set of staff accounts) — there is no public
  admin sign-up.

## 3. Core Features

### F1 — Public Menu & Product Catalogue

The menu is the homepage's main content and is fully public. It mirrors the categories the bakery already promotes:
Wedding Cakes, Birthday Cakes, Cupcakes, Graduation Cakes, and Muffins/Pastries.

| Property | Detail |
|---|---|
| Categories | Wedding Cakes, Birthday Cakes, Cupcakes, Graduation Cakes, Muffins & Pastries (Admin can add more categories later). |
| Product fields | Name, description, category, base price, size/serving options, available flavours, photo gallery, "made to order" badge, availability toggle (in stock / unavailable). |
| Filtering | Filter by category, flavour, and price range. |
| Search | Full-text search by product name, flavour, or keyword (e.g. "chocolate", "graduation"). |
| Product detail page | Large photo gallery, full description, flavour and size selector, price, "Add to Cart" and "Order a Custom Version" actions. |

### F2 — Custom Cake Builder

Reflects the poster's "Made Fresh, Made With Love" promise: a customer who does not want a standard menu cake
can design their own through a guided, step-by-step form.

| Step | Customer Chooses |
|---|---|
| 1. Occasion | Wedding, Birthday, Graduation, Baby Shower, Anniversary, Other (free text). |
| 2. Size & Servings | Cake tiers (1–3 tiers) and approximate number of servings; shown as an estimated price range, not a final price. |
| 3. Flavour & Filling | Sponge flavour (vanilla, chocolate, red velvet, lemon, marble, etc.) and filling (buttercream, cream cheese, ganache, fruit compote, etc.). |
| 4. Frosting & Colour Theme | Frosting style (buttercream, fondant, drip icing as shown on the poster, naked cake) and a colour palette picker. |
| 5. Toppings & Decoration | Fresh flowers, macarons, fruit, edible toppers, a custom message/name written on the cake. |
| 6. Reference Photo (optional) | Upload up to 3 inspiration images so the baker understands the desired look. |
| 7. Date Needed & Contact | Date needed (validated against the 5-day rule), phone number, and any special notes/allergies. |

*Submitting the builder creates a Custom Cake Request. Because a bespoke cake cannot be auto-priced, the baker
reviews it in the Admin Dashboard and sends back a final quote (by phone/WhatsApp or an in-app quote), which the
customer then confirms directly with the baker to lock in the date.*

### F3 — Pre-Order Scheduling & the 5-Day Rule

- Every checkout (standard menu items and custom cakes) requires a "Date Needed."
- The date picker disables any date less than 5 days from today, and shows an inline reminder: "Orders must be
  placed at least 5 days before the date you need them."
- If a chosen date is fully booked (Admin can cap orders per day), the date is shown as unavailable in the picker.
- The order confirmation clearly restates the confirmed date and a reminder of the collection/delivery time
  window.

### F4 — Fulfilment Options: Pickup, Own Delivery, or Bakery Delivery

| Option | How It Works |
|---|---|
| Pickup at Bakery | Customer collects the order from the bakery at an agreed time. Address and opening hours shown on the Location page. No delivery fee. |
| Customer's Own Delivery/Rider | Customer arranges their own courier (e.g. a boda rider). The site shows a clear instruction that the bakery hands the order to whoever the customer sends, and the bakery is not responsible once the order is collected. |
| Bakery Delivery | The bakery delivers directly. Customer enters a delivery address; the site calculates a delivery fee based on distance/zone and adds it to the order total. |

### F5 — Cart & Checkout

- Standard menu items support quantity selection and are added to a persistent cart (guest cart stored locally;
  registered customer cart stored server-side).
- Checkout collects: contact details, date needed, fulfilment method (+ address if delivery), and any order notes.
- Order summary shows itemised prices, delivery fee (if any), and total, before payment.

### F6 — Payment & Billing (v1.1: Manual Paybill Confirmation)

> **v1.1 replaces the original M-Pesa Daraja STK Push plan.** During development it was decided that the site
> should never touch payment credentials or funds directly. The bakery already has a working M-Pesa paybill and
> a manual confirmation process that works for her; the website's job is to make ordering, scheduling, and
> communication easier, not to reinvent how she gets paid. This also removes a significant external dependency
> (Safaricom Daraja sandbox/go-live approval) that carried real risk of delaying launch for reasons entirely outside
> the project's control.

| Aspect | Detail |
|---|---|
| Method | None on-site. The customer sees the full price at checkout; no payment is collected through the website. |
| Order placement | Submitting checkout (standard or custom) creates an order with status "Pending Confirmation" — no payment step blocks this. |
| Confirmation | The baker reviews the order in the Admin Dashboard and contacts the customer by phone/WhatsApp to confirm details and arrange payment via her existing M-Pesa paybill. |
| Payment status | Payment itself is not tracked in the system — order *status* (see F7) is the source of truth for where an order stands. There is no in-app "Paid" flag; the baker tracks payment through her own paybill/M-Pesa statement, same as today. |
| Receipts | On order placement, an order confirmation (with an order number) is shown on-screen and emailed if the customer provided an email (see F10). This confirms the order was *received*, not that it was paid. |

### F7 — Order Status & Tracking

Every order moves through a clear status pipeline so the customer knows exactly where things stand, and the baker
knows exactly what to do next.

| Status | Meaning |
|---|---|
| Pending Confirmation | Order/custom request received; awaiting baker review and confirmation call/WhatsApp. |
| Confirmed | *(v1.1)* Baker has confirmed the order by phone/WhatsApp, payment has been arranged via paybill, and the date is locked in. |
| In the Kitchen | Baker has started preparing the order. |
| Ready for Pickup / Out for Delivery | Order is complete and ready to be collected, or is on its way. |
| Completed | Order has been collected or delivered. |
| Cancelled | Order was cancelled by the customer or the baker (e.g. fully booked date, customer unreachable, nonpayment). |

### F8 — Admin (Baker) Dashboard

- Menu management: add/edit/remove products, categories, flavours, prices, photos, and availability.
- Order inbox: list of all orders and custom cake requests, filterable by status and date, with the ability to update
  status and add internal notes.
- Custom cake quoting: view a submitted cake request in full (all builder choices + reference photos) and send
  back a price so the customer can confirm and lock in the date.
- Calendar view: see how many orders are booked per day, and block out fully-booked or closed dates.
- Delivery settings: manage delivery zones/fees used by the Bakery Delivery option.
- Basic stats: orders this week/month, revenue, most-ordered items.

### F9 — Location, Hours & Contact

- A dedicated Location & Contact page/section: address, embedded map, opening hours, phone number (e.g. 0725
  941 831), and a WhatsApp/Call button.
- Bakery policies clearly stated site-wide: the 5-day pre-order rule, pickup vs delivery options, and any
  cancellation/refund policy.

### F10 — Notifications

- Email confirmation on order placement (if email provided). *(v1.1: confirms the order was received, not that it
  was paid — see F6.)*
- Status-change notifications (e.g. "Your order is ready for pickup") via email; SMS is a nice-to-have if time allows
  within the schedule.

### F11 — Testimonials / Reviews (stretch, if time allows)

A simple section showing past-customer testimonials on the homepage, matching the friendly, personal tone of the
brand. Can be seeded by the Admin rather than built as a full public review system, to keep MVP scope realistic.

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Responsiveness | Fully usable on mobile, tablet, and desktop — most customers are expected to browse and order from a phone. |
| Performance | Menu and product pages load in under 2 seconds on an average connection; images are optimised/compressed. |
| Security | Passwords hashed (Django's default hasher), JWT auth over HTTPS, admin routes protected by role check. *(v1.1: the payment-callback-verification requirement from v1.0 no longer applies — there is no payment callback.)* |
| Accessibility | Sufficient colour contrast against the pink/cream palette, alt text on product images, keyboard-navigable forms. |
| Branding consistency | Pink (#E0729A / #C15C7A), cream (#FFFCF9), and dark brown (#3B2621) palette; warm, script-style headings echoing the bakery's existing poster branding. |
| Reliability | *(v1.1)* An order is never silently lost: once submitted, it exists as "Pending Confirmation" regardless of payment, and stays visible in the Admin inbox until the baker acts on it. |

## 5. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | JavaScript + TypeScript, React, Tailwind CSS (Vite) | Type safety from TypeScript reduces bugs in cart/checkout logic; Tailwind speeds up building the pink/cream branded UI without writing custom CSS files. |
| Backend | Python, Django, Django REST Framework | Django's admin and ORM make menu + order management fast to build; DRF exposes a clean JSON API for the React frontend. |
| Database | PostgreSQL (recommended) | Has first-class Django support, handles JSON fields (used for custom cake builder data) more natively, and is the default assumption of most modern Django hosting. |
| Payments | *(v1.1)* None — manual, off-platform | The customer pays the baker's existing M-Pesa paybill directly after she confirms the order by phone/WhatsApp. The site never touches payment credentials or funds. See F6. |
| Image storage | Django ImageField with local media storage in development; a persistent volume or object storage (e.g. S3-compatible) recommended in production so images survive redeploys. | |
| Hosting | Docker images via GHCR, deployed with Dokploy. | Matches the actual deployment setup in use. |

## 6. Data Model Summary

A high-level look at the core entities.

| Entity | Purpose |
|---|---|
| User | Registered customers and the Admin/baker account. |
| Category | Wedding, Birthday, Cupcakes, Graduation, Muffins, Coffee & Beverages, etc. |
| Product | A standard menu item belonging to a category — name, price, flavours, images, availability. |
| CustomCakeRequest | One full submission of the custom cake builder — all step choices, reference images, quoted price, and linked order. |
| Order | A placed order — items, custom request (if any), date needed, fulfilment method, delivery address/fee, status, totals. |
| OrderItem | A single line item within an Order (product, quantity, chosen flavour/size, price at time of order). |
| ~~Payment~~ | *(v1.1) Not implemented — payment is handled manually outside the platform via the baker's paybill (see F6). No transaction records are stored on-site.* |
| DeliveryZone | Admin-managed delivery areas and their fees, used by the Bakery Delivery option. |
| BlockedDate | Dates the Admin has marked as fully booked or closed, used to enforce availability in the date picker. |

## 7. Success Metrics

- A customer can go from landing on the homepage to a **placed order** ("Pending Confirmation") in under 5
  minutes for a standard menu item. *(v1.1: "placed," not "paid" — payment is arranged directly with the baker
  after she confirms the order.)*
- A customer can fully describe a custom cake through the builder without needing to call or WhatsApp the bakery
  first.
- Zero orders are accepted for a date less than 5 days away.
- The baker can manage the entire day's orders from the Admin Dashboard alone, without checking a separate
  notebook, spreadsheet, or WhatsApp thread.

## 8. Assumptions & Risks

| Assumption / Risk | Notes |
|---|---|
| ~~M-Pesa Daraja sandbox access~~ | *(v1.1) No longer applicable — see F6. This risk is fully removed by the decision not to integrate on-site payment.* |
| One bakery location | Delivery zones and pickup are based on a single fixed bakery address. |
| Custom cakes cannot be auto-priced | Final custom cake pricing always goes through a manual baker quote step — this is a deliberate scope decision, not a missing feature. |
| Solo developer, part-time hours | The schedule assumes roughly 1–2 hours on weekdays and 1–2 hours on Saturday — the Project Schedule document paces the plan accordingly. |
