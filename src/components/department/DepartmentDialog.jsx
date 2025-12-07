
import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Button,
  CircularProgress
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

export default function DepartmentDialog({ open, onClose, onSubmit, title, initial, loading }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: "" }
  });

  useEffect(() => {
    if (initial) reset({ name: initial.name });
    else reset({ name: "" });
  }, [initial, reset]);

  const submit = async (data) => {
    await onSubmit({ name: data.name });
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle color="#1976d2">{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller name="name" control={control} rules={{ required: "Nom requis" }} render={({ field }) =>
            <TextField 
              label="Nom du département" 
              fullWidth 
              error={!!errors.name} 
              helperText={errors.name?.message} 
              {...field} 
            />
          } />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Annuler</Button>
        <Button onClick={handleSubmit(submit)} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Sauvegarder"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}