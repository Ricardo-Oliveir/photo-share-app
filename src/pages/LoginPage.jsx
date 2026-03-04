import React, { useState } from 'react';
import { FaCameraRetro } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Importe o reset

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Estado para mensagem de sucesso
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("E-mail ou senha inválidos.");
      } else {
        setError("Erro ao fazer login.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // --- FUNÇÃO DE RECUPERAÇÃO DE SENHA ---
  async function handleForgotPassword() {
    if (!email) {
      setError("Digite seu e-mail para recuperar a senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setError(null);
    } catch (err) {
      setError("Erro ao enviar e-mail de recuperação.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="w-full max-w-md mx-auto p-4">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-600 rounded-lg mb-3">
            <FaCameraRetro className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">PhotoShare</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Entre ou crie sua conta</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
          <div className="flex border-b border-gray-100 mb-6">
            <button className="flex-1 py-3 text-center font-black uppercase text-[10px] text-blue-600 border-b-2 border-blue-600">
              Login
            </button>
            <Link to="/register" className="flex-1 py-3 text-center font-black uppercase text-[10px] text-gray-300 hover:text-gray-600">
              Criar Conta
            </Link>
          </div>

          <form onSubmit={handleLogin}>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-xs font-bold uppercase">{error}</div>}
            {message && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl mb-4 text-xs font-bold uppercase">{message}</div>}

            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">E-mail</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm"
                required
              />
            </div>

            <div className="mb-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Senha</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm"
                required
              />
            </div>

            <div className="flex justify-end mb-6">
              <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs py-5 rounded-2xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
            >
              {isLoading ? "Acessando..." : "Entrar na conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}