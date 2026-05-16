# Courier Management React

React frontend for the courier management system. This project provides separate user and employee dashboard flows on top of the MVC and Spring Boot backends.

## Tech Stack
- React
- TypeScript
- Vite
- React Router

## What This Project Handles

### User Features
- Login and registration
- Book Courier
- Payment flow
- Active Orders
- Completed Orders
- Cancelled Orders
- Profile update
- Password change
- Profile image upload through backend

### Employee Features
- Login
- Available Orders
- Taken Orders
- Completed Deliveries
- Profile update
- Password change
- Profile image upload through backend

## Default Local Runtime
- Frontend URL: `http://localhost:3333`
- Spring Boot API: `http://localhost:9090`
- MVC API: `http://localhost:8080/courier_management2`

## Environment Variables
Create a local `.env` file from `.env.example`:

```env
VITE_SPRING_API_URL=http://localhost:9090
VITE_MVC_API_URL=http://localhost:8080/courier_management2
```

## Install
```bash
npm install
```

## Run
```bash
npm run dev
```

The Vite server is configured to run on port `3333`.

## Build
```bash
npm run build
```

## Notes
- This frontend depends on both backend repositories running locally.
- Authentication is JWT-based.
- Unauthorized API responses redirect the user back to the login screen.
- Profile image upload is handled by the MVC backend, not by direct client-to-cloud upload.
