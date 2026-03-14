import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FiLayout, FiLogOut, FiCamera, FiMenu, FiX } from 'react-icons/fi';

export default function AdminLayout() {
  const [userData, setUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para o hambúrguer
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      } else { navigate('/login'); }
    });
    return () => unsubscribe();
  }, [navigate]);

  const isAdmin = userData?.role === 'admin';

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      
      {/* 1. SIDEBAR: Agora ela é 'fixed' no mobile para não ocupar espaço horizontal */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white p-6 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-4">
          <div className="text-2xl font-black italic tracking-tighter uppercase">PhotoShare</div>
          {/* Botão de fechar (X) - Só aparece no mobile */}
          <button className="lg:hidden" onClick={() => setIsMenuOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink to="/admin" end onClick={() => setIsMenuOpen(false)} className={({isActive}) => `flex items-center gap-3 p-3 rounded-xl ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <FiLayout /> Dashboard
          </NavLink>
          {!isAdmin && (
            <NavLink to="/admin/eventos" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `flex items-center gap-3 p-3 rounded-xl ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <FiCamera /> Meus Eventos
            </NavLink>
          )}
        </nav>

        <button onClick={() => signOut(auth)} className="flex items-center gap-3 p-3 text-red-400 font-bold hover:bg-red-950/20 rounded-xl mt-auto">
          <FiLogOut /> Sair
        </button>
      </aside>

      {/* 2. OVERLAY: Escurece o fundo no celular quando o menu abre */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* 3. CONTEÚDO PRINCIPAL: Agora ganha 'w-full' real no mobile */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white p-4 md:p-6 flex justify-between items-center border-b">
            <div className="flex items-center gap-4">
              {/* BOTÃO HAMBÚRGUER: Abre o menu */}
              <button className="lg:hidden p-2 text-slate-600 bg-slate-50 rounded-lg" onClick={() => setIsMenuOpen(true)}>
                <FiMenu size={24} />
              </button>
              <h2 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest leading-none">
                {isAdmin ? "Gestão Photo Share" : "ÁREA CLIENTE"}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-700 text-xs md:text-base">Olá, {userData?.nome}!</span>
            </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}