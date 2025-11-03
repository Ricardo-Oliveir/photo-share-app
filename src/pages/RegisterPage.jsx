// src/pages/RegisterPage.jsx

import React from 'react';
import { FaCameraRetro } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  function handleRegister(event) {
    event.preventDefault();
    // (Lógica de criar usuário no Firebase)
    console.log("Registro simulado!");
    navigate('/admin'); // Redireciona para o painel após criar conta
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
          <p className="text-gray-500">Crie sua conta de administrador</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          
          {/* Abas */}
          <div className="flex border-b border-gray-200 mb-6">
            <Link 
              to="/login"
              className="flex-1 py-3 text-center font-semibold text-gray-400 hover:text-gray-600"
            >
              Login
            </Link>
            <button className="flex-1 py-3 text-center font-semibold text-blue-600 border-b-2 border-blue-600">
              Criar Conta
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Seu Nome
              </label>
              <input type="text" id="name" placeholder="Ricardo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input type="email" id="email" placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input type="password" id="senha" placeholder="********"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg"
            >
              Criar Conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}