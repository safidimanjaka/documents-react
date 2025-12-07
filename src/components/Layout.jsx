import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { useAuth } from "../store/AuthContext";
import defaultAvatar from "../assets/default-avatar.svg";

export default function Layout({ children }) {
  const { state } = useStore();
  const { logout } = useAuth();

  const username = state.user?.username || "";
  const avatarSrc = state.user?.avatarUrl || defaultAvatar;

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* <Typography variant="h6">
              Gestionn de documents confidentiels
            </Typography> */}
            {state.user && (
              <>
                <Button color="inherit" component={RouterLink} to="/documents">
                  Documents
                </Button>
                <Button color="inherit" component={RouterLink} to="/departments">
                  Départements
                </Button>
                <Button color="inherit" component={RouterLink} to="/users">
                  Utilisateurs
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {state.user ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mr: 1 }}>
                  <Avatar
                    src={avatarSrc}
                    alt={username}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5 }}>
                    {username}
                  </Typography>
                </Box>

                <Button color="inherit" onClick={() => logout()}>
                  Déconnexion
                </Button>
              </Box>
            ) : (
              <Button color="inherit" component={RouterLink} to="/login">
                Connexion
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <main>{children}</main>
    </>
  );
}