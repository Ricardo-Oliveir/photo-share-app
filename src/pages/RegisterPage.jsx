// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { FaCameraRetro } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.cjs';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    // Validações básicas
    if (!nome.trim()) {
      setErro('Por favor, insira seu nome');
      setCarregando(false);
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      setCarregando(false);
      return;
    }

    try {
      // 1. Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      console.log('Usuário criado no Authentication:', user.uid);

      // 2. Criar documento do usuário no Firestore (sempre como cliente)
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: nome.trim(),
        email: email,
        tipo: 'cliente',
        dataCriacao: serverTimestamp(),
        ativo: true
      });

      console.log('Usuário adicionado ao Firestore com sucesso!');

      // 3. Redirecionar para o painel de cliente
      navigate('/cliente');
    } catch (error) {
      console.error('Erro ao criar conta:', error);

      // Mensagens de erro amigáveis
      if (error.code === 'auth/email-already-in-use') {
        setErro('Este email já está em uso');
      } else if (error.code === 'auth/invalid-email') {
        setErro('Email inválido');
      } else if (error.code === 'auth/weak-password') {
        setErro('Senha muito fraca. Use pelo menos 6 caracteres');
      } else if (error.code === 'auth/network-request-failed') {
        setErro('Erro de conexão. Verifique sua internet');
      } else {
        setErro('Erro ao criar conta. Tente novamente');
      }
    } finally {
      setCarregando(false);
    }
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
          <p className="text-gray-500">Crie sua conta de cliente</p>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Criar Conta</h2>
            <p className="text-gray-500 mb-6">Preencha seus dados para começar</p>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{erro}</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Seu Nome <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="name" 
                placeholder="João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={carregando}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                id="email" 
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={carregando}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha <span className="text-red-500">*</span>
              </label>
              <input 
                type="password" 
                id="senha" 
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                disabled={carregando}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {carregando ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}