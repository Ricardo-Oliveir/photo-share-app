// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importar as páginas
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import UploadPage from './pages/UploadPage';
import AdminEventosPage from './pages/AdminEventosPage';
import AdminNovoEventoPage from './pages/AdminNovoEventoPage';

// --- ESTAS SÃO AS NOVAS PÁGINAS QUE ADICIONAMOS ---
import RegisterPage from './pages/RegisterPage';
import AdminClientesPage from './pages/AdminClientesPage';

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> {/* <-- ROTA NOVA */}
      <Route path="/evento/:idDoEvento" element={<UploadPage />} />

      {/* Rotas de Admin (Protegidas) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} /> 
        <Route path="eventos" element={<AdminEventosPage />} />
        <Route path="eventos/novo" element={<AdminNovoEventoPage />} />
        <Route path="clientes" element={<AdminClientesPage />} /> {/* <-- ROTA NOVA */}
      </Route>
    </Routes>
  );
}

export default App;