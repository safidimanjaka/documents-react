import React from "react";
import { useStore } from "../store/StoreContext";
import { useAuth } from "../store/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { state } = useStore();
  const { ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return null;
  }

  if (!state.user) {
     try { localStorage.removeItem("token"); } catch (e) {};
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}