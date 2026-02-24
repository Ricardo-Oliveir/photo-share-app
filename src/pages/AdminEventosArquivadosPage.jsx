import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiLoader, FiArchive } from 'react-icons/fi';
import { db, auth } from '../firebase.js';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function AdminEventosArquivadosPage() {
  const [eventosArquivados, setEventosArquivados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchArchivedEvents() {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, "eventos"), where("userId", "==", auth.currentUser.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      
      const dataHoje = new Date();
      const limite30Dias = 30 * 24 * 60 * 60 * 1000;

      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(ev => {
          const dataCriacao = ev.createdAt?.toDate() || new Date();
          const diferenca = dataHoje - dataCriacao;
          // Mostra se foi arquivado MANUALMENTE ou se expirou (30+ dias)
          return ev.status === 'arquivado' || diferenca >= limite30Dias;
        });

      setEventosArquivados(lista);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }

  useEffect(() => { fetchArchivedEvents(); }, []);

  async function handleRestoreEvent(evento) {
    if (!window.confirm(`Restaurar "${evento.nome}"? Ele ganhará novos 30 dias.`)) return;
    try {
      await updateDoc(doc(db, 'eventos', evento.id), { status: 'ativo', createdAt: serverTimestamp() });
      fetchArchivedEvents();
    } catch (err) { alert("Erro ao restaurar."); }
  }

  if (isLoading) return <div className="p-20 text-center"><FiLoader className="animate-spin inline mr-2"/>Carregando...</div>;

  return (
    <div className="p-4 space-y-6">
      <Link to="/admin/eventos" className="flex items-center gap-2 text-blue-600 font-bold"><FiArrowLeft /> Voltar</Link>
      <h1 className="text-3xl font-bold">Arquivo de Eventos</h1>
      <p className="text-gray-500">Eventos que passaram de 30 dias ou foram arquivados.</p>
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4 font-bold text-xs uppercase text-gray-500">Nome</th><th className="p-4 font-bold text-xs uppercase text-gray-500">Fotos</th><th className="p-4 font-bold text-xs uppercase text-gray-500 text-right">Restaurar</th></tr>
          </thead>
          <tbody className="divide-y">
            {eventosArquivados.map((evento) => (
              <tr key={evento.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{evento.nome}</td>
                <td className="p-4">{evento.fotos || 0}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleRestoreEvent(evento)} className="text-green-600 hover:scale-110 transition-transform"><FiRefreshCw size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {eventosArquivados.length === 0 && <div className="p-10 text-center text-gray-300">Nenhum evento arquivado.</div>}
      </div>
    </div>
  );
}