# LeadFlow Pro CRM

LeadFlow Pro is a role-based CRM application built with the MERN stack. It supports public lead requests, admin/member dashboards, lead assignment, notes, activity tracking, notifications, and secure authentication.

---

## Demo Credentials

### Admin
Email: admin@leadflow.com  
Password: admin123

### Member
Email: member@leadflow.com  
Password: member123

---

## Live Links

Frontend: https://leadflow-pro-nu.vercel.app  
Backend API: https://leadflow-pro-backend-7jw6.onrender.com  
GitHub Repository: https://github.com/inja687/leadflow-pro

---

## Features

- Public lead request form
- Admin and member authentication
- Role-based access control
- Lead management
- Lead assignment
- Notes with timestamps
- Activity trail
- Notifications
- Search, filter, and pagination
- Dashboard statistics
- Responsive design

---

## Technology Stack

Frontend:
- React
- Vite
- Tailwind CSS
- React Router
- Axios

Backend:
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT

Testing:
- Vitest
- React Testing Library
- Jest
- Supertest

---

## Project Structure

```text
leadflow-pro/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vercel.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
└── README.md
