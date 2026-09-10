# Deploying Lizzy's Bakery

The site runs as two containers defined in [`docker-compose.yml`](docker-compose.yml):

| Service    | Image                                         | Serves                                  |
|------------|-----------------------------------------------|-----------------------------------------|
| `backend`  | `ghcr.io/stacychege/lizzys-bakery-backend`    | Django API + admin + `/media/` uploads  |
| `frontend` | `ghcr.io/stacychege/lizzys-bakery-frontend`   | the built React site (nginx)            |

GitHub Actions ([`.github/workflows/build.yml`](.github/workflows/build.yml)) builds and
pushes both images on every push to `master`, then calls the Dokploy API to redeploy.
A separate Postgres database is **not** in the compose file — you create one in Dokploy.

You need **two hostnames**: one for the site, one for the API. Examples below use
`lizzysbakery.com` (frontend) and `api.lizzysbakery.com` (backend). The API host must
also serve the uploaded product photos at `/media/`, which the backend already does.

---

## One-time setup

### 1. Make the GHCR images pullable

The images are published under `ghcr.io/stacychege/…`. Either:

- **Make them public** — GitHub → your profile → Packages → `lizzys-bakery-backend` →
  Package settings → Change visibility → Public. Repeat for `lizzys-bakery-frontend`.
- **Or** add a registry credential in Dokploy (Settings → Registry) using a GitHub
  Personal Access Token with `read:packages`, and select it on the compose project.

### 2. Create the Postgres database in Dokploy

Dokploy → your project → Create Service → Database → PostgreSQL. Note the connection
string it gives you. Because that database is on the same private network as the app
and has no SSL, you will set `DATABASE_SSL=False` (step 4).

### 3. Create the compose project in Dokploy

Dokploy → your project → Create Service → **Compose**.

- **Source:** GitHub → `StacyChege/lizzys-bakery`, branch `master`.
- **Compose path:** `docker-compose.yml`.
- **Autodeploy:** **OFF.** The GitHub Actions workflow triggers redeploys itself once
  the new images are pushed; leaving Dokploy's own git autodeploy on causes it to
  deploy from source before the images exist.

Add the two domains (Dokploy → the compose service → Domains):

| Domain                  | Service    | Container port | HTTPS |
|-------------------------|------------|----------------|-------|
| `lizzysbakery.com`      | `frontend` | 80             | on    |
| `api.lizzysbakery.com`  | `backend`  | 8000           | on    |

### 4. Set the environment variables

Dokploy → the compose service → Environment. These are the keys from
[`lizzys-bakery-backend/.env.example`](lizzys-bakery-backend/.env.example); every one
of them is referenced in `docker-compose.yml`, so anything not listed there will not
reach the container.

```
SECRET_KEY=<a fresh 50-char random string>
DEBUG=False
DATABASE_URL=<the connection string from step 2>
DATABASE_SSL=False

ALLOWED_HOSTS=api.lizzysbakery.com,localhost
CORS_ALLOWED_ORIGINS=https://lizzysbakery.com
CSRF_TRUSTED_ORIGINS=https://api.lizzysbakery.com

FRONTEND_URL=https://lizzysbakery.com

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=<the gmail address>
EMAIL_HOST_PASSWORD=<a gmail app password, not the account password>
DEFAULT_FROM_EMAIL=<the same gmail address>
```

Notes:
- Keep `localhost` in `ALLOWED_HOSTS` — the container healthcheck requests
  `http://localhost:8000/api/health/` by name.
- `SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(50))"`.
- Gmail app password: Google Account → Security → 2-Step Verification → App passwords.
  Gmail rewrites the From header to the authenticated account, so `DEFAULT_FROM_EMAIL`
  should be that same address or the mails look spoofed.
- Leave `SECURE_HSTS_SECONDS` and `SECURE_SSL_REDIRECT` unset for now. Once HTTPS is
  confirmed stable, set `SECURE_HSTS_SECONDS=31536000`.

### 5. Set the GitHub Actions secrets

GitHub → `StacyChege/lizzys-bakery` → Settings → Secrets and variables → Actions:

| Secret               | Value                                                            |
|----------------------|-----------------------------------------------------------------|
| `VITE_API_BASE_URL`  | `https://api.lizzysbakery.com/api` (baked into the frontend build) |
| `DOKPLOY_URL`        | your Dokploy base URL, e.g. `https://dokploy.example.com`        |
| `DOKPLOY_API_KEY`    | Dokploy → Settings → API/Tokens → generate                      |
| `DOKPLOY_COMPOSE_ID` | the compose service's ID (in its Dokploy URL, or via the API)   |

`VITE_API_BASE_URL` is read at **build time** — changing it needs a new frontend build
(push to `master` or re-run the workflow), not just a redeploy.

### 6. First deploy

Push to `master` (or GitHub → Actions → Build & Deploy → Run workflow). The workflow
builds both images, pushes them to GHCR, and calls `compose.redeploy`. Watch it in
Dokploy → the compose service → Deployments.

### 7. Seed the database

Migrations run automatically on container start (the backend image's `CMD`). The seed
data does not — run these once, in Dokploy → the compose service → the `backend`
container's terminal:

```
python manage.py seed_delivery_zones
python manage.py seed_demo_menu
python manage.py seed_demo_testimonials
python manage.py createsuperuser
```

`seed_*` are idempotent (safe to re-run). `createsuperuser` makes the admin login for
`lizzysbakery.com/login` and `api.lizzysbakery.com/admin/`.

---

## Verifying a deploy

- `https://api.lizzysbakery.com/api/health/` → `{"status": "ok", "database": true}`.
- `https://lizzysbakery.com` loads, the menu shows products with photos (photos are
  served from the API host — a broken image means `VITE_API_BASE_URL` is wrong or the
  `media` volume was lost).
- Place a test order → the confirmation email arrives (check the `backend` container
  logs if not: a `smtplib` error means the Gmail credentials or `EMAIL_*` vars are off).
- Log into the admin, change the order's status → the status email arrives.

## Routine updates

Push to `master`. The workflow rebuilds, repushes, and redeploys. The `media` volume
and the Postgres database persist across deploys; the container filesystem does not.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Backend container unhealthy / `/api/health/` 503 | `DATABASE_URL` wrong, or `DATABASE_SSL=True` against the internal Postgres |
| `DisallowedHost` in logs | API host missing from `ALLOWED_HOSTS` |
| Browser blocks API calls (CORS) | frontend origin missing from `CORS_ALLOWED_ORIGINS`, or scheme mismatch (`http` vs `https`) |
| Django admin login fails CSRF | API host missing from `CSRF_TRUSTED_ORIGINS` |
| Emails print to logs instead of sending | `EMAIL_HOST` empty — it's unset or not passed through |
| Password reset links point to `localhost` | `FRONTEND_URL` unset |
| Product images broken | `VITE_API_BASE_URL` wrong, or the `media` volume was removed |
| Deploy didn't trigger after a push | `DOKPLOY_URL` / `DOKPLOY_API_KEY` / `DOKPLOY_COMPOSE_ID` secret missing (workflow logs a warning, doesn't fail) |
