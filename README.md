# LeadFlow Pro API

LeadFlow Pro is a role-based CRM API for capturing, assigning, and managing sales leads. It is built with Express, MongoDB, Mongoose, and JSON Web Tokens (JWT).

The API has two user roles:

- **Admin** — manages all leads, creates leads, assigns work, and can view all activity.
- **Member** — can view assigned leads, update their status, add notes, and view activity for those leads.

## Base URL

Local development:

```text
http://localhost:5000/api
```

All request and response bodies use JSON. Protected requests must send a bearer token:

```http
Authorization: Bearer <jwt-token>
```

## Installation

### Prerequisites

- Node.js 18 or newer
- MongoDB (local instance or MongoDB Atlas connection string)

### Set up the API

```bash
cd server
npm install
```

Create `server/.env` using the environment variables below, then start the server:

```bash
npm run dev
```

For a production-style start:

```bash
npm start
```

Optional: create the development admin and member accounts.

```bash
node seed.js
```

> Do not use the seed accounts or their default passwords in production.

## Environment variables

Create `server/.env`:

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port. Defaults to `5000`. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWT access tokens. Use a long, unique random value. |

## Authentication

### Register a user

`POST /auth/register`

```json
{
  "name": "Ava Patel",
  "email": "ava@example.com",
  "password": "a-strong-password",
  "role": "member"
}
```

`role` is optional and defaults to `member`. The API currently accepts either `admin` or `member`; in a production deployment, restrict or remove public registration before exposing this route publicly.

**201 Created**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "66b8c2f073fed123456789ab",
    "name": "Ava Patel",
    "email": "ava@example.com",
    "role": "member"
  }
}
```

### Sign in

`POST /auth/login`

```json
{
  "email": "ava@example.com",
  "password": "a-strong-password"
}
```

**200 OK**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66b8c2f073fed123456789ab",
    "name": "Ava Patel",
    "email": "ava@example.com",
    "role": "member"
  }
}
```

Tokens expire after seven days.

### Get the current user

`GET /auth/profile` — authenticated

**200 OK**

```json
{
  "success": true,
  "user": {
    "_id": "66b8c2f073fed123456789ab",
    "name": "Ava Patel",
    "email": "ava@example.com",
    "role": "member"
  }
}
```

## Routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | API health response. |
| `POST` | `/auth/register` | Public | Register a user. |
| `POST` | `/auth/login` | Public | Authenticate and receive a JWT. |
| `GET` | `/auth/profile` | Authenticated | Return the current user. |
| `POST` | `/public/leads` | Public | Submit a website contact form lead. |
| `GET` | `/leads/dashboard/stats` | Authenticated | Return role-filtered lead counts. |
| `GET` | `/leads/dashboard/activities` | Authenticated | Return latest role-filtered activity. |
| `GET` | `/leads/members` | Admin | List users for assignment. |
| `GET` | `/leads` | Authenticated | List leads with search, filters, and pagination. |
| `POST` | `/leads` | Admin | Create a lead. |
| `GET` | `/leads/:id` | Authenticated | Return one accessible lead. |
| `PUT` | `/leads/:id` | Authenticated | Update a lead; members may update only status on assigned leads. |
| `DELETE` | `/leads/:id` | Admin | Delete a lead. |
| `PUT` | `/leads/:id/assign` | Admin | Assign a lead to a user. |
| `POST` | `/leads/:id/notes` | Authenticated | Add a note to an accessible lead. |

## Leads

### Submit a public lead

`POST /public/leads`

```json
{
  "name": "Jordan Lee",
  "email": "jordan@acme.com",
  "phone": "+1 555 010 0248",
  "company": "Acme Inc.",
  "message": "We would like a CRM demo."
}
```

`name`, `email`, and `phone` are required. Public submissions are always created with the `new` status and cannot set an assignee.

**201 Created**

```json
{
  "success": true,
  "message": "Thank you! We will get back to you shortly.",
  "lead": {
    "id": "66b8c2f073fed123456789cd",
    "name": "Jordan Lee",
    "email": "jordan@acme.com"
  }
}
```

### List leads

`GET /leads` — authenticated

Supported query parameters:

| Parameter | Example | Description |
| --- | --- | --- |
| `search` | `Acme` | Case-insensitive search across name, email, and company. |
| `status` | `qualified` | One of `new`, `contacted`, `qualified`, or `lost`. |
| `page` | `2` | Page number; defaults to `1`. |
| `limit` | `10` | Results per page; defaults to `10`. |
| `mine` | `true` | Return only leads assigned to the authenticated user. |

Members are always limited to leads assigned to them, regardless of query parameters.

```http
GET /api/leads?status=new&page=1&limit=10
Authorization: Bearer <jwt-token>
```

**200 OK**

```json
{
  "success": true,
  "total": 1,
  "page": 1,
  "totalPages": 1,
  "leads": [
    {
      "_id": "66b8c2f073fed123456789cd",
      "name": "Jordan Lee",
      "email": "jordan@acme.com",
      "phone": "+1 555 010 0248",
      "company": "Acme Inc.",
      "status": "new",
      "assignedTo": null,
      "createdAt": "2026-07-30T10:30:00.000Z"
    }
  ]
}
```

### Create a lead

`POST /leads` — admin only

```json
{
  "name": "Jordan Lee",
  "email": "jordan@acme.com",
  "phone": "+1 555 010 0248",
  "company": "Acme Inc.",
  "status": "new",
  "assignedTo": "66b8c2f073fed123456789ab"
}
```

`assignedTo` is optional. Valid statuses are `new`, `contacted`, `qualified`, and `lost`.

### Get or update a lead

`GET /leads/:id` — authenticated

`PUT /leads/:id` — authenticated

Admin update example:

```json
{
  "name": "Jordan Lee",
  "email": "jordan@acme.com",
  "phone": "+1 555 010 0248",
  "company": "Acme Global",
  "status": "qualified"
}
```

Members can update only `status`, and only for leads assigned to them:

```json
{
  "status": "contacted"
}
```

**200 OK**

```json
{
  "success": true,
  "message": "Lead updated successfully",
  "lead": {
    "_id": "66b8c2f073fed123456789cd",
    "name": "Jordan Lee",
    "status": "qualified"
  }
}
```

### Assign a lead

`PUT /leads/:id/assign` — admin only

```json
{
  "assignedTo": "66b8c2f073fed123456789ab"
}
```

### Add a note

`POST /leads/:id/notes` — authenticated

```json
{
  "text": "Requested a follow-up call next Tuesday."
}
```

**201 Created**

```json
{
  "success": true,
  "message": "Note added successfully",
  "lead": {
    "_id": "66b8c2f073fed123456789cd",
    "notes": [
      {
        "text": "Requested a follow-up call next Tuesday.",
        "addedBy": {
          "name": "Ava Patel",
          "email": "ava@example.com"
        },
        "createdAt": "2026-07-30T10:45:00.000Z"
      }
    ]
  }
}
```

### Delete a lead

`DELETE /leads/:id` — admin only

**200 OK**

```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

## Dashboard

### Statistics

`GET /leads/dashboard/stats` — authenticated

Admins receive global counts; members receive counts for their assigned leads. `myLeads` is the number currently assigned to the signed-in user.

```json
{
  "success": true,
  "stats": {
    "totalLeads": 24,
    "newLeads": 8,
    "contactedLeads": 6,
    "qualifiedLeads": 7,
    "lostLeads": 3,
    "myLeads": 5
  }
}
```

### Latest activities

`GET /leads/dashboard/activities?limit=6` — authenticated

`limit` is optional, defaults to `6`, and is capped at `20`. Members receive activity only for their assigned leads.

```json
{
  "success": true,
  "activities": [
    {
      "_id": "66b8c2f073fed123456789ef",
      "action": "status_changed",
      "details": "Status changed from \"new\" to \"contacted\"",
      "lead": {
        "_id": "66b8c2f073fed123456789cd",
        "name": "Jordan Lee",
        "status": "contacted"
      },
      "performedBy": {
        "name": "Ava Patel",
        "email": "ava@example.com",
        "role": "member"
      },
      "timestamp": "2026-07-30T10:45:00.000Z"
    }
  ]
}
```

## Status codes

| Code | Meaning |
| --- | --- |
| `200 OK` | Request completed successfully. |
| `201 Created` | A user, lead, or note was created. |
| `400 Bad Request` | Required data is missing or invalid. |
| `401 Unauthorized` | The bearer token is missing, invalid, or expired; or login credentials are invalid. |
| `403 Forbidden` | The authenticated user lacks the required role or access to the lead. |
| `404 Not Found` | The requested lead or target user does not exist. |
| `500 Internal Server Error` | An unexpected server or database error occurred. |

## Error responses

Errors use a consistent shape:

```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

Examples:

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

**403 Forbidden**

```json
{
  "success": false,
  "message": "Access denied. This lead is not assigned to you."
}
```

**400 Bad Request**

```json
{
  "success": false,
  "message": "Note text is required."
}
```

## Folder structure

```text
leadflow-pro/
├── client/                     # React + Vite web application
│   └── src/
│       ├── pages/              # Public, auth, and dashboard screens
│       ├── components/         # Route guards and reusable UI
│       ├── context/            # Authentication state
│       └── services/           # Axios API client
├── server/                     # Express API
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # Request handlers
│   ├── middleware/             # JWT and role authorization
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── utils/                  # Activity logging utility
│   ├── app.js                  # Express application setup
│   ├── server.js               # Server entry point
│   └── seed.js                 # Development user seeding script
└── README.md                   # Project and API documentation
```

## Deployment guide

### 1. Provision MongoDB

Create a MongoDB Atlas cluster or another reachable MongoDB deployment. Create a database user with only the permissions the application needs, allow the deployment host in the database network rules, and copy its connection string into `MONGODB_URI`.

### 2. Deploy the API

Deploy the `server` directory to a Node.js host such as Render, Railway, Fly.io, or a container platform.

- Install command: `npm install`
- Start command: `npm start`
- Set `MONGODB_URI` and `JWT_SECRET` in the host's encrypted environment settings.
- Set `PORT` only if your host requires it; many hosts provide it automatically.
- Use HTTPS in production.

Before launch, update the CORS allowlist in `server/app.js` with the deployed web application's exact origin. Do not use a wildcard origin with credentialed requests.

### 3. Deploy the client

Build the client from the `client` directory:

```bash
npm install
npm run build
```

Deploy the generated `client/dist` directory to a static host such as Vercel, Netlify, or Cloudflare Pages.

Before building for production, update the API base URL in `client/src/services/api.js` and the public form URL in `client/src/pages/public/LandingPage.jsx` from the local development URL to your deployed API URL. Ensure the client origin is also present in the API CORS allowlist.

### 4. Production checklist

- Use a strong, unique `JWT_SECRET`.
- Restrict or remove public registration, especially admin-role registration.
- Never run `seed.js` in production.
- Store secrets only in the deployment provider's environment settings.
- Verify CORS, HTTPS, login, public lead submission, and role-based access after deployment.
