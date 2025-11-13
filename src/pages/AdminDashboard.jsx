// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase.cjs';
import { Link } from 'react-router-dom';
// Adicionamos 'limit' para buscar apenas os 5 mais recentes
import { collection, query, where, getDocs, getCountFromServer, orderBy, limit } from "firebase/firestore";
import { FiPlus, FiCamera, FiCalendar, FiImage } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext.jsx';

// --- FUNÇÃO HELPER PARA FORMATAR A DATA ---
// Converte o Timestamp do Firebase em uma string legível (ex: 04/11/2025, 20:30)
function formatTimestamp(timestamp) {
  if (!timestamp) return "Data desconhecida";
  const jsDate = timestamp.toDate();
  return jsDate.toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Componente do Card (sem alterações)
function KpiCard({ title, value, isLoading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {isLoading ? (
        <p className="text-3xl font-bold text-gray-400 mt-2 animate-pulse">...</p>
      ) : (
        <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
      )}
    </div>
  );
}

// Componente de Dashboard para Clientes
function DashboardCliente({ eventos, isLoading }) {
  const [fotosEventos, setFotosEventos] = useState({});
  const [loadingFotos, setLoadingFotos] = useState(true);

  useEffect(() => {
    async function carregarFotos() {
      if (!eventos || eventos.length === 0) {
        setLoadingFotos(false);
        return;
      }

      try {
        const fotosMap = {};
        
        for (const evento of eventos) {
          const photosRef = collection(db, 'eventos', evento.id, 'photos');
          const photosSnapshot = await getDocs(photosRef);
          
          fotosMap[evento.id] = photosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }
        
        setFotosEventos(fotosMap);
      } catch (error) {
        console.error('Erro ao carregar fotos:', error);
      } finally {
        setLoadingFotos(false);
      }
    }

    carregarFotos();
  }, [eventos]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Carregando seus eventos...</p>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
          <FiCamera size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nenhum evento encontrado
        </h2>
        <p className="text-gray-500">
          Você ainda não possui eventos cadastrados.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Meus Eventos</h1>

      {/* Grid de Eventos */}
      <div className="space-y-8">
        {eventos.map((evento) => {
          const fotos = fotosEventos[evento.id] || [];
          const totalFotos = fotos.length;

          return (
            <div key={evento.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header do Evento */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{evento.nome}</h2>
                    <div className="flex items-center gap-4 text-blue-100">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} />
                        <span className="text-sm">
                          {formatTimestamp(evento.dataCriacao)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiImage size={16} />
                        <span className="text-sm">{totalFotos} foto{totalFotos !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/admin/eventos/galeria/${evento.id}`}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Ver Todas
                  </Link>
                </div>
              </div>

              {/* Galeria de Fotos */}
              <div className="p-6">
                {loadingFotos ? (
                  <div className="text-center py-8 text-gray-500">
                    Carregando fotos...
                  </div>
                ) : totalFotos === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FiImage size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhuma foto neste evento ainda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {fotos.slice(0, 12).map((foto) => (
                      <div
                        key={foto.id}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <img
                          src={foto.photoURL}
                          alt={`Foto ${foto.id}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {totalFotos > 12 && (
                  <div className="mt-4 text-center">
                    <Link
                      to={`/admin/eventos/galeria/${evento.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Ver mais {totalFotos - 12} fotos
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente Principal do Dashboard
export default function AdminDashboard() {
  const { userDetails, isCliente } = useAuth();
  
  const [stats, setStats] = useState({
    eventosAtivos: 0,
    totalFotos: 0,
    mediaFotos: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // --- NOVOS ESTADOS PARA A LISTA DE ATIVIDADE ---
  const [recentEvents, setRecentEvents] = useState([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  // Log de debug inicial
  useEffect(() => {
    console.log('🚀 AdminDashboard montado');
    console.log('👤 userDetails:', userDetails);
    console.log('🎭 isCliente:', isCliente);
  }, [userDetails, isCliente]);

  // useEffect para buscar as ESTATÍSTICAS (KPIs)
  useEffect(() => {
    async function fetchStats() {
      console.log('📈 [STATS] Iniciando busca de estatísticas...');
      if (!userDetails) {
        console.log('⚠️ [STATS] userDetails não disponível ainda');
        return;
      }
      
      try {
        let eventosQuery;
        
        // Se for cliente, conta apenas seus eventos
        if (isCliente) {
          eventosQuery = query(
            collection(db, "eventos"),
            where("status", "==", "ativo"),
            where("usuarioId", "==", userDetails.uid)
          );
        } else {
          // Admin/fotógrafo vê todos
          eventosQuery = query(
            collection(db, "eventos"),
            where("status", "==", "ativo")
          );
        }
        
        const eventCountSnapshot = await getCountFromServer(eventosQuery);
        const eventosCount = eventCountSnapshot.data().count;
        console.log('📊 [STATS] Eventos ativos:', eventosCount);

        // Para total de fotos, busca todos os eventos (filtrados se for cliente)
        let todosEventosQuery;
        if (isCliente) {
          todosEventosQuery = query(
            collection(db, "eventos"),
            where("usuarioId", "==", userDetails.uid)
          );
        } else {
          todosEventosQuery = query(collection(db, "eventos"));
        }
        
        const eventosSnapshot = await getDocs(todosEventosQuery);
        console.log('📊 [STATS] Total de documentos eventos:', eventosSnapshot.size);
        
        const fotosCount = eventosSnapshot.docs.reduce((total, doc) => {
          return total + (doc.data().fotos || 0);
        }, 0);
        console.log('📊 [STATS] Total de fotos:', fotosCount);

        const mediaCalculada = eventosCount > 0 ? (fotosCount / eventosCount) : 0;

        setStats({
          eventosAtivos: eventosCount,
          totalFotos: fotosCount,
          mediaFotos: mediaCalculada,
        });
        
        console.log('✅ [STATS] Estatísticas carregadas com sucesso!');

      } catch (error) {
        console.error("❌ [STATS] Erro ao buscar estatísticas:", error);
        console.error("Código do erro:", error.code);
        console.error("Mensagem:", error.message);
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchStats();
  }, [userDetails, isCliente]);

  // --- NOVO useEffect para buscar a ATIVIDADE RECENTE ---
  useEffect(() => {
    async function fetchRecentActivity() {
      console.log('🎬 [ACTIVITY] Iniciando busca de atividade recente...');
      if (!userDetails) {
        console.log('⚠️ [ACTIVITY] userDetails não disponível ainda');
        return;
      }
      
      try {
        let q;
        
        // Se for cliente, busca apenas seus eventos (SEM orderBy para evitar índice composto)
        if (isCliente) {
          console.log('🔍 [CLIENTE] Buscando eventos para:', userDetails.uid);
          q = query(
            collection(db, "eventos"),
            where("usuarioId", "==", userDetails.uid)
          );
        } else {
          // Admin/fotógrafo busca TODOS os eventos (SEM orderBy inicialmente)
          console.log('🔍 [ADMIN] Buscando todos os eventos');
          q = query(collection(db, "eventos"));
        }

        const querySnapshot = await getDocs(q);
        console.log('📊 Eventos encontrados:', querySnapshot.size);
        
        let eventsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Ordena manualmente por data
        eventsList.sort((a, b) => {
          const dateA = a.dataCriacao?.toDate?.() || new Date(0);
          const dateB = b.dataCriacao?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        
        // Para admin, limita aos 5 mais recentes
        if (!isCliente) {
          eventsList = eventsList.slice(0, 5);
        }
        
        console.log('✅ Lista de eventos processada:', eventsList.length);
        console.log('📋 Eventos:', eventsList);
        setRecentEvents(eventsList);

      } catch (error) {
        console.error("❌ [ACTIVITY] Erro ao buscar atividade recente:", error);
        console.error("Código do erro:", error.code);
        console.error("Mensagem:", error.message);
        
        // Se o erro for de índice, mostrar instruções
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          console.warn('ATENÇÃO: Índice do Firestore necessário!');
          console.warn('Link para criar índice:', error.message);
        }
      } finally {
        setIsActivityLoading(false);
      }
    }
    fetchRecentActivity();
  }, [userDetails, isCliente]); // Roda quando userDetails ou isCliente mudar

  // Se for cliente, renderiza dashboard diferente
  if (isCliente) {
    return <DashboardCliente eventos={recentEvents} isLoading={isActivityLoading} />;
  }

  // Dashboard de Admin/Fotógrafo
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard do Administrador</h1>

      {/* Cards de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Total de Eventos Ativos" 
          value={stats.eventosAtivos} 
          isLoading={isLoadingStats} 
        />
        <KpiCard 
          title="Total de Fotos" 
          value={stats.totalFotos.toLocaleString('pt-BR')} 
          isLoading={isLoadingStats} 
        />
        <KpiCard 
          title="Total de Clientes" 
          value="45" // (Simulado)
          isLoading={false}
        />
        <KpiCard 
          title="Média de Fotos / Evento" 
          value={`${stats.mediaFotos.toFixed(1)}`} 
          isLoading={isLoadingStats} 
        />
      </div>

      {/* --- LISTA DE ATIVIDADE RECENTE ATUALIZADA --- */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
        
        {isActivityLoading ? (
          <p className="text-gray-500 animate-pulse">Carregando atividades...</p>
        ) : recentEvents.length === 0 ? (
          <p className="text-gray-500">Nenhuma atividade recente encontrada.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentEvents.map((evento) => (
              <li key={evento.id} className="py-3 flex items-center gap-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <FiPlus size={16} /> {/* Ícone de "Criado" */}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Novo evento criado: <span className="font-bold">{evento.nome}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {/* Usamos a função para formatar a data */}
                    {formatTimestamp(evento.dataCriacao)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}