// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { FaCameraRetro } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

// --- IMPORTS DO FIREBASE AUTH ---
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const navigate = useNavigate();

  // --- ESTADOS PARA CONTROLAR O FORMULÁRIO ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- FUNÇÃO DE LOGIN ATUALIZADA ---
  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Tenta fazer o login no Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);

      console.log("Login realizado com sucesso!");
      navigate('/admin'); // Envia o utilizador para o painel

    } catch (err) {
      console.error("Erro ao fazer login: ", err.message);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("E-mail ou senha inválidos. Tente novamente.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="w-full max-w-md mx-auto p-4">

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-600 rounded-lg mb-3">
            <FaCameraRetro className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PhotoShare</h1>
          <p className="text-gray-500">Entre ou crie sua conta</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">

          <div className="flex border-b border-gray-200 mb-6">
            <button className="flex-1 py-3 text-center font-semibold text-blue-600 border-b-2 border-blue-600">
              Login
            </button>
            <Link to="/register" className="flex-1 py-3 text-center font-semibold text-gray-400 hover:text-gray-600">
              Criar Conta
            </Link>
          </div>

          <form onSubmit={handleLogin}>
            {/* --- MOSTRAR MENSAGEM DE ERRO --- */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-500 mb-6">Entre com suas credenciais</p>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email" id="email" placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password" id="senha" placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}