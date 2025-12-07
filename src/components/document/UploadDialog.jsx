// src/components/UploadDialog.jsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Button,
  Typography,
  CircularProgress,
  FormControl,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

export default function UploadDialog({ open, onClose, onSubmit, loading }) {
  const { handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: { file: null }
  });

  const [fileName, setFileName] = useState("Aucun fichier choisi");
  const fileWatch = watch("file");

  const resetForm = () => {
    reset();
    setFileName("Aucun fichier choisi");
  }

  const submit = async (data) => {
    if (!data.file || data.file.length === 0) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    } else if(data.file[0].size > 1048576){
      toast.error("La taille du fichier ne doit pas dépasser 1 Mo");
      return;
    }
    await onSubmit(data.file[0]); 
    resetForm();
  };

  const cancelDialog = () => {
   resetForm();
   onClose();
  };

  // Met à jour le nom de fichier affiché
  useEffect(() => {
    if (fileWatch && fileWatch.length > 0) {
      setFileName(`${fileWatch[0].name} (${(fileWatch[0].size/1024).toFixed(1)} Ko)`);
    } else {
      setFileName("Aucun fichier choisi");
    }
  }, [fileWatch]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle color="#1976d2">Upload document</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <Stack direction="row" spacing={2} sx={{ my: 2 }} alignItems="center">
              <Button variant="contained" component="label" startIcon={<UploadFile />}>
                Choisir un fichier
                <input type="file" hidden onChange={(e) => setValue("file", e.target.files)}/>
              </Button>
              {fileName && <Typography>{fileName}</Typography>}
            </Stack>
            {errors.file && <Typography color="error">{errors.file.message}</Typography>}
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelDialog} disabled={loading}>Annuler</Button>
        <Button onClick={handleSubmit(submit)} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}