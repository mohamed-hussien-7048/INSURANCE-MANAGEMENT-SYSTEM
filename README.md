# Insurance Management System

A full-stack insurance management application built with React, TypeScript, Node.js, Express, and Microsoft SQL Server.

## Requirements

- Node.js and npm
- Microsoft SQL Server
- ODBC Driver 18 for SQL Server
- Windows authentication configured for the database

## Project Structure

- `backend/` - API, authentication, authorization, and database integration
- `frontend/` - React user interface
- `database/` - Database scripts and migrations

## Configuration

Create local environment files from the examples:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

Configure `backend/.env` with the SQL Server instance name and database name. Ensure the insurance API uses port `3001`.

The frontend API URL should be:

`VITE_API_URL=http://localhost:3001/api`

Do not commit environment files or credentials.

## Run Locally

Open two separate PowerShell terminals.

### 1. Backend

```powershell
Set-Location "H:\S-Software Engineer\Test_Project\FAHD_1\backend"
npm install
npm run dev
```

### 2. Frontend

```powershell
Set-Location "H:\S-Software Engineer\Test_Project\FAHD_1\frontend"
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Verification

Run backend checks from the `backend` directory:

```powershell
npm test
npm run typecheck
npm run build
```

Run frontend checks from the `frontend` directory:

```powershell
npm test
npm run lint
npm run build
```

## API Health Check

With the backend running, visit:

`http://localhost:3001/api/health`

## Security and Data Safety

- Authorization is enforced by the backend.
- The application uses session cookies and CSRF protection.
- Keep real credentials and local `.env` files private.
- Review database migrations before executing them against any database containing real data.
- Back up important data before approved database changes.

## Service Ports

- Insurance API: `3001`
- Frontend development server: `5173`
- Attendance service: `3000` (separate service; do not modify as part of this project)
