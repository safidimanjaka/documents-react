import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from "@mui/material";

export default function ConfirmDialog({ open, title, message, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth>
      <DialogTitle color = "#1976d2">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button variant="contained" onClick={() => { onConfirm(); onClose(); }}>Confirmer</Button>
      </DialogActions>
    </Dialog>
  );
}