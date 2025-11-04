// src/pages/AdminEventosArquivadosPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiRefreshCw } from 'react-icons/fi'; // Ícones de Voltar, Lixeira, Restaurar

import { db } from '../firebase.cjs';
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from "firebase/firestore";

export default function AdminEventosArquivadosPage() {
  const [eventosArquivados, setEventosArquivados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os eventos arquivados
  async function fetchArchivedEvents() {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "eventos"), 
        where("status", "==", "arquivado"), // <-- SÓ PEGA EVENTOS ARQUIVADOS
        orderBy("dataCriacao", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const eventosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEventosArquivados(eventosList);
    } catch (error) {
      console.error("Erro ao buscar eventos arquivados: ", error);
      alert("Não foi possível carregar os eventos arquivados.");
    } finally {
      setIsLoading(false);
    }
  }

  // Roda a função de busca quando a página carrega
  useEffect(() => {
    fetchArchivedEvents();
  }, []);

  // --- FUNÇÃO PARA RESTAURAR UM EVENTO ---
  async function handleRestoreEvent(evento) {
    if (!window.confirm(`Tem certeza que deseja restaurar o evento "${evento.nome}"? Ele voltará para a lista principal.`)) {
      return;
    }

    try {
      const eventDocRef = doc(db, 'eventos', evento.id);
      await updateDoc(eventDocRef, {
        status: 'ativo' // Muda o status de volta para "ativo"
      });
      // Remove o evento da lista atual
      setEventosArquivados((prevEventos) => 
        prevEventos.filter((e) => e.id !== evento.id)
      );
    } catch (err) {
      console.error("Erro ao restaurar evento: ", err);
      alert("Não foi possível restaurar o evento.");
    }
  }

  // --- FUNÇÃO PARA DELETAR (AVISO) ---
  function handleDeletePermanently(evento) {
    alert(
      `DELEÇÃO PERMANENTE (NÃO IMPLEMENTADO)\n\n` +
      `Para deletar "${evento.nome}" permanentemente, precisamos de uma Cloud Function do Firebase para:\n` +
      `1. Deletar todos os arquivos no Storage (pasta ${evento.id}).\n` +
      `2. Deletar todos os documentos na subcoleção "photos".\n` +
      `3. Deletar o documento "eventos/${evento.id}".`
    );
  }

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Carregando eventos arquivados...</div>;
  }

  return (
    <div>
      {/* Botão de Voltar */}
      <Link 
        to="/admin/eventos" 
        className="flex items-center gap-2 text-blue-600 hover:underline mb-4 text-sm"
      >
        <FiArrowLeft />
        Voltar para lista de eventos ativos
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos Arquivados</h1>
      <p className="text-gray-600 mb-6">Eventos nesta lista podem ser restaurados ou deletados permanentemente.</p>

      {/* Lista/Tabela de Eventos Arquivados */}
      <div className="bg-white rounded-lg shadow-lg">
        <table className="w-full table-auto">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Nome do Evento</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Fotos</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {eventosArquivados.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  Nenhum evento arquivado encontrado.
                </td>
              </tr>
            ) : (
              eventosArquivados.map((evento) => (
                <tr key={evento.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-800 font-medium">{evento.nome}</td>
                  <td className="p-4 text-gray-600">{evento.fotos}</td>
                  <td className="p-4 flex items-center gap-3">
                    {/* Botão Restaurar */}
                    <button 
                      onClick={() => handleRestoreEvent(evento)}
                      className="text-green-600 hover:text-green-800" title="Restaurar Evento"
                    >
                      <FiRefreshCw size={18} />
                    </button>
                    {/* Botão Deletar Permanente */}
                    <button 
                      onClick={() => handleDeletePermanently(evento)}
                      className="text-red-500 hover:text-red-700" title="Deletar Permanentemente"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}