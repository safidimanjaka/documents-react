import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Button,
  CircularProgress
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

// Departments pour dropdown
const useDepartments = () => {
  return useQuery(
    ["departments/all"],
    async () => {
      const res = await api.get("/api/departments/all");
      return res.data;
    },
    { retry: false }
  );
};

export default function UserFormDialog({ open, user, onClose, onSave, isCreation = false }) {
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { username: "", password: "", role: "USER", department: "" } 
  });

  const { data: departments = [], isLoading: depsLoading } = useDepartments();

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          username: user.username,
          role: user.role,
          department: user.department?.id || ""
        });
      } else if (isCreation) {
        reset({
          username: "", 
          password: "", 
          role: "USER", 
          department: ""
        });
      }
    }
  }, [open, user, isCreation, reset]);

  const submit = async (data) => {
    const payload = {
      username: data.username,
      // Le mot de passe n'est requis qu'en création ou si l'utilisateur le change en édition
      ...(isCreation || data.password ? { password: data.password } : {}), 
      role: data.role,
      department: data.department ? { id: Number(data.department) } : null
    };
    
    // Le composant parent (UsersPage) est responsable de l'appel API via onSave
    await onSave(payload, user?.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isCreation ? "Créer un nouvel utilisateur" : "Modifier l'utilisateur"}</DialogTitle>
      
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller 
            name="username" 
            control={control} 
            rules={{ required: "Nom d'utilisateur obligatoire" }} 
            render={({ field }) => (
              <TextField 
                label="Nom d'utilisateur" 
                fullWidth 
                error={!!errors.username} 
                helperText={errors.username?.message} 
                {...field} 
              />
            )} 
          />
          
          {/* Le champ mot de passe n'est requis qu'à la création, ou s'il est utilisé en édition */}
          <Controller 
            name="password" 
            control={control} 
            rules={{ required: isCreation && "Mot de passe obligatoire" }} 
            render={({ field }) => (
              <TextField 
                label={`Mot de passe (${isCreation ? 'obligatoire' : 'laisser vide pour conserver l\'ancien'})`} 
                type="password" 
                fullWidth 
                error={!!errors.password} 
                helperText={errors.password?.message} 
                {...field} 
              />
            )} 
          />

          <Controller 
            name="role" 
            control={control} 
            rules={{ required: "Rôle obligatoire" }} 
            render={({ field }) => (
              <TextField 
                label="Rôle" 
                select 
                fullWidth 
                error={!!errors.role} 
                helperText={errors.role?.message} 
                {...field}
                disabled={user?.role === "DIRECTOR" && user?.id === 1}
              >
                <MenuItem value="USER">Simple utilisateur</MenuItem>
                <MenuItem value="EMPLOYEE">Employé</MenuItem>
                <MenuItem value="DEPT_HEAD">Chef de département</MenuItem>
                <MenuItem value="DIRECTOR">Directeur</MenuItem>
              </TextField>
            )} 
          />

          <Controller 
            name="department" 
            control={control} 
            render={({ field }) => (
              <TextField 
                label="Département" 
                select 
                fullWidth 
                helperText={depsLoading ? "Chargement des départements..." : "Choisir un département (optionel)"}
                {...field}
              >
                <MenuItem value="">Aucun</MenuItem>
                {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            )} 
          />
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={useMutation.isLoading}>Annuler</Button>
        <Button onClick={handleSubmit(submit)} variant="contained" disabled={useMutation.isLoading}>
          {useMutation.isLoading ? <CircularProgress size={20} /> : (isCreation ? "Créer" : "Sauvegarder")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}