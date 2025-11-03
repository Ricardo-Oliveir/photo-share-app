// src/pages/AdminEventosPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Importamos o FiX para o botão de fechar o modal
import { FiPlus, FiCamera, FiLink, FiX } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

// --- NOSSOS NOVOS IMPORTS ---
import { db } from '../firebase.cjs';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { QRCodeSVG } from 'qrcode.react'; // A biblioteca de QR Code que instalamos

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NOVO ESTADO PARA CONTROLAR O MODAL ---
  // Se for 'null', o modal está fechado. 
  // Se for um objeto 'evento', o modal está aberto com os dados desse evento.
  const [modalEvent, setModalEvent] = useState(null);

  useEffect(() => {
    async function fetchEventos() {
      try {
        const q = query(collection(db, "eventos"), orderBy("dataCriacao", "desc"));
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

  // --- NOVAS FUNÇÕES PARA OS BOTÕES DE AÇÃO ---

  /**
   * Pega o link do evento e copia para a área de transferência.
   */
  function handleCopyLink(evento) {
    // Monta a URL completa do evento (ex: http://localhost:5173/evento/festa-vicente)
    const url = `${window.location.origin}/evento/${evento.id}`;
    
    // Usa a API do navegador para copiar
    navigator.clipboard.writeText(url)
      .then(() => {
        alert(`Link copiado!\n${url}`);
      })
      .catch(err => {
        console.error("Falha ao copiar link: ", err);
        alert("Não foi possível copiar o link.");
      });
  }

  /**
   * Abre o modal de QR Code para o evento selecionado.
   */
  function handleShowQrCode(evento) {
    setModalEvent(evento);
  }

  /**
   * Fecha o modal.
   */
  function handleCloseModal() {
    setModalEvent(null);
  }

  // --- FIM DAS NOVAS FUNÇÕES ---

  return (
    <div>
      {/* Cabeçalho com o botão "Criar Novo" */}
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

      {/* Lista/Tabela de Eventos */}
      <div className="bg-white rounded-lg shadow-lg">
        <table className="w-full table-auto">
          {/* ... (o <thead> (cabeçalho da tabela) não muda) ... */}
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Nome do Evento</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Fotos</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  Carregando eventos...
                </td>
              </tr>
            ) : eventos.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  Nenhum evento encontrado. Crie o seu primeiro!
                </td>
              </tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-800 font-medium">{evento.nome}</td>
                  <td className="p-4 text-gray-600">{evento.fotos}</td>
                  
                  {/* --- BOTÕES COM 'onClick' ATUALIZADOS --- */}
                  <td className="p-4 flex items-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800" title="Ver Galeria">
                      <FiCamera size={18} />
                    </button>
                    <button 
                      onClick={() => handleCopyLink(evento)} // <-- AÇÃO ADICIONADA
                      className="text-gray-500 hover:text-blue-800" 
                      title="Copiar Link do Convidado"
                    >
                      <FiLink size={18} />
                    </button>
                    <button 
                      onClick={() => handleShowQrCode(evento)} // <-- AÇÃO ADICIONADA
                      className="text-gray-500 hover:text-blue-800" 
                      title="Ver QR Code"
                    >
                      <BsQrCode size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- O MODAL DE QR CODE --- */}
      {/* Ele só aparece se 'modalEvent' não for 'null' */}
      {modalEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal} // Fecha o modal ao clicar no fundo
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()} // Impede de fechar ao clicar *dentro* do modal
          >
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">QR Code do Evento</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Convidados podem escanear este código para enviar fotos para: <strong className="text-blue-600">{modalEvent.nome}</strong>
            </p>

            {/* O QR Code Gerado */}
            <div className="flex justify-center p-4 bg-gray-100 rounded-lg mb-4">
              <QRCodeSVG 
                value={`${window.location.origin}/evento/${modalEvent.id}`} 
                size={256} // Tamanho do QR Code
              />
            </div>

            {/* O Link por extenso (para copiar) */}
            <label className="block text-xs font-medium text-gray-500 mb-1">Link direto</label>
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/evento/${modalEvent.id}`}
              className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm"
              onFocus={(e) => e.target.select()} // Seleciona o link ao clicar
            />
          </div>
        </div>
      )}
    </div>
  );
}