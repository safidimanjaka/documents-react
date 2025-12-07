import React, { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Box,
  IconButton,
  Link,
  Stack
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { useStore } from "../../store/StoreContext";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../ConfirmDialog";
import PaginationControls from "../PaginationControls";
import UserFormDialog from "./UserFormDialog";
import { userRole } from "./userRole";

export default function User() {
  const { state, dispatch } = useStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [openCreate, setOpenCreate] = useState(false); // État pour l'ouverture du dialogue de CRÉATION
  const [editingUser, setEditingUser] = useState(null); // Utilisé pour l'ouverture du dialogue de MODIFICATION

  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const { data, isLoading, error } = useQuery(
    ["users", page, pageSize],
    async () => {
      const res = await api.get("/api/users", {
        params: { page: Math.max(0, page - 1), size: pageSize }
      });
      return res.data;
    },
    {
      keepPreviousData: true,
      onSuccess: (d) => {
        dispatch({ type: "SET_USERS", payload: d.content || [] });
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to load users");
      }
    }
  );

  const { data: documents } = useQuery(["documents/all"], async () => {
    const res = await api.get("/api/documents/all");
    return res.data;
  }, { onSuccess: (d) => dispatch({ type: "SET_ALL_DOCUMENTS", payload: d }) });

  // --- MUTATION POUR LA CRÉATION ---
  const createMutation = useMutation((payload) => api.post("/api/users", payload), {
    onSuccess: async () => {
      toast.success("Utilisateur créé avec succès.");
      await queryClient.invalidateQueries(["users"]);
      setOpenCreate(false); // Fermer le dialogue après succès
    },
    onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de la création")
  });

  // --- MUTATION POUR LA MODIFICATION ---
  const updateMutation = useMutation(({ id, payload }) => api.put(`/api/users/${id}`, payload), {
    onSuccess: async () => {
      toast.success("Utilisateur mis à jour avec succès.");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null); // Fermer le dialogue après succès
    },
    onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de la mise à jour")
  });

  // La mutation de suppression 
  const deleteUser = useMutation((id) => api.delete(`/api/users/${id}`), {
    onSuccess: async () => {
      toast.success("Utilisateur supprimé.");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de la suppression")
  });
  
  // --- Fonction unique pour sauvegarder (gère Création et Modification) ---
  const handleSave = async (payload, userId) => {
    if (userId) {
      // Modification
      await updateMutation.mutateAsync({ id: userId, payload });
    } else {
      // Création
      await createMutation.mutateAsync(payload);
    }
  };

  //FONCTION POUR OUVRIR LA CRÉATION ---
  const startCreate = () => {
    setEditingUser(null); // S'assurer que le mode n'est pas "édition"
    setOpenCreate(true);
  };
  
  const startEdit = (user) => {
    setEditingUser(user);
    setOpenCreate(false); // S'assurer que le mode n'est pas "création"
  };

  const confirmDelete = (id) => {
    setToDeleteId(id);
    setOpenConfirm(true);
  };

  const deleteConfirmed = async () => {
    if (toDeleteId) {
      await deleteUser.mutateAsync(toDeleteId);
      setOpenConfirm(false);
    }
  };

  const getNbDocuments = (ownerId) => {
    return documents?.filter(doc => doc.owner?.id === ownerId).length || 0;
  }

  const displayNbDocuments = (ownerId) => {
    const nbDocuments = getNbDocuments(ownerId);
    if(nbDocuments > 1) {
      return `${nbDocuments} documents`;
    }
    return `${nbDocuments} document`;
  }

  const usersList = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 1);

  const canCreate = state.user?.role === "DIRECTOR";
  const canDelete = state.user?.role === "DIRECTOR";
  const canEditAny = state.user?.role === "DIRECTOR";
  const canEditDept = state.user?.role === "DEPT_HEAD";
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }} color="#1976d2">Utilisateurs</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {canCreate && <Button variant="contained" onClick={startCreate}>Créer utilisateur</Button>}
      </Stack>

      {isLoading && <CircularProgress />}

      {error && <Typography color="error">Erreur lors du chargement des utilisateurs</Typography>}

      <Box display="flex" flexDirection="column" gap={2}>
        {usersList.map((u) => {
          const canEdit = canEditAny || (canEditDept && state.user.department?.id === u.department?.id);
          return (
            <Box key={u.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle1">
                  {u.username} <Typography component="span" variant="body2" color="text.secondary">  {`(${userRole[u.role]})`}</Typography>
                </Typography>
                {
                   <Typography variant="body2" color="text.secondary">
                    {u.department ? ` Département: ${u.department.name}` : "Sans département"
                   }</Typography>
                }
                
                <Typography variant="body2">
                  { getNbDocuments(u.id) > 0 ?
                    <Link 
                      href={`/documents?userId=${u.id}`}
                      underline="hover"
                      color="#1976d2"
                    >
                      {displayNbDocuments(u.id)} 
                    </Link> :
                    displayNbDocuments(u.id)
                  }
                </Typography>
              </Box>

              <Box>
                {canEdit && <IconButton onClick={() => startEdit(u)} aria-label="edit"><Edit /></IconButton>}
                {canDelete && <IconButton onClick={() => confirmDelete(u.id)} aria-label="delete"><Delete /></IconButton>}
              </Box>
            </Box>
          );
        })}
      </Box>

      <PaginationControls
        page={page}
        setPage={setPage}
        count={totalPages}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      <ConfirmDialog open={openConfirm} title="Supprimer l'utilisateur" message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?" onClose={() => setOpenConfirm(false)} onConfirm={deleteConfirmed} />

      {/* Dialogue de CRÉATION d'utilisateur */}
      {canCreate && (
        <UserFormDialog
          open={openCreate}
          isCreation={true}
          onClose={() => setOpenCreate(false)}
          onSave={handleSave}
          // 'user' est null en mode création
        />
      )}

      {/* Dialogue de MODIFICATION d'utilisateur */}
      {editingUser && (
        <UserFormDialog
          open={!!editingUser}
          user={editingUser}
          isCreation={false}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}
    </Paper>
  );
}
