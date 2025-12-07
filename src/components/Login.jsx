import React, { useState } from "react";
import {
  Paper,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useForm } from "react-hook-form";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Login() {
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const { register: rhfRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm();
  const [loadingLogin, setLoadingLogin] = useState(false);
  
  const onSubmitLogin = async (data) => {
    setLoadingLogin(true);
    try {
      await login(data.username, data.password);
      navigate("/documents");
    } catch (err) {
      toast.error(err?.response?.data?.message || "L'authentification a échoué");
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 480, margin: "0 auto" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">Se connecter</Typography>

        <Box component="form" onSubmit={handleLoginSubmit(onSubmitLogin)} sx={{ mt: 2, width: "100%" }}>
          <TextField
            label="Nom d'utilisateur"
            fullWidth
            margin="normal"
            {...rhfRegister("username", { required: "Nom d'utilisateur obligatoire" })}
            error={!!loginErrors.username}
            helperText={loginErrors.username?.message}
          />
          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            margin="normal"
            {...rhfRegister("password", { required: "Mot de passe obligatoire" })}
            error={!!loginErrors.password}
            helperText={loginErrors.password?.message}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: "center" }}>
            <Button variant="contained" type="submit" disabled={loadingLogin}>
              {loadingLogin ? <CircularProgress size={20} /> : "Se connecter"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}