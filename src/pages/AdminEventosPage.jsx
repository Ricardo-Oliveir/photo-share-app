import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FiPlus, FiLoader, FiShare2, FiLayout, FiArchive, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarEventos() {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "eventos"), 
          where("userId", "==", auth.currentUser.uid), 
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        
        const dataHoje = new Date();
        const limite30DiasMS = 30 * 24 * 60 * 60 * 1000;

        const listaAtivos = snap.docs.map(doc => {
          const data = doc.data();
          const dataCriacao = data.createdAt?.toDate() || new Date();
          const diferencaMS = dataHoje - dataCriacao;
          
          // Cálculo dos dias restantes
          const diasPassados = Math.floor(diferencaMS / (1000 * 60 * 60 * 24));
          const diasRestantes = 30 - diasPassados;

          return { 
            id: doc.id, 
            ...data, 
            diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
            expirado: diferencaMS >= limite30DiasMS
          };
        }).filter(ev => ev.status !== 'arquivado' && !ev.expirado);

        setEventos(listaAtivos);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarEventos();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <FiLoader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Eventos Ativos</h1>
        <Link to="/admin/eventos/novo" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all">
          <FiPlus /> Novo Evento
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs font-bold uppercase text-gray-500">
              <th className="p-4">Nome do Evento</th>
              <th className="p-4">Fotos</th>
              <th className="p-4">Validade</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {eventos.map(ev => (
              <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-semibold text-gray-800">{ev.nome}</td>
                <td className="p-4 text-gray-600">{ev.fotos || 0} fotos</td>
                
                {/* COLUNA DE CONTAGEM DE DIAS */}
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${ev.diasRestantes <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <FiClock size={12} />
                    {ev.diasRestantes} {ev.diasRestantes === 1 ? 'dia restante' : 'dias restantes'}
                  </span>
                </td>

                <td className="p-4 text-right space-x-4">
                  <Link to={`/admin/eventos/qrcode/${ev.id}`} className="text-green-600 font-bold hover:underline inline-flex items-center gap-1">
                    <FiShare2 size={16}/> QR
                  </Link>
                  <Link to={`/admin/eventos/galeria/${ev.id}`} className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                    <FiLayout size={16}/> Painel
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {eventos.length === 0 && (
          <div className="p-20 text-center text-gray-400">
            <FiArchive className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-lg font-medium">Nenhum evento ativo recentemente.</p>
            <p className="text-sm">Eventos com mais de 30 dias são movidos para o arquivo.</p>
          </div>
        )}
      </div>
      
      {/* Atalho para os Arquivados */}
      <div className="mt-8 p-6 bg-blue-50 rounded-2xl text-center border border-blue-100">
        <p className="text-blue-800 text-sm font-medium flex items-center justify-center gap-3">
          <FiArchive size={18} /> 
          Histórico completo de eventos antigos? 
          <Link to="/admin/arquivados" className="font-bold underline hover:text-blue-900 transition-colors">
            Aceder aos Arquivados
          </Link>
        </p>
      </div>
    </div>
  );
}