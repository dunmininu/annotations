# Fullstack Application

This repository contains the **backend** built with Django and Django Ninja, and the **frontend** built with Vite, React.js, and Yarn.

---

## Table of Contents

1. [Features](#features)
2. [Requirements](#requirements)
3. [Installation](#installation)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
   - [Backend](#backend)
   - [Frontend](#frontend)
6. [Deployment](#deployment)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

- **Backend**:
  - User authentication and authorization
  - RESTful API using Django Ninja
  - Database management and migrations
  - Static file handling for production
- **Frontend**:
  - Modern UI built with React.js and Vite
  - React Router for client-side routing
  - State management via React hooks
  - Optimized for fast builds with Vite

---

## Requirements

- **Backend**:
  - Python 3.9+
  - Django 4.2+
  - PostgreSQL or SQLite (for development)
- **Frontend**:
  - Node.js 16+
  - Yarn package manager
- General:
  - Git for version control

---

## Installation

### Backend Setup

1. Navigate to the `labelbox_backend` directory:

   ```
   cd labelbox_backend
   ```

2. Create a virtual environment and activate it:

   ```
   python3 -m venv env
   source env/bin/activate
   ```

3. Install backend dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Apply database migrations:

   ```
   python manage.py migrate
   ```

5. Create a superuser for the admin panel:

   ```
   python manage.py createsuperuser
   ```

---

### Frontend Setup

1. Navigate to the `frontend` directory:

   ```
   cd frontend
   ```

2. Install frontend dependencies using Yarn:

   ```
   yarn install
   ```

3. Update the `vite.config.js` file if needed to match backend's URL.

---

## Configuration

### Backend

1. Create a `.env` file in the `backend` directory and add the following:

   ```env
    POSTGRES_NAME
    POSTGRES_USER
    POSTGRES_PASSWORD
    POSTGRES_HOST
    SECRET_KEY
    CLOUDINARY_API_KEY
    CLOUDINARY_CLOUD_NAME="dunmininu"
    CLOUDINARY_SECRET_KEY
    LIVE_URL
   ```

2. Ensure your `settings.py` file uses these environment variables.

---

### Frontend

1. Create a `.env` file in the `frontend` directory and add:

   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

2. Adjust the `VITE_API_BASE_URL` for production if necessary.

---

## Running the Application

### Backend

1. Start the Django development server:

   ```
   python manage.py runserver
   ```

2. Access the backend API at `http://127.0.0.1:8000`.

---

### Frontend

1. Start the Vite development server:

   ```
   yarn dev
   ```

2. Access the frontend at `http://127.0.0.1:3000`.

---

## Deployment

### Backend

1. Use a WSGI server like Gunicorn for production:

   ```
   gunicorn labelbox_backend.wsgi:application --bind 0.0.0.0:8000
   ```

2. Set up a reverse proxy (e.g., Nginx) to forward requests to Gunicorn.

3. Configure a production database (e.g., PostgreSQL).

---

### Frontend

1. Build the frontend for production:

   ```
   yarn build
   ```

2. Serve the static files using a CDN, static hosting (e.g., Netlify, Vercel), or configure a web server like Nginx.

3. Update the backend to serve the built frontend files if using a single server for both backend and frontend.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature/bugfix.
3. Commit your changes and push the branch.
4. Submit a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---
