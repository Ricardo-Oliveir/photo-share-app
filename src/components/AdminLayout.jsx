// src/components/AdminLayout.jsx

import React from 'react';
// Importamos o NavLink, Outlet, e o NOVO useNavigate
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaCameraRetro } from 'react-icons/fa';
import { FiHome, FiCamera, FiUsers, FiLogOut } from 'react-icons/fi';

export default function AdminLayout() {
  
  // --- PASSO 1: Configurar o Navigate ---
  const navigate = useNavigate();

  // --- PASSO 2: Criar a função de Logout ---
  function handleLogout() {
    // (Aqui viria a lógica de logout do Firebase)
    console.log("Logout simulado! Redirecionando para /login");
    navigate('/login'); // Redireciona para a página de login
  }

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* 1. Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-blue-700 text-blue-100 flex flex-col p-4">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 py-4 border-b border-blue-600">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FaCameraRetro className="text-white" />
          </div>
          <span className="font-bold text-xl text-white">PhotoShare</span>
        </div>

        {/* Links de Navegação (com NavLink para 'acender' o link ativo) */}
        <nav className="mt-6 flex-1 space-y-2">
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-3 rounded-lg font-medium ${
                isActive ? 'bg-blue-800 text-white' : 'hover:bg-blue-600'
              }`
            }
          >
            <FiHome />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/admin/eventos" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-3 rounded-lg font-medium ${
                isActive ? 'bg-blue-800 text-white' : 'hover:bg-blue-600'
              }`
            }
          >
            <FiCamera />
            <span>Eventos</span>
          </NavLink>
          <NavLink 
            to="/admin/clientes" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-3 rounded-lg font-medium ${
                isActive ? 'bg-blue-800 text-white' : 'hover:bg-blue-600'
              }`
            }
          >
            <FiUsers />
            <span>Clientes</span>
          </NavLink>
        </nav>
      </aside>

      {/* 2. Conteúdo Principal (Direita) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* --- PASSO 3: Conectar a função ao botão --- */}
        <header className="bg-white shadow-md p-4 flex justify-end items-center">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Olá, Ricardo!</span>
            <button 
              onClick={handleLogout} // <-- BOTÃO "SAIR" AGORA FUNCIONA
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
            >
              <FiLogOut />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* 3. Área da Página (onde o Dashboard vai aparecer) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}