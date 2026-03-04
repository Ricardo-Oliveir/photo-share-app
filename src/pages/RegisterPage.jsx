import React, { useState } from 'react';
import { auth, db } from '../firebase.js';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import { FiLoader, FiArrowRight } from 'react-icons/fi'; // Importe os ícones que faltavam

export default function RegisterPage() {
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) return alert("As senhas não coincidem!");
    
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
      
      // Salva no Firestore conforme o padrão que você está usando no Admin
      await setDoc(doc(db, "usuarios", res.user.uid), {
        nome: formData.nome.toUpperCase(), // Padrão UPPERCASE
        email: formData.email,
        role: 'cliente',
        createdAt: serverTimestamp()
      });

      navigate('/admin');
    } catch (err) {
      alert("Erro ao cadastrar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fundo cinza para dar contraste com o "card" branco
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      
      {/* Contêiner menor e flutuante (card) */}
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header azul menor */}
        <div className="bg-blue-600 p-8 text-center relative">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
            PhotoShare
          </h1>
          <p className="text-blue-100 font-bold uppercase text-[9px] tracking-[0.3em] mt-3">
            Junte-se à nossa comunidade
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-5">
          {/* Inputs limpos, menores e sem ícones internos */}
          <div>
            <input 
              type="text" placeholder="NOME COMPLETO" required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs uppercase"
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div>
            <input 
              type="email" placeholder="E-MAIL" required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs uppercase"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <input 
              type="password" placeholder="SENHA" required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs"
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
            />
          </div>

          <div className="pb-2">
            <input 
              type="password" placeholder="CONFIRMAR SENHA" required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs"
              onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            // Botão com sombra menor etracking igual ao Dashboard
            className="w-full py-5 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            {loading ? <FiLoader className="animate-spin" /> : <>CRIAR CONTA AGORA <FiArrowRight /></>}
          </button>

          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-3">
            Já tem conta? <Link to="/login" className="text-blue-600 underline">Fazer Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}