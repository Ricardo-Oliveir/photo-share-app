// src/pages/AdminNovoEventoPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// --- IMPORTS ATUALIZADOS DO FIREBASE ---
import { db, storage, auth } from '../firebase.cjs'; // Importamos o Storage e Auth
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Funções do Storage
import { FiUpload } from 'react-icons/fi';

// Função slugify (sem alteração)
function slugify(text) {
  return text.toString().toLowerCase().normalize('NFD').trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

export default function AdminNovoEventoPage() {
  const [nomeEvento, setNomeEvento] = useState('');
  // --- NOVO ESTADO PARA O ARQUIVO DA MOLDURA ---
  const [frameFile, setFrameFile] = useState(null); // 'frame' = moldura
  // --- NOVO ESTADO PARA USUÁRIO SELECIONADO ---
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- CARREGAR LISTA DE USUÁRIOS ---
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const usuariosRef = collection(db, "usuarios");
        const snapshot = await getDocs(usuariosRef);
        const listaUsuarios = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsuarios(listaUsuarios);
        
        // Se o usuário atual estiver logado, pré-seleciona ele
        if (auth.currentUser) {
          const usuarioAtual = listaUsuarios.find(u => u.email === auth.currentUser.email);
          if (usuarioAtual) {
            setUsuarioId(usuarioAtual.id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setLoadingUsuarios(false);
      }
    }
    carregarUsuarios();
  }, []);

  // Função para guardar o arquivo da moldura quando selecionado
  function handleFrameFileChange(event) {
    if (event.target.files[0]) {
      setFrameFile(event.target.files[0]);
    }
  }

  // --- FUNÇÃO DE SUBMIT ATUALIZADA PARA UPLOAD DA MOLDURA ---
  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return; 
    setIsLoading(true);

    const eventoId = slugify(nomeEvento);
    if (!eventoId) {
      alert("Por favor, digite um nome de evento válido.");
      setIsLoading(false);
      return;
    }

    if (!usuarioId) {
      alert("Por favor, selecione um usuário responsável pelo evento.");
      setIsLoading(false);
      return;
    }

    let frameURL = null; // Começa como nulo

    try {
      // --- PASSO 1: FAZER UPLOAD DA MOLDURA (SE ELA EXISTIR) ---
      if (frameFile) {
        console.log("Fazendo upload da moldura...");
        // Cria uma referência (ex: molduras/festa-vicente.png)
        const frameRef = ref(storage, `molduras/${eventoId}_${frameFile.name}`);
        
        // Faz o upload
        const uploadResult = await uploadBytes(frameRef, frameFile);
        
        // Pega a URL de download
        frameURL = await getDownloadURL(uploadResult.ref);
        console.log("Moldura enviada:", frameURL);
      }

      // --- PASSO 2: SALVAR O EVENTO NO FIRESTORE ---
      const novoEventoRef = doc(db, "eventos", eventoId);
      
      // Busca os dados do usuário selecionado
      const usuarioSelecionado = usuarios.find(u => u.id === usuarioId);
      
      await setDoc(novoEventoRef, {
        id: eventoId,
        nome: nomeEvento,
        dataCriacao: serverTimestamp(),
        fotos: 0,
        status: "ativo",
        frameURL: frameURL, // <-- SALVA A URL DA MOLDURA (pode ser null)
        usuarioId: usuarioId, // <-- ID do usuário responsável
        usuarioNome: usuarioSelecionado?.nome || '',
        usuarioEmail: usuarioSelecionado?.email || ''
      });

      console.log(`Novo evento criado com ID: ${eventoId}`);
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
        {/* Campo Nome do Evento (sem alteração) */}
        <div className="mb-6">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Evento
          </label>
          <input
            type="text" id="nome" value={nomeEvento}
            onChange={(e) => setNomeEvento(e.target.value)}
            placeholder="Ex: Casamento Ana & Bruno"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required disabled={isLoading} 
          />
        </div>

        {/* --- NOVO CAMPO: SELEÇÃO DE USUÁRIO --- */}
        <div className="mb-6">
          <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
            Responsável pelo Evento <span className="text-red-500">*</span>
          </label>
          {loadingUsuarios ? (
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              Carregando usuários...
            </div>
          ) : (
            <select
              id="usuario"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            >
              <option value="">Selecione um usuário</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome} ({usuario.email}) - {usuario.tipo || 'N/A'}
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Selecione o fotógrafo ou responsável que irá gerenciar este evento
          </p>
        </div>
        
        {/* --- NOVO CAMPO: UPLOAD DA MOLDURA --- */}
        <div className="mb-6">
          <label htmlFor="frame-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Moldura Personalizada (Opcional)
          </label>
          <label 
            htmlFor="frame-upload"
            className="mt-1 flex justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500"
          >
            <div className="space-y-1 text-center">
              <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <span className="text-blue-600 font-medium cursor-pointer">
                  {frameFile ? frameFile.name : "Clique para enviar um arquivo"}
                </span>
                <input id="frame-upload" name="frame-upload" type="file" className="sr-only" 
                  accept="image/png" // Aceita apenas PNG
                  onChange={handleFrameFileChange}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Envie um .PNG transparente (ex: 1080x1080px)
              </p>
            </div>
          </label>
        </div>
        
        {/* Botões (sem alteração) */}
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