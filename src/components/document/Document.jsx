import React, { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Stack,
} from "@mui/material";
import { GetApp, Delete, Edit, UploadFile } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../ConfirmDialog";
import { useSearchParams } from 'react-router-dom';

import { useStore } from "../../store/StoreContext";
import UploadDialog from "./UploadDialog";
import EditDialog from "./EditDialog";
import PaginationControls from "../PaginationControls";
import api from "../../api/axios";

export default function Document() {
  const { state, dispatch } = useStore();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [owner, setOwner] = useState("");
  const [department, setDepartment] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [searchParams] = useSearchParams();
  
  const ownerId = searchParams.get('userId');
  const departmentId = searchParams.get('departmentId');
  
  const { data: documents, isLoading } = useQuery(
    ["documents", page, pageSize, ownerId, departmentId],
    async () => {
      const res = await api.get("/api/documents", {
        params: { 
          page: Math.max(0, page - 1), 
          size: pageSize, 
          ownerId,
          departmentId
        }
      });
      let documents = res.data?.content;
      if (ownerId) {
        setOwner(documents[0]?.owner);
      }
      if (departmentId) {
        setDepartment(documents[0]?.department);
      }
      return res.data; 
    },
    {
      onSuccess: (d) => dispatch({ type: "SET_DOCUMENTS", payload: d }),
    }
  );

  const uploadDoc = useMutation(
    (formData) =>
      api.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    {
      onSuccess: async () => {
        toast.success("Upload réussi");
        await queryClient.invalidateQueries(["documents"]);
        setOpenCreate(false);
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de l'upload"),
    }
  );

  const deleteDoc = useMutation((id) => api.delete(`/api/documents/${id}`), {
    onSuccess: async () => {
      toast.success("Document supprimé");
      await queryClient.invalidateQueries(["documents"]);
      setOpenConfirm(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de la suppression"),
  });

  const updateDoc = useMutation(({ id, payload }) => api.put(`/api/documents/${id}`, payload), {
    onSuccess: async () => {
      toast.success("Document modifié");
      await queryClient.invalidateQueries(["documents"]);
      setOpenEdit(false);
      setEditing(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de la modification"),
  });

  const startEdit = (d) => {
    setEditing(d);
    setOpenEdit(true);
  };

  const confirmDelete = (id) => {
    setToDeleteId(id);
    setOpenConfirm(true);
  };

  const deleteConfirmed = async () => {
    if (toDeleteId) await deleteDoc.mutateAsync(toDeleteId);
  };

  const documentsList = documents?.content || [];
  const totalPages = Math.max(1, documents?.totalPages || 1);

  const canEdit = (doc) => {
    const role = state.user?.role;
    if (role === "DIRECTOR") return true;
    if (role === "DEPT_HEAD") return state.user.department?.id && doc.department?.id && state.user.department.id === doc.department.id;
    if (role === "EMPLOYEE") return doc.owner?.username === state.user.username;
    return false;
  };

  const download = async (id, filename) => {
    try {
      const res = await api.get(`/api/documents/${id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `document_${id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Document téléchargé");
    } catch (err) {
      toast.error("Le téléchargement a échoué");
    }
  };

  const optionsCourt = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  }


  return (
    <Paper sx={{ p: 2 }}>
      <Typography color = "#1976d2" variant="h5" sx={{ mb: 2 }}>
        {!ownerId && !departmentId  ? 
          "Tous les documents" : 
            `Documents ${ownerId ? `de l'utilisateur ${owner.username}` 
              : (departmentId ? 
                ` du département 
                  ${department.name}` : ""
                )}`
        }
      </Typography>

      <Stack direction="row" spacing={2} sx={{ my: 2 }} alignItems="center">
        <Button variant="contained" onClick={() => setOpenCreate(true)} startIcon={<UploadFile />}>
          Upload document
        </Button>
      </Stack>

      {isLoading && <CircularProgress />}

      <Box display="flex" flexDirection="column" gap={2}>
        {documentsList.map((d) => (
          <Box
            key={d.id}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle1">{`${d.filename} (${d.size} Ko)`}</Typography>
              <Typography variant="body2" color="text.secondary">
                Propriétaire: {d.owner?.username || "?"} - département: {d.department?.name || "?"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {d.createdAt ? `Date de création: ${new Date(d.createdAt).toLocaleDateString('fr-FR', optionsCourt)}`: ""} 
              </Typography>
            </Box>

            <Box>
              {canEdit(d) && (
                <>
                  <IconButton onClick={() => download(d.id, d.filename)} aria-label="download">
                      <GetApp />
                  </IconButton>
                  
                  <IconButton onClick={() => startEdit(d)} aria-label="edit">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => confirmDelete(d.id)} aria-label="delete">
                  <Delete />
                </IconButton>
                </>
              )}
            </Box>
          </Box>
        ))}
      </Box>

       <PaginationControls
        page={page}
        setPage={setPage}
        count={totalPages}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      <ConfirmDialog open={openConfirm} title="Suppression de document" message="Supprimer ce document?" onClose={() => setOpenConfirm(false)} onConfirm={deleteConfirmed} />

      {/*Dialogue de CRÉATION (UploadDialog) */}
      <UploadDialog open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        await uploadDoc.mutateAsync(fd); 
      }} loading={uploadDoc.isLoading} />

      {/*Dialogue de MODIFICATION (EditDialog) */}
      {editing && (
        <EditDialog
          open={openEdit}
          doc={editing}
          onClose={() => {
            setOpenEdit(false);
            setEditing(null);
          }}
          onSubmit={async (payload) => {
            await updateDoc.mutateAsync({ id: editing.id, payload });
          }}
          loading={updateDoc.isLoading}
        />
      )}
      
    </Paper>
  );
}