````markdown
# Confidential Docs - Frontend

This React frontend implements a simple UI for the Confidential Document Management backend.

Features
- Material UI for UI components.
- Axios for API calls with JWT Authorization header automatically attached.
- Central state managed with useReducer (StoreContext).
- Auth handling in AuthContext storing JWT in localStorage.
- Pages: Login, Documents (upload/list/download/edit/delete), Users (list/create/delete), Departments (list/create/rename/delete).
- Uses HTTPS (REACT_APP_API_URL should be https://... in .env), do not bypass SSL verification in production.

Quick start
1. Copy the frontend files into a Create React App scaffold or use the package.json included.
2. Create a .env file at project root with:
   REACT_APP_API_URL=https://localhost:8443
3. Install dependencies:
   npm install
4. Start:
   npm start

Security notes
- The app stores JWT in localStorage for simplicity. For higher security use httpOnly cookies and CSRF handling.
- Ensure your browser trusts the local dev certificate or run backend with a valid TLS cert.
- Do not disable SSL verification in production.

Developer notes
- The frontend expects the backend API routes as described in the README of the backend.
- The client relies on payload inside the JWT to set basic user info (username & role). If JWT structure differs, adjust AuthContext.
- The StoreContext reducer is purposely minimal — adapt to your needs (pagination, optimistic updates, error handling).
