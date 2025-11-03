// src/pages/LoginPage.jsx

import React from 'react';
import { FaCameraRetro } from 'react-icons/fa';
// Importamos o Link (novo) e o useNavigate (que já tínhamos)
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  // Esta função é chamada quando o formulário é enviado
  function handleLogin(event) {
    event.preventDefault(); // Impede o recarregamento da página
    
    // (Aqui viria a lógica real de checar o email/senha no Firebase)
    
    // Simulando um login bem-sucedido e redirecionando:
    console.log("Login simulado! Redirecionando...");
    navigate('/admin'); // Envia o usuário para o painel
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="w-full max-w-md mx-auto p-4">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-600 rounded-lg mb-3">
            <FaCameraRetro className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PhotoShare</h1>
          <p className="text-gray-500">Entre ou crie sua conta</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          
          {/* --- ESTA É A SEÇÃO ATUALIZADA --- */}
          {/* Abas de Login / Criar Conta */}
          <div className="flex border-b border-gray-200 mb-6">
            <button className="flex-1 py-3 text-center font-semibold text-blue-600 border-b-2 border-blue-600">
              Login
            </button>
            {/* O botão "Criar Conta" agora é um Link que leva para a rota /register */}
            <Link 
              to="/register" 
              className="flex-1 py-3 text-center font-semibold text-gray-400 hover:text-gray-600"
            >
              Criar Conta
            </Link>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-500 mb-6">Entre com suas credenciais</p>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                id="senha"
                placeholder="********"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300"
            >
              Entrar
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Ao criar uma conta, você concorda com nossos
          <br />
          <a href="#" className="underline hover:text-blue-600">Termos de Uso</a> e 
          <a href="#" className="underline hover:text-blue-600"> Política de Privacidade</a>
        </p>

      </div>
    </div>
  );
}