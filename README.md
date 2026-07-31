# LeadFlow Pro CRM

LeadFlow Pro is a role-based Customer Relationship Management (CRM) application built using the MERN stack. It enables organizations to capture, assign, manage, and track sales leads through secure authentication and role-based access control.

---

## Demo Credentials

### Admin

Email: admin@leadflow.com

Password: admin123

### Member

Email: member@leadflow.com

Password: member123

---

## Live Demo

Frontend:
https://leadflow-pro-nu.vercel.app

Backend API:
https://leadflow-pro-backend-7jw6.onrender.com

GitHub Repository:
https://github.com/inja687/leadflow-pro

---

## Features

- Role-Based Authentication (Admin & Member)
- JWT Authentication
- Lead Management (Create, Read, Update, Delete)
- Lead Assignment
- Notes Management
- Activity Timeline
- Dashboard Analytics
- Notifications
- Public Lead Request Form
- Search, Filter and Pagination
- Responsive User Interface

---

## Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Token (JWT)

---



## API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

### Leads

- GET /api/leads
- POST /api/leads
- GET /api/leads/:id
- PUT /api/leads/:id
- DELETE /api/leads/:id
- PUT /api/leads/:id/assign
- POST /api/leads/:id/notes

### Dashboard

- GET /api/leads/dashboard/stats
- GET /api/leads/dashboard/activities

### Notifications

- GET /api/notifications

### Public

- POST /api/public/leads

---

## Installation

### Clone Repository

```bash
git clone https://github.com/inja687/leadflow-pro.git
cd leadflow-pro
```

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

### Server (.env)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### Client (.env)

```env
VITE_API_URL=http://localhost:5000
```

---

## Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas
