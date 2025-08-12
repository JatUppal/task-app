# Task-App
A simple full-stack app for personal task management with user authentication. Allows users create an account, 
log in, and manage a personal task list. Each user’s tasks are private and only accessible after logging in.

---

## Features

- **User authentication** with registration, login, and logout
- **JWT-based session handling** stored in `localStorage`
- **Full CRUD operations** for tasks: add, edit, toggle completion, and delete
- **Auto logout** when the server returns a `401 Unauthorized`
- **CORS configuration** to allow frontend–backend communication in development

---

## Tech Stack

**Backend**
- Python + Flask for REST API
- SQLite database
- Flask-JWT-Extended for authentication
- Flask-CORS for cross-origin requests

**Frontend**
- React + React Router
- Axios API client with token interceptor
- Custom `useAuth` hook for auth state management

---

## Project Structure
- backend/
  - app.py
  - routes/
    - auth.py
    - tasks.py
  - models.py
  - requirements.txt

- frontend/
  - src/
  - api/client.js
  - hooks/useAuth.js
  - pages/Login.jsx
  - pages/Tasks.jsx
  - components/TaskForm.jsx
  
---

## Getting Started

### Backend setup
  1. cd backend
  2. python -m venv venv
  3. source venv/bin/activate    # Mac/Linux
  4. venv\Scripts\activate       # Windows
  5. pip install -r requirements.txt
  6. flask run
### Frontend setup
  1. cd frontend
  3. npm install
  3. npm run dev
