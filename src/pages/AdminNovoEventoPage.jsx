// src/pages/AdminNovoEventoPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// --- NOSSOS NOVOS IMPORTS DO FIREBASE ---
import { db } from '../firebase.cjs'; // <-- ESTA É A CORREÇÃO
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Funções para salvar

// --- FUNÇÃO HELPER PARA CRIAR O ID (SLUG) ---
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por -
    .replace(/[^\w-]+/g, '') // Remove caracteres não-alfanuméricos
    .replace(/--+/g, '-'); // Remove hífens duplicados
}

export default function AdminNovoEventoPage() {
  const [nomeEvento, setNomeEvento] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- A FUNÇÃO DE SALVAR AGORA ESTÁ ATUALIZADA ---
  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return; 

    setIsLoading(true);

    // 1. Criar o ID (slug) a partir do nome
    const eventoId = slugify(nomeEvento);
    if (!eventoId) {
      alert("Por favor, digite um nome de evento válido.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Criar uma referência para o novo documento
      const novoEventoRef = doc(db, "eventos", eventoId);

      // 3. Salvar os dados no Firestore
      await setDoc(novoEventoRef, {
        id: eventoId,
        nome: nomeEvento,
        dataCriacao: serverTimestamp(), // Pega a data/hora do servidor
        fotos: 0, // Começa com zero fotos
      });

      console.log(`Novo evento criado com ID: ${eventoId}`);
      
      // 4. Volta para a lista de eventos
      navigate('/admin/eventos');

    } catch (error) {
      console.error("Erro ao salvar o evento: ", error);
      alert("Houve um erro ao salvar o evento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Criar Novo Evento</h1>

      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-lg shadow-lg max-w-lg"
      >
        <div className="mb-6">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Evento
          </label>
          <input
            type="text"
            id="nome"
            value={nomeEvento}
            onChange={(e) => setNomeEvento(e.target.value)}
            placeholder="Ex: Casamento Ana & Bruno"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading} 
          />
          <p className="text-xs text-gray-500 mt-1">Este nome será público para os seus convidados.</p>
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Salvar Evento"}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/eventos')}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}