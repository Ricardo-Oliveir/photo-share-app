// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importar as páginas
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UploadPage from './pages/UploadPage.jsx';
import AdminEventosPage from './pages/AdminEventosPage.jsx';
import AdminNovoEventoPage from './pages/AdminNovoEventoPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminClientesPage from './pages/AdminClientesPage.jsx';
import AdminEventoGaleriaPage from './pages/AdminEventoGaleriaPage.jsx';
import AdminEventosArquivadosPage from './pages/AdminEventosArquivadosPage.jsx'; // <-- NOVO

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/evento/:idDoEvento" element={<UploadPage />} />

      {/* Rotas de Admin (Protegidas) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} /> 
        <Route path="eventos" element={<AdminEventosPage />} />
        <Route path="eventos/novo" element={<AdminNovoEventoPage />} />
        <Route path="eventos/galeria/:idDoEvento" element={<AdminEventoGaleriaPage />} />
        <Route path="clientes" element={<AdminClientesPage />} />
        <Route path="arquivados" element={<AdminEventosArquivadosPage />} /> {/* <-- ROTA NOVA */}
      </Route>
    </Routes>
  );
}

export default App;