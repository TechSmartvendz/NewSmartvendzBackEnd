# New SmartVendz Backend

Express API for the SnaxSmart inventory system. It stores data in MongoDB and covers users, machines, products, warehouse stock, purchases, and invoicing. A few routes also proxy the external SnaxSmart devices and transactions API.

Entry point: `app.js`. Package name: `new_smartvendz_backend`.

## Prerequisites

- Node.js 18 or newer (npm comes with it)
- MongoDB 4.4 or newer, running locally, or a MongoDB Atlas connection string
- Network access to the external SnaxSmart API if you use `/api/snaxsmart`

## Run locally

From this directory (`be-NewSmartvendzBackEnd`):

```bash
npm install
cp .env.example .env
```

Edit `.env`:

1. Set `MONGODB_URI`. For a local database this is already `mongodb://127.0.0.1:27017/inventory`.
2. Set `SECRET_KEY` to a long random string.
3. Set `PORT` to `3000` so it matches the inventory frontend (`REACT_APP_BASE_URL=http://localhost:3000`).
4. Fill `EMAIL`, `EMAILPASS`, `EXTERNAL_API_BASE_URL`, and `SNAX_SMART_BASIC_AUTH` only if you need mail or the external device API.

Start MongoDB, then start the API with auto-reload:

```bash
npm run adminapp
```

That runs `nodemon ./app.js` and restarts on changes to `.js`, `.json`, `.env`, `.html`, `.css`, and `.hbs`.

On a good start the console prints:

```text
connection is setup at 3000
Connected with mongodb
```

If `MONGODB_URI` is missing, the process exits with `MONGODB_URI is not set in .env`. If MongoDB is down, you still see the port line, then `No Connection` and the driver error. The HTTP server keeps listening in that case.

Check the process:

```bash
curl http://localhost:3000/
```

Expected body:

```json
{ "path": "/", "status": "success" }
```

Login (JWT is returned on success):

```bash
curl -X POST http://localhost:3000/api/Login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<user>","password":"<password>"}'
```

Protected routes expect `Authorization: Bearer <token>`. Invoice routes can also accept an `invToken` cookie.

To run once without nodemon:

```bash
node app.js
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run adminapp` | Start the API with nodemon (local development). |
| `npm test` | Placeholder. No test suite is configured. |
| `node scripts/download-purchase-data.js --from=YYYY-MM-DD --to=YYYY-MM-DD` | Export purchase rows to CSV. See `scripts/README.md`. |

## Configuration

All settings are environment variables loaded by `dotenv` from `.env` in this directory (`app.js` and `config/dbconn.js`). Copy `.env.example` and replace the placeholders. Never commit `.env`.

| Variable | Required | Read by | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `app.js` | HTTP port. Default is `80` when unset. Use `3000` for local frontend. |
| `NODE_ENV` | No | `logger/logger.js` | Anything other than `production` adds an extra console log transport. |
| `MONGODB_URI` | Yes | `config/dbconn.js` | Mongo connection string. Process exits if empty. Database name in the local URI is `inventory`. |
| `SECRET_KEY` | Yes for auth | `model/m_user_info.js`, `middleware/auth.js`, `middleware/authentication.js`, `controllers/inv_UserController.js` | HMAC secret for signing and verifying JWTs. |
| `EMAIL` | For mail | `helper/mailer.js` | Gmail address used by nodemailer. |
| `EMAILPASS` | For mail | `helper/mailer.js` | Gmail app password for that account. |
| `EXTERNAL_API_BASE_URL` | For SnaxSmart proxy | `routes/snaxSmartAPI.js` | Base URL of the external devices/transactions API. No trailing slash. |
| `SNAX_SMART_BASIC_AUTH` | For SnaxSmart proxy | `routes/snaxSmartAPI.js` | Base64 of `username:password`, sent as `Authorization: Basic <value>`. |
| `SENDER_EMAIL` | No | Not referenced in code | Kept so existing `.env` files stay complete. |
| `SENDER_PASSWORD` | No | Not referenced in code | Kept so existing `.env` files stay complete. The mailer does not use this key. |
| `SALT_KEY` | No | Not referenced in code | Kept so existing `.env` files stay complete. |
| `SALT_INDEX` | No | Not referenced in code | Kept so existing `.env` files stay complete. Write it as `SALT_INDEX=1` with no space before `=`. |

`SECRET_KEY` only needs to be set once. A second copy in `.env` does nothing.

`SNAX_SMART_BASIC_AUTH` should be the raw base64 string. Quotes are unnecessary. A trailing comma becomes part of the credential and Basic auth will fail.

Example local `.env` shape (values are fake):

```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/inventory
SECRET_KEY=replace-with-a-long-random-jwt-secret
EMAIL=you@example.com
EMAILPASS=replace-with-gmail-app-password
EXTERNAL_API_BASE_URL=https://example-snaxsmart-api.a.run.app
SNAX_SMART_BASIC_AUTH=replace-with-base64-basic-auth
SALT_KEY=replace-with-a-uuid
SALT_INDEX=1
SENDER_EMAIL=you@example.com
SENDER_PASSWORD=replace-with-sender-password
```

## Project layout

```text
app.js                  Express app, CORS, route mounting, listen
config/dbconn.js        MongoDB connection
middleware/             JWT auth, async errors, file upload
routes/                 HTTP routers
controllers/            Invoice handlers, login, response helper
model/                  Mongoose models
validation/             Joi request schemas
helper/                 Mailer, CSV upload, shared helpers
logger/                 Winston logger (error.log, combined.log)
public/                 Static files (for example purchase-data.html)
scripts/                One-off purchase CSV export
```

## HTTP routes

Mounted in `app.js`. Most inventory routes sit under `/api`. Unknown paths return `{ "msg": "API not Found:404" }`.

| Prefix | Area |
| --- | --- |
| `GET /` | Health check |
| `POST /api/Login` | User login |
| `/api/User` | Users |
| `/api/Country`, `/api/State`, `/api/City`, `/api/Area` | Locations |
| `/api/Unit` | Units |
| `/api/Permission` | Permissions |
| `/api/Company` | Companies |
| `/api/Machine` | Machines |
| `/api/Product` | Products |
| `/api/Employee` | Employees |
| `/api/Logic` | Logic |
| `/api` | Machine stock, warehouse, supplier, stock transfer, refiller requests, purchase stocks |
| `/api/tax` | GST |
| `/api/invUser` | Invoice users (signup, login, forgot password) |
| `/api/invProduct` | Invoice products |
| `/api/invTax` | Invoice tax |
| `/api/invPaymentTerm` | Payment terms |
| `/api/invInvoice` | Invoices and payments |
| `/api/invCustomer` | Customers |
| `/api/invUnit` | Invoice units |
| `/api/invTDS` | TDS |
| `/api/mappings` | Device-to-machine mappings |
| `/api/snaxsmart` | Proxy to the external SnaxSmart API |

SnaxSmart proxy paths (all require auth):

- `GET /api/snaxsmart/devices`
- `GET /api/snaxsmart/txns?fromdate=&todate=`
- `GET /api/snaxsmart/txns/today`
- `GET /api/snaxsmart/txns/:machineId?fromdate=&todate=`

Purchase CSV download (auth required):

```text
GET /api/purchase-stocks/download?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
```

A browser form for the same download is served from `/purchase-data.html` when `public/` is present. Details are in `scripts/README.md`.

## Logs

Winston writes:

- `logger/error.log` for errors
- `logger/combined.log` for info and above
- the console always, and again when `NODE_ENV` is not `production`

## Frontend

The inventory UI in `fe-inventoryfrontend` calls this API. Point it at the same host and port:

```bash
REACT_APP_BASE_URL=http://localhost:3000
```

Start this API before the frontend.

## Notes

- CORS allows all origins. `Access-Control-Allow-Origin` is `*`.
- Request JSON is parsed by both `express.json()` and `body-parser`.
- `mongoose` is pinned to v6 (`useNewUrlParser` / `useUnifiedTopology` are set and are no-ops on newer drivers).
- There is no Docker, Procfile, or process manager config in this repo. Production is `node app.js` (or nodemon) with `MONGODB_URI` pointed at the hosted cluster and `NODE_ENV=production`.
