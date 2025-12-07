import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useStore } from "../store/StoreContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// helper to parse JWT payload safely
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const { dispatch } = useStore();
  const navigate = useNavigate();

  // ready = lecture/validation initiale du token terminée (éviter la redirection pendant l'actualisation)
  const [ready, setReady] = useState(false);
  // Stocker localement le token analysé pour des vérifications rapides
  const [tokenPayload, setTokenPayload] = useState(null);

  // Validité du token (expiration)
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    const payload = parseJwt(token);
    if (!payload) return true;
    if (!payload.exp) return false;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec;
  }, []);

  // Appelée au démarrage pour mettre à jour l'utilisateur à partir du localStorage
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (token && !isTokenExpired(token)) {
          const payload = parseJwt(token);
          const user = {
            username: payload.sub,
            role: payload.role,
            department: payload.department || null,
            exp: payload.exp
          };
          dispatch({ type: "SET_USER", payload: user });
          setTokenPayload(payload);
        } else {
          // Token manquant ou expiré 
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
          setTokenPayload(null);
        }
      } catch (e) {
        localStorage.removeItem("token");
        dispatch({ type: "LOGOUT" });
        setTokenPayload(null);
      } finally {
        // Initialisation terminée — ProtectedRoute peut désormais décider de la redirection
        setReady(true);
      }
    })();
  }, [dispatch, isTokenExpired]);

  // login
  const login = async (username, password) => {
    const res = await api.post("/api/auth/login", { username, password });
    const token = res.data.token;
    localStorage.setItem("token", token);
    const payload = parseJwt(token);
    const user = { username: payload.sub, role: payload.role, department: payload.department || null, exp: payload.exp };
    dispatch({ type: "SET_USER", payload: user });
    setTokenPayload(payload);
    toast.success("Authentification réussie");
    return user;
  };

  // logout
  const logout = useCallback((redirectToLogin = true) => {
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    dispatch({ type: "LOGOUT" });
    setTokenPayload(null);
    if (redirectToLogin) {
      // Aller vers to login page
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate]);

 // Vérification automatique : si le token expire dans les N prochaines secondes, déconnexion optionnelle.
 // Configuration d'un délai d'expiration pour la déconnexion automatique afin de garantir la cohérence de l'interface utilisateur.

  useEffect(() => {
    if (!tokenPayload || !tokenPayload.exp) return undefined;
    const nowMs = Date.now();
    const expMs = tokenPayload.exp * 1000;
    const ttl = expMs - nowMs;
    if (ttl <= 0) {
      // Expiré
      logout(false); // Ne naviguez pas à partir d'ici — laissez ProtectedRoute ou axios intercepter la redirection une fois que la page sera prête.
      return undefined;
    }
    const timer = setTimeout(() => {
      // Token expiré. Supprimer et accéder à la page de connexion.
      logout(true);
      toast.error("Session expirée, veuillez vous reconnecter");
    }, ttl + 500); 
    return () => clearTimeout(timer);
  }, [tokenPayload, logout]);

  return (
    <AuthContext.Provider value={{ login, logout, ready, isTokenExpired }}>
      {children}
    </AuthContext.Provider>
  );
};