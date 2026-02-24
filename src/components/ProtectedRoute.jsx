// src/components/ProtectedRoute.jsx

import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth'; // O "ouvinte" do Firebase
import { FiLoader } from 'react-icons/fi';

export default function ProtectedRoute() {
  const [user, setUser] = useState(null); // Guarda o utilizador
  const [isLoading, setIsLoading] = useState(true); // Começa a carregar

  useEffect(() => {
    // onAuthStateChanged fica "ouvindo" o status do login
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Utilizador está logado
        setUser(user);
      } else {
        // Utilizador está deslogado
        setUser(null);
      }
      // Termina de carregar (já sabemos se há um utilizador ou não)
      setIsLoading(false);
    });

    // Limpa o "ouvinte" quando o componente desmonta
    return () => unsubscribe();
  }, []);

  // 1. Se estiver a carregar, mostra um spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <FiLoader className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 2. Se terminou de carregar E o utilizador NÃO está logado
  if (!user) {
    // Redireciona (expulsa) o utilizador para a página de login
    return <Navigate to="/login" replace />;
  }

  // 3. Se terminou de carregar E o utilizador ESTÁ logado
  // Mostra as rotas filhas (no nosso caso, o <AdminLayout />)
  return <Outlet />;
}