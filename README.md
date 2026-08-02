# CampusConnect

**Campus Lost & Found Portal**
*Reconnecting Students with Their Belongings.*

A full-stack MERN application that lets students report, search, and claim lost and found items on campus, with a full admin panel to moderate reports and claims.

---

## Tech Stack

| Layer          | Technology                                              |
|----------------|----------------------------------------------------------|
| Frontend       | React (Vite), React Router DOM, Bootstrap 5, React-Bootstrap, Axios, React Icons |
| Backend        | Node.js, Express.js                                      |
| Database       | MongoDB + Mongoose ODM                                   |
| Authentication | JWT + bcryptjs                                            |
| Image Upload   | Multer (stored in `backend/uploads/`)                    |
| Validation     | express-validator                                         |

> **Note on bcrypt:** The spec calls for `bcrypt`. This project uses **`bcryptjs`** instead — a pure-JavaScript, API-compatible drop-in replacement. Native `bcrypt` requires a C++ build toolchain and frequently fails to install on Windows or machines without build tools. `bcryptjs` guarantees `npm install` works everywhere with identical hashing behavior. If you specifically need native `bcrypt`, swap the import in `backend/models/User.js` and reinstall.

---

## Project Structure

```
CampusConnect/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handler logic
│   ├── middleware/      # Auth, admin guard, upload, error handling
│   ├── models/           # Mongoose schemas (User, Item, Claim)
│   ├── routes/           # Express routers
│   ├── seed/              # Sample data seeding script
│   ├── uploads/          # Uploaded item images (created automatically)
│   ├── utils/             # Helpers (JWT generation)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/       # AuthContext (global auth state)
│   │   ├── pages/          # Route-level pages (+ pages/admin)
│   │   ├── services/      # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json           # Root convenience scripts
└── README.md
```

---

## 1. Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** — either:
  - Installed locally ([MongoDB Community Server](https://www.mongodb.com/try/download/community)), or
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster

---

## 2. MongoDB Setup Guide

### Option A — Local MongoDB

1. Install MongoDB Community Edition for your OS.
2. Start the MongoDB service:
   - **Windows:** MongoDB usually runs as a service automatically after install.
   - **macOS (Homebrew):** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`
3. Confirm it's running on the default port `27017`.
4. Your connection string will be:
   ```
   mongodb://127.0.0.1:27017/campusconnect
   ```

### Option B — MongoDB Atlas (cloud, no local install)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, add your current IP (or `0.0.0.0/0` for development).
4. Click **Connect → Drivers**, copy the connection string, and replace `<username>`, `<password>`, and add `/campusconnect` before the `?`:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusconnect?retryWrites=true&w=majority
   ```

Either way, this string goes into `backend/.env` as `MONGO_URI`.

---

## 3. Installation

```bash
# 1. Clone / unzip the project, then from the root folder:
cd CampusConnect

# 2. Install dependencies for both backend and frontend
npm run install:all

# (Alternatively, install manually)
cd backend && npm install
cd ../frontend && npm install
```

---

## 4. Environment Variables

**Backend** — copy the example file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@campusconnect.com
ADMIN_PASSWORD=Admin@123
```

**Frontend** — copy the example file:

```bash
cd frontend
cp .env.example .env
```

`frontend/.env` (defaults already work for local dev):

```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

---

## 5. Seed Sample Data (optional but recommended)

This creates one admin account, 3 sample students, 5 sample items, and 1 sample claim.

```bash
# from the root folder
npm run seed

# or directly:
cd backend
npm run seed
```

**Seeded logins:**

| Role    | Email                      | Password    |
|---------|-----------------------------|-------------|
| Admin   | admin@campusconnect.com    | Admin@123   |
| Student | aarav@campus.edu           | Student@123 |
| Student | priya@campus.edu           | Student@123 |
| Student | rohan@campus.edu           | Student@123 |

---

## 6. Running the Project

From the **root** folder (runs backend + frontend together):

```bash
npm run dev
```

Or run them separately in two terminals:

```bash
# Terminal 1
cd backend
npm run dev
# API running at http://localhost:5000

# Terminal 2
cd frontend
npm run dev
# App running at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 7. API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint             | Access  | Description                  |
|--------|-----------------------|---------|--------------------------------|
| POST   | `/auth/register`      | Public  | Register a new student account |
| POST   | `/auth/login`         | Public  | Login (student or admin)       |
| GET    | `/auth/profile`       | Private | Get current user's profile     |
| PUT    | `/auth/profile`       | Private | Update name/phone/password     |

### Items

| Method | Endpoint          | Access          | Description                                              |
|--------|--------------------|-----------------|------------------------------------------------------------|
| POST   | `/items`           | Private         | Create a Lost/Found report (multipart form, field `image`) |
| GET    | `/items`           | Public          | List items — supports `?search=&category=&status=&claimStatus=&location=&mine=true` |
| GET    | `/items/:id`       | Public          | Get single item details                                    |
| PUT    | `/items/:id`       | Private (owner) | Update own report (or admin)                                |
| DELETE | `/items/:id`       | Private (owner) | Delete own report (or admin)                                 |

### Claims

| Method | Endpoint       | Access         | Description                                     |
|--------|-----------------|----------------|----------------------------------------------------|
| POST   | `/claims`      | Private        | Submit a claim on an item                          |
| GET    | `/claims`      | Private        | List claims (own claims for students, all for admin; supports `?itemId=&status=`) |
| PUT    | `/claims/:id`  | Private (admin)| Approve or reject a claim (`{ "status": "Approved" }`) |

### Admin

| Method | Endpoint                     | Access | Description                     |
|--------|--------------------------------|--------|-----------------------------------|
| GET    | `/admin/stats`                 | Admin  | Dashboard statistics               |
| GET    | `/admin/users`                 | Admin  | List all users                     |
| DELETE | `/admin/users/:id`             | Admin  | Delete a user                      |
| PUT    | `/admin/items/:id/return`      | Admin  | Mark an item as Returned           |
| DELETE | `/admin/items/:id`             | Admin  | Delete a report (moderation)       |

---

## 8. Features Checklist

**Students:** register/login/logout, report lost/found items with image upload, edit/delete own reports, search & filter items, view item details, claim items, view my reports/claims, update profile.

**Admin:** view all users/reports/claims, approve/reject claims, delete fake reports, mark items as returned, dashboard with aggregate stats.

---

## 9. Troubleshooting

- **`MongoNetworkError` / connection refused:** MongoDB isn't running, or your `MONGO_URI` is wrong. Check step 2.
- **CORS errors in the browser:** Ensure `CLIENT_URL` in `backend/.env` matches the URL the frontend is running on (default `http://localhost:5173`).
- **Images not showing:** Confirm the backend is running and `VITE_UPLOADS_URL` in `frontend/.env` points to it (default `http://localhost:5000/uploads`).
- **401 errors after login:** Your `JWT_SECRET` may have changed after logging in — log out and log in again.

---

Built as a MERN full-stack college project. Happy hacking!
