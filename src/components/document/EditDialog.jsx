import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  CircularProgress
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

export default function EditDialog({ open, doc, onClose, onSubmit, loading }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { filename: "" }
  });

  // Réinitialise le formulaire avec le nom de document existant lors de l'ouverture
  useEffect(() => {
    if (doc) reset({ filename: doc.filename });
  }, [doc, reset]);

  const submit = async (data) => {
    // L'appel réel à l'API est géré par la fonction onSubmit passée par le parent
    await onSubmit({ filename: data.filename });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle color = "#1976d2">Modifier le document</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller 
            name="filename" 
            control={control} 
            rules={{ required: "Le nom de fichier est requis" }} 
            render={({ field }) => (
              <TextField 
                label="Nom du fichier" 
                fullWidth 
                error={!!errors.filename} 
                helperText={errors.filename?.message} 
                {...field} 
              />
            )} 
          />
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