import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importar as páginas originais
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
import AdminEventosArquivadosPage from './pages/AdminEventosArquivadosPage.jsx';
import AdminQRCodePage from './pages/AdminQRCodePage.jsx';

// --- NOVA PÁGINA DA GALERIA PÚBLICA ---
import PublicGalleryPage from './pages/PublicGalleryPage.jsx';

// --- IMPORTAR O "SEGURANÇA" ---
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      {/* --- Rotas Públicas (Acesso livre para convidados) --- */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rota onde o convidado cai para fazer o upload das fotos */}
      <Route path="/evento/:idDoEvento" element={<UploadPage />} />

      {/* NOVA ROTA: Onde o convidado vê e baixa as fotos da galeria pública */}
      <Route path="/galeria/:idDoEvento" element={<PublicGalleryPage />} />

      {/* --- ROTAS DE ADMIN PROTEGIDAS (Exigem Login) --- */}
      <Route element={<ProtectedRoute />}>
        {/* O AdminLayout mantém a Sidebar e o cabeçalho administrativo */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> 
          <Route path="eventos" element={<AdminEventosPage />} />
          <Route path="eventos/novo" element={<AdminNovoEventoPage />} />
          <Route path="eventos/qrcode/:idDoEvento" element={<AdminQRCodePage />} />
          <Route path="eventos/galeria/:idDoEvento" element={<AdminEventoGaleriaPage />} />
          <Route path="clientes" element={<AdminClientesPage />} />
          <Route path="arquivados" element={<AdminEventosArquivadosPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;