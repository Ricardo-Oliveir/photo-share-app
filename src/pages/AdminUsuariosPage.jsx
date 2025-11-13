// src/pages/AdminUsuariosPage.jsx

import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { db } from '../firebase.cjs';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const q = query(collection(db, 'usuarios'));
        
        const snapshot = await getDocs(q);
        let listaUsuarios = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Ordena manualmente por data de criação (mais recente primeiro)
        listaUsuarios.sort((a, b) => {
          const dateA = a.dataCriacao?.toDate?.() || new Date(0);
          const dateB = b.dataCriacao?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        
        setUsuarios(listaUsuarios);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        alert('Erro ao carregar usuários');
      } finally {
        setIsLoading(false);
      }
    }

    carregarUsuarios();
  }, []);

  const usuariosFiltrados = filtroTipo === 'todos' 
    ? usuarios 
    : usuarios.filter(u => u.tipo === filtroTipo);

  const formatarData = (timestamp) => {
    if (!timestamp) return 'N/A';
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTipoBadgeColor = (tipo) => {
    switch(tipo) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fotografo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cliente':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários Cadastrados</h1>
          <p className="text-gray-500 mt-1">
            Total: {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFiltroTipo('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtroTipo === 'todos'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({usuarios.length})
        </button>
        <button
          onClick={() => setFiltroTipo('admin')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtroTipo === 'admin'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Admins ({usuarios.filter(u => u.tipo === 'admin').length})
        </button>
        <button
          onClick={() => setFiltroTipo('fotografo')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtroTipo === 'fotografo'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Fotógrafos ({usuarios.filter(u => u.tipo === 'fotografo').length})
        </button>
        <button
          onClick={() => setFiltroTipo('cliente')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtroTipo === 'cliente'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Clientes ({usuarios.filter(u => u.tipo === 'cliente').length})
        </button>
      </div>

      {/* Lista de Usuários */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Carregando usuários...</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usuariosFiltrados.map((usuario) => (
            <div
              key={usuario.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FiUser className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {usuario.nome}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${getTipoBadgeColor(
                        usuario.tipo
                      )}`}
                    >
                      {usuario.tipo?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMail size={16} className="text-gray-400" />
                  <span className="text-sm truncate">{usuario.email}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar size={16} className="text-gray-400" />
                  <span className="text-sm">
                    Cadastro: {formatarData(usuario.dataCriacao)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {usuario.ativo ? (
                    <>
                      <FiCheckCircle size={16} className="text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Ativo</span>
                    </>
                  ) : (
                    <>
                      <FiXCircle size={16} className="text-red-500" />
                      <span className="text-sm text-red-600 font-medium">Inativo</span>
                    </>
                  )}
                </div>
              </div>

              {/* ID (útil para debug) */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-mono truncate">
                  ID: {usuario.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-semibold text-sm">Administradores</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {usuarios.filter(u => u.tipo === 'admin').length}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <FiUser className="text-purple-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-semibold text-sm">Fotógrafos</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {usuarios.filter(u => u.tipo === 'fotografo').length}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <FiUser className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-semibold text-sm">Clientes</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {usuarios.filter(u => u.tipo === 'cliente').length}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <FiUser className="text-green-700" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
