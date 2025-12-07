import axios from "axios";

// history is used to navigate to /login from here; alternatively you can import navigate from react-router-dom v6 helper in components,
// but axios file is outside react lifecycle so we use history push or window.location.
const history = typeof window !== "undefined" ? window : null;


// function getBaseURL() {
//   const defaultUrl = "http://localhost:8080" ;
//   return import.meta.env.DEV ? defaultUrl : import.meta.env.VITE_API_URL || defaultUrl;
// }

function getBaseURL() {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined") {
    if (window.__ENV && window.__ENV.VITE_API_URL) return window.__ENV.VITE_API_URL;
    if (window.REACT_APP_API_URL) return window.REACT_APP_API_URL;
  }
  // development fallback for vite proxy mode (use relative /api)
  if (typeof window !== "undefined" && window.location.port === "5173") {
    return "/api";
  }
  return "http://localhost:8080";
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach token automatically if present in localStorage
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Response interceptor to handle 401/403 (token expired or invalid)
// We avoid redirecting immediately during app bootstrap by checking a small flag:
// if the app hasn't finished initialization (AuthProvider.ready false), don't redirect here.
// To communicate ready state we cannot import AuthContext directly here without creating circular deps;
// instead we rely on a simple approach: if window.__APP_READY is true -> safe to redirect; otherwise, postpone.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // remove token
      try { localStorage.removeItem("token"); } catch (e) {}
      // if app is ready (set by AuthProvider), navigate to /login
      const appReady = typeof window !== "undefined" ? window.__APP_READY === true : false;
      if (appReady) {
        // navigate to login page
        if (history && history.location) {
          // if running in browser environment
          window.location.href = "/login";
        } else {
          // fallback
          window.location.href = "/login";
        }
      } else {
        // not ready yet (likely initial reload) -> just clear token, do not redirect now.
        // later, once AuthProvider sets window.__APP_READY = true, ProtectedRoute will redirect if needed.
        console.warn("API returned 401/403 during bootstrap; token cleared but not redirecting (bootstrap).");
      }
    }
    return Promise.reject(error);
  }
);

export default api;