import React, { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Stack,
  Link
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
// Removed useForm, Controller
import { toast } from "react-hot-toast";
import ConfirmDialog from "../ConfirmDialog";
import PaginationControls from "../PaginationControls";
import DepartmentDialog from "./DepartmentDialog";
import { useStore } from "../../store/StoreContext";


export default function Department() {
  const { state, dispatch } = useStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editing, setEditing] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const { data: departments, isLoading } = useQuery(
    ["departments", page, pageSize], 
    async () => {
      const res = await api.get("/api/departments",{
        params: { page: Math.max(0, page - 1), size: pageSize }
      });
      return res.data;
    }, 
    { 
      onSuccess: (d) => dispatch({ type: "SET_DEPARTMENTS", payload: d }) 
    }
  );

  const { data: documents } = useQuery(["documents/all"], async () => {
    const res = await api.get("/api/documents/all");
    return res.data;
  }, { onSuccess: (d) => dispatch({ type: "SET_ALL_DOCUMENTS", payload: d }) });


  const createDept = useMutation((payload) => api.post("/api/departments", payload), {
    onSuccess: async () => {
      toast.success("Département créé.");
      await queryClient.invalidateQueries(["departments"]);
      setOpenCreate(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de la création") // Translated
  });

  const updateDept = useMutation(({ id, payload }) => api.put(`/api/departments/${id}`, payload), {
    onSuccess: async () => {
      toast.success("Département modifié.");
      await queryClient.invalidateQueries(["departments"]);
      setEditing(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de la modification") // Translated
  });

  const deleteDept = useMutation((id) => api.delete(`/api/departments/${id}`), {
    onSuccess: async () => {
      toast.success("Département supprimé.");
      await queryClient.invalidateQueries(["departments"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.error || "Échec de la suppression") // Translated
  });

  const startEdit = (d) => {
    setEditing(d);
  };

  const confirmDelete = (id) => {
    setToDeleteId(id);
    setOpenConfirm(true);
  };

  const deleteConfirmed = async () => {
    toDeleteId && await deleteDept.mutateAsync(toDeleteId);
  };

  const getNbDocuments = (departmentId) => {
    return documents?.filter(doc => doc.department?.id === departmentId).length || 0;
  }

  const displayNbDocuments = (departmentId) => {
    const nbDocuments = getNbDocuments(departmentId);
    if(nbDocuments && nbDocuments > 1) {
      return `${nbDocuments} documents`;
    }
    return `${nbDocuments || 0} document`;
  }

  const departmentList = departments?.content || [];
  const totalPages = Math.max(1, departments?.totalPages || 1);

  const canCreate = state.user?.role === "DIRECTOR";
  const canEdit  = (departmentId) => {return state.user?.role === "DIRECTOR" || (state.user?.role === "DEPT_HEAD" && state.user.department?.id == departmentId)};
  const canDelete  = (departmentId) => {return state.user?.role === "DIRECTOR" || (state.user?.role === "DEPT_HEAD" && state.user.department?.id == departmentId)};

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }} color="#1976d2">Départements</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {canCreate && <Button variant="contained" onClick={() => setOpenCreate(true)}>Créer un département</Button>}
      </Stack>

      {isLoading && <CircularProgress />}

      <Box display="flex" flexDirection="column" gap={2}>
        {departmentList.map((d) => (
          <Box key={d.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="subtitle1">{d.name}</Typography>
              <Typography variant="body2">
                { getNbDocuments(d.id) > 0 ?
                    <Link 
                      href={`/documents?departmentId=${d.id}`}
                      underline="hover"
                      color="#1976d2"
                    >
                      {displayNbDocuments(d.id)} 
                    </Link> :
                    displayNbDocuments(d.id)
                  }
              </Typography>
            </Box>

            <Box>
              {canEdit(d.id) && <IconButton onClick={() => startEdit(d)}><Edit /></IconButton>}
              {canDelete(d.id) && <IconButton onClick={() => confirmDelete(d.id)}><Delete /></IconButton>}
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

      <ConfirmDialog open={openConfirm} title="Supprimer le département" message="Supprimer ce département? Autorisé seulement si aucun utilisateur/document n'y est rattaché." onClose={() => setOpenConfirm(false)} onConfirm={deleteConfirmed} /> {/* Translated title/message */}

      {/* Création de département avec DepartmentDialog */}
      <DepartmentDialog 
        open={openCreate} 
        onClose={() => setOpenCreate(false)} 
        onSubmit={async (payload) => await createDept.mutateAsync(payload)} 
        title="Créer un département"
        loading={createDept.isLoading}
      />

      {/* Modification de département avec DepartmentDialog */}
      {editing && 
        <DepartmentDialog 
          open={!!editing} 
          onClose={() => setEditing(null)} 
          onSubmit={async (payload) => await updateDept.mutateAsync({ id: editing.id, payload })} 
          title={`Modifier ${editing.name}`} 
          initial={editing}
          loading={updateDept.isLoading}
        />
      }
    </Paper>
  );
}