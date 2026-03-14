import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FiLayout, FiLogOut, FiBarChart2, FiCamera, FiMenu, FiX } from 'react-icons/fi';

export default function AdminLayout() {
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-100 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-white p-6 flex flex-col shadow-2xl transform transition-transform duration-200 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-4">
          <div className="text-2xl font-black italic tracking-tighter">PhotoShare</div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>
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
        <button onClick={() => {
          signOut(auth);
          setIsSidebarOpen(false);
        }} className="flex items-center gap-3 p-3 text-red-400 font-bold hover:bg-red-950/20 rounded-xl mt-auto">
          <FiLogOut /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <header className="bg-white p-4 sm:p-6 flex justify-between items-center border-b shrink-0 gap-4">
           <div className="flex items-center gap-3 min-w-0">
             <button
               onClick={toggleSidebar}
               className="md:hidden text-slate-500 hover:text-slate-700 p-2 -ml-2 shrink-0"
             >
               <FiMenu size={24} />
             </button>
             <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest truncate">
               {isAdmin ? "Gestão Photo Share" : "ÁREA CLIENTE"}
             </h2>
           </div>
           {/* RESTAURADO: Olá, nome! */}
           <div className="flex items-center shrink-0">
             <span className="font-bold text-slate-700 text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
               Olá, {userData?.nome}!
             </span>
           </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}