// src/pages/AdminEventosPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiCamera, FiLink, FiArchive } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

import { db } from '../firebase.cjs';
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from "firebase/firestore";
import { QRCodeSVG } from 'qrcode.react';

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState(null);

  useEffect(() => {
    async function fetchEventos() {
      try {
        const q = query(
          collection(db, "eventos"), 
          where("status", "==", "ativo"),
          orderBy("dataCriacao", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const eventosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEventos(eventosList);
      } catch (error) {
        console.error("Erro ao buscar eventos: ", error);
        alert("Não foi possível carregar os eventos do banco de dados.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEventos();
  }, []);

  async function handleArchiveEvent(evento) {
    if (!window.confirm(`Tem certeza que deseja arquivar o evento "${evento.nome}"? Ele sairá desta lista.`)) {
      return;
    }
    try {
      const eventDocRef = doc(db, 'eventos', evento.id);
      await updateDoc(eventDocRef, {
        status: 'arquivado'
      });
      setEventos((prevEventos) => 
        prevEventos.filter((e) => e.id !== evento.id)
      );
    } catch (err) {
      console.error("Erro ao arquivar evento: ", err);
      alert("Não foi possível arquivar o evento.");
    }
  }

  function handleCopyLink(evento) {
    const url = `${window.location.origin}/evento/${evento.id}`;
    navigator.clipboard.writeText(url).then(() => alert(`Link copiado!\n${url}`));
  }
  function handleShowQrCode(evento) { setModalEvent(evento); }
  function handleCloseModal() { setModalEvent(null); }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Eventos</h1>
        <Link
          to="/admin/eventos/novo" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          <FiPlus />
          <span>Criar Novo Evento</span>
        </Link>
      </div>

      {/* --- LINK PARA ARQUIVADOS ADICIONADO --- */}
      <div className="mb-4">
        <Link 
          to="/admin/arquivados" 
          className="text-sm text-blue-600 hover:underline"
        >
          Ver eventos arquivados
        </Link>
      </div>

      {/* Tabela de Eventos Ativos */}
      <div className="bg-white rounded-lg shadow-lg">
        <table className="w-full table-auto">
          {/* ... (cabeçalho da tabela) ... */}
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Nome do Evento</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Fotos</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="3" className="p-4 text-center text-gray-500">Carregando eventos...</td></tr>
            ) : eventos.length === 0 ? (
              <tr><td colSpan="3" className="p-4 text-center text-gray-500">Nenhum evento ativo encontrado.</td></tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-800 font-medium">{evento.nome}</td>
                  <td className="p-4 text-gray-600">{evento.fotos}</td>
                  <td className="p-4 flex items-center gap-3">
                    <Link 
                      to={`/admin/eventos/galeria/${evento.id}`} 
                      className="text-blue-600 hover:text-blue-800" title="Ver Galeria"
                    >
                      <FiCamera size={18} />
                    </Link>
                    <button 
                      onClick={() => handleCopyLink(evento)} 
                      className="text-gray-500 hover:text-blue-800" title="Copiar Link do Convidado"
                    >
                      <FiLink size={18} />
                    </button>
                    <button 
                      onClick={() => handleShowQrCode(evento)} 
                      className="text-gray-500 hover:text-blue-800" title="Ver QR Code"
                    >
                      <BsQrCode size={18} />
                    </button>
                    <button 
                      onClick={() => handleArchiveEvent(evento)}
                      className="text-red-500 hover:text-red-700" title="Arquivar Evento"
                    >
                      <FiArchive size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal (sem alterações) */}
      {modalEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()} 
          >
            {/* ... (conteúdo do modal) ... */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">QR Code do Evento</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Convidados podem escanear este código para enviar fotos para: <strong className="text-blue-600">{modalEvent.nome}</strong>
            </p>
            <div className="flex justify-center p-4 bg-gray-100 rounded-lg mb-4">
              <QRCodeSVG value={`${window.location.origin}/evento/${modalEvent.id}`} size={256} />
            </div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Link direto</label>
            <input
              type="text" readOnly
              value={`${window.location.origin}/evento/${modalEvent.id}`}
              className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm"
              onFocus={(e) => e.target.select()}
            />
          </div>
        </div>
      )}
    </div>
  );
}