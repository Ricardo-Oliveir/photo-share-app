import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { FiUsers, FiMail, FiLoader } from 'react-icons/fi';

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientes() {
      try {
        const snap = await getDocs(collection(db, "usuarios"));
        setClientes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchClientes();
  }, []);

  if (loading) return <div className="p-20 text-center"><FiLoader className="animate-spin" size={32} /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-3"><FiUsers /> Lista de Clientes</h1>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs font-bold uppercase text-gray-500">
              <th className="p-4">Nome</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Cargo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientes.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold">{c.nome}</td>
                <td className="p-4 flex items-center gap-2"><FiMail size={14} /> {c.email}</td>
                <td className="p-4 text-xs">
                  <span className={`px-2 py-1 rounded-full ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}