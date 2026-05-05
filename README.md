# Personal Finance Tracker

A full-stack personal finance tracker for recording, updating, filtering, and visualizing expenses. The frontend is a React + Vite app, and the backend is a Spring Boot REST API connected to MongoDB Atlas.

The project is split into two deployable services:

- `client`: React + Vite frontend deployed on Vercel
- `server`: Spring Boot backend deployed on Render using Docker

## Tech Stack

### Frontend

- React
- Vite
- Axios
- Chart.js
- React Chart.js 2

### Backend

- Java 17
- Spring Boot
- Spring Web
- Spring Data MongoDB
- MongoDB Atlas
- Docker
- Maven

## Project Structure

```text
personal-finance-tracker/
+-- client/
|   +-- src/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   |   +-- index.css
|   |   +-- components/
|   |   |   +-- ExpenseChart.jsx
|   |   +-- services/
|   |       +-- api.js
|   |       +-- expenseService.js
|   +-- package.json
|   +-- vite.config.js
|
+-- server/
|   +-- src/main/java/com/finance/tracker/
|   |   +-- TrackerApplication.java
|   |   +-- config/
|   |   |   +-- CorsConfig.java
|   |   +-- controller/
|   |   |   +-- ExpenseController.java
|   |   +-- exception/
|   |   |   +-- GlobalExceptionHandler.java
|   |   |   +-- ResourceNotFoundException.java
|   |   +-- model/
|   |   |   +-- Expense.java
|   |   +-- repository/
|   |   |   +-- ExpenseRepository.java
|   |   +-- service/
|   |       +-- ExpenseService.java
|   +-- src/main/resources/
|   |   +-- application.properties
|   +-- Dockerfile
|   +-- pom.xml
|   +-- mvnw
|
+-- README.md
```

## Low Level Design

### System Overview

The application follows a simple client-server architecture.

```text
User Browser
    |
    | HTTPS requests
    v
React Frontend on Vercel
    |
    | Axios calls to /api/expenses
    v
Spring Boot Backend on Render
    |
    | Spring Data MongoDB
    v
MongoDB Atlas
```

The frontend is responsible for the user interface, form handling, filters, charts, and loading states. The backend owns business operations for expenses and provides REST endpoints. MongoDB Atlas stores the expense documents.

## Backend Design

The backend is designed with a layered structure:

```text
Controller Layer
    |
Service Layer
    |
Repository Layer
    |
MongoDB Collection
```

### 1. Model Layer

File:

```text
server/src/main/java/com/finance/tracker/model/Expense.java
```

The `Expense` model represents one expense document in MongoDB.

Fields:

```text
id        MongoDB document id
title     expense title
amount    expense amount
category  expense category
date      expense date
```

MongoDB collection:

```text
expenses
```

### 2. Repository Layer

File:

```text
server/src/main/java/com/finance/tracker/repository/ExpenseRepository.java
```

The repository extends `MongoRepository<Expense, String>`, which gives built-in CRUD operations.

Custom query methods:

```text
findByCategory(String category)
findByDate(String date)
```

Spring Data MongoDB automatically creates the queries from these method names.

### 3. Service Layer

File:

```text
server/src/main/java/com/finance/tracker/service/ExpenseService.java
```

The service layer contains the main backend business operations:

- Add an expense
- Get all expenses
- Get expense by id
- Update an expense
- Delete an expense
- Filter expenses by category
- Filter expenses by date

The service checks whether an expense exists before update or delete. If an expense is missing, it throws `ResourceNotFoundException`.

### 4. Controller Layer

File:

```text
server/src/main/java/com/finance/tracker/controller/ExpenseController.java
```

The controller exposes REST APIs under:

```text
/api/expenses
```

It receives HTTP requests from the frontend and passes the work to the service layer.

### 5. Exception Handling

Files:

```text
server/src/main/java/com/finance/tracker/exception/ResourceNotFoundException.java
server/src/main/java/com/finance/tracker/exception/GlobalExceptionHandler.java
```

If a requested expense does not exist, the backend returns a `404 Not Found` response with a JSON message.

Example:

```json
{
  "message": "Expense not found with id: 123"
}
```

### 6. CORS Configuration

File:

```text
server/src/main/java/com/finance/tracker/config/CorsConfig.java
```

CORS is configured globally for:

```text
/api/**
```

Allowed frontend origins are controlled through this environment variable:

```text
CORS_ALLOWED_ORIGINS
```

Example for Render:

```text
CORS_ALLOWED_ORIGINS=https://*.vercel.app,http://localhost:5173
```

This allows deployed Vercel frontend URLs and local development.

### 7. Application Configuration

File:

```text
server/src/main/resources/application.properties
```

Important properties:

```properties
spring.config.import=optional:file:.env[.properties]
server.port=${PORT:8080}
spring.data.mongodb.uri=${MONGODB_URI}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000}
```

Meaning:

- `MONGODB_URI` is used for MongoDB Atlas connection.
- `PORT` is provided automatically by Render.
- `CORS_ALLOWED_ORIGINS` controls which frontend domains can call the backend.
- `.env` is supported locally through Spring config import.

## API Endpoints

Base URL:

```text
http://localhost:8080/api/expenses
```

Production example:

```text
https://your-render-service.onrender.com/api/expenses
```

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/expenses` | Get all expenses |
| `POST` | `/api/expenses` | Add a new expense |
| `GET` | `/api/expenses/{id}` | Get one expense by id |
| `PUT` | `/api/expenses/{id}` | Update an expense |
| `DELETE` | `/api/expenses/{id}` | Delete an expense |
| `GET` | `/api/expenses/category/{category}` | Get expenses by category |
| `GET` | `/api/expenses/date/{date}` | Get expenses by date |

### Expense Request Body

```json
{
  "title": "Lunch",
  "amount": 250,
  "category": "Food",
  "date": "2026-05-05"
}
```

### Expense Response Body

```json
{
  "id": "6638f1...",
  "title": "Lunch",
  "amount": 250,
  "category": "Food",
  "date": "2026-05-05"
}
```

## Frontend Design

The frontend is a Vite React app. It communicates with the backend using Axios.

Important files:

```text
client/src/services/api.js
client/src/services/expenseService.js
client/src/App.jsx
client/src/components/ExpenseChart.jsx
```

The frontend API base URL is controlled by:

```text
VITE_API_BASE_URL
```

Local example:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

Production example:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

The app supports:

- Add expense
- Update expense
- Delete expense
- Filter by date
- Filter by category
- View total spending
- View last 30 days spending
- View chart by category
- Button loading states for deployed network delay

## Environment Variables

### Backend

Create:

```text
server/.env
```

Add:

```text
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

For production on Render:

```text
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
CORS_ALLOWED_ORIGINS=https://*.vercel.app,http://localhost:5173
```

Do not commit real passwords or secrets into a public repository.

### Frontend

Create:

```text
client/.env
```

Add:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

For production on Vercel:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

## Clone And Run Locally

### 1. Clone The Repository

```bash
git clone https://github.com/rajgithub24/personal-finance-tracker
cd personal-finance-tracker
```

### 2. Configure Backend Environment

Create `server/.env`:

```bash
cd server
```

Add this content to `server/.env`:

```text
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Run Backend Locally

From the `server` folder:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

Test endpoint:

```text
http://localhost:8080/api/expenses
```

### 4. Configure Frontend Environment

Open a new terminal and go to the client folder:

```bash
cd client
```

Create `client/.env`:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

### 5. Install Frontend Dependencies

From the `client` folder:

```bash
npm install
```

### 6. Run Frontend Locally

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Build Commands

### Backend Build

From the `server` folder:

```bash
./mvnw clean package -DskipTests
```

Windows PowerShell:

```powershell
.\mvnw.cmd clean package -DskipTests
```

### Frontend Build

From the `client` folder:

```bash
npm run build
```

## Deployment

### Backend On Render

Use Render Web Service with Docker.

Recommended settings:

```text
Runtime: Docker
Root Directory: server
```

Environment variables:

```text
MONGODB_URI=<your MongoDB Atlas URI>
CORS_ALLOWED_ORIGINS=https://*.vercel.app,http://localhost:5173
```

The backend Dockerfile builds the Spring Boot jar and runs it with Java 17.

### Frontend On Vercel

Recommended settings:

```text
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Environment variable:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

After changing a Vercel environment variable, redeploy the frontend because Vite injects env variables during build time.

## Common Deployment Issues

### Frontend Calls `/expenses` Instead Of `/api/expenses`

Make sure Vercel has:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

The value must include `/api`.

### CORS Error From Vercel

Make sure Render has:

```text
CORS_ALLOWED_ORIGINS=https://*.vercel.app,http://localhost:5173
```

Then redeploy the Render backend.

### MongoDB Connection Error

Check:

- `MONGODB_URI` is present in Render.
- The MongoDB username and password are correct.
- Special characters in the password are URL encoded.
- MongoDB Atlas Network Access allows Render connections.

## Future Improvements

- Add user authentication
- Store dates as date values instead of strings
- Add pagination for large expense lists
- Add backend validation for request bodies
- Add monthly reports
- Add unit tests for service and controller layers
- Add Swagger/OpenAPI documentation
