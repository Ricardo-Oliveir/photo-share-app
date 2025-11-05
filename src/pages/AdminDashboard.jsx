// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase.cjs';
// Adicionamos 'limit' para buscar apenas os 5 mais recentes
import { collection, query, where, getDocs, getCountFromServer, orderBy, limit } from "firebase/firestore";
import { FiPlus, FiCamera } from 'react-icons/fi'; // Ícones para a nova lista

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

// Componente Principal do Dashboard
export default function AdminDashboard() {
  
  const [stats, setStats] = useState({
    eventosAtivos: 0,
    totalFotos: 0,
    mediaFotos: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // --- NOVOS ESTADOS PARA A LISTA DE ATIVIDADE ---
  const [recentEvents, setRecentEvents] = useState([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  // useEffect para buscar as ESTATÍSTICAS (KPIs)
  useEffect(() => {
    async function fetchStats() {
      try {
        const eventosQuery = query(
          collection(db, "eventos"),
          where("status", "==", "ativo")
        );
        const eventCountSnapshot = await getCountFromServer(eventosQuery);
        const eventosCount = eventCountSnapshot.data().count;

        const todosEventosQuery = query(collection(db, "eventos"));
        const eventosSnapshot = await getDocs(todosEventosQuery);
        
        const fotosCount = eventosSnapshot.docs.reduce((total, doc) => {
          return total + (doc.data().fotos || 0);
        }, 0);

        const mediaCalculada = eventosCount > 0 ? (fotosCount / eventosCount) : 0;

        setStats({
          eventosAtivos: eventosCount,
          totalFotos: fotosCount,
          mediaFotos: mediaCalculada,
        });

      } catch (error) {
        console.error("Erro ao buscar estatísticas: ", error);
        alert("Não foi possível carregar as estatísticas do dashboard.");
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  // --- NOVO useEffect para buscar a ATIVIDADE RECENTE ---
  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        // Busca os 5 eventos mais recentes pela data de criação
        const q = query(
          collection(db, "eventos"),
          orderBy("dataCriacao", "desc"), // Ordena do mais novo para o mais antigo
          limit(5) // Pega apenas os 5 primeiros
        );

        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecentEvents(eventsList);

      } catch (error) {
        console.error("Erro ao buscar atividade recente: ", error);
      } finally {
        setIsActivityLoading(false);
      }
    }
    fetchRecentActivity();
  }, []); // Roda apenas uma vez

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