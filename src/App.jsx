import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Layout from "./components/Layout";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Document from "./components/document/Document";
import Department from "./components/department/Department";
import User from "./components/user/Users";

export default function App() {
  return (
    <Layout>
      <Container sx={{ mt: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/documents" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/documents/*"
            element={
              <ProtectedRoute>
                <Document />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/*"
            element={
              <ProtectedRoute>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments/*"
            element={
              <ProtectedRoute>
                <Department />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </Layout>
  );
}