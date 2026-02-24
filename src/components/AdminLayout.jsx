import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FiLayout, FiLogOut, FiBarChart2, FiCamera } from 'react-icons/fi';

export default function AdminLayout() {
  const [userData, setUserData] = useState(null);
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
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col shadow-2xl">
        <div className="mb-10 text-2xl font-black italic tracking-tighter border-b border-slate-800 pb-4">PhotoShare</div>
        <nav className="flex-1 space-y-2">
          <NavLink to="/admin" end className={({isActive}) => `flex items-center gap-3 p-3 rounded-xl ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <FiLayout /> Dashboard
          </NavLink>
          {!isAdmin && (
            <NavLink to="/admin/eventos" className={({isActive}) => `flex items-center gap-3 p-3 rounded-xl ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <FiCamera /> Meus Eventos
            </NavLink>
          )}
        </nav>
        <button onClick={() => signOut(auth)} className="flex items-center gap-3 p-3 text-red-400 font-bold hover:bg-red-950/20 rounded-xl mt-auto">
          <FiLogOut /> Sair
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white p-6 flex justify-between items-center border-b">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
             {isAdmin ? "Gestão Photo Share" : "ÁREA CLIENTE"}
           </h2>
           {/* RESTAURADO: Olá, nome! */}
           <div className="flex items-center gap-4">
             <span className="font-bold text-slate-700">Olá, {userData?.nome}!</span>
           </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}