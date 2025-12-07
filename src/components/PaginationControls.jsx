import React from "react";
import { Pagination, Stack, Box, MenuItem, TextField } from "@mui/material";

export default function PaginationControls({ page, setPage, count, pageSize, setPageSize }) {
  return (
    <Stack spacing={1} sx={{ mt: 2, mb: 2, alignItems: "center" }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Pagination
          page={page}
          onChange={(e, p) => setPage(p)}
          count={Math.max(1, count || 1)}
          color="primary"
        />
        {typeof setPageSize === "function" && (
          <TextField
            select
            size="small"
            label="Par page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1); // go back to first page when changing size
            }}
            sx={{ width: 120 }}
          >
            {[5, 8, 10, 20, 50].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>
    </Stack>
  );
}