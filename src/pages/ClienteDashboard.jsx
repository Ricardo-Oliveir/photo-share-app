// src/pages/ClienteDashboard.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase.cjs';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { FiCamera, FiCalendar, FiImage, FiLogOut } from 'react-icons/fi';
import { FaCameraRetro } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext.jsx';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.cjs';

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

export default function ClienteDashboard() {
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [fotosEventos, setFotosEventos] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFotos, setLoadingFotos] = useState(true);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  useEffect(() => {
    async function carregarEventos() {
      if (!userDetails) return;
      
      try {
        console.log('🔍 Buscando eventos para cliente:', userDetails.uid);
        console.log('📧 Email do cliente:', userDetails.email);
        
        // Query sem orderBy para evitar necessidade de índice composto
        const q = query(
          collection(db, "eventos"),
          where("usuarioId", "==", userDetails.uid)
        );

        const querySnapshot = await getDocs(q);
        console.log('📊 Eventos encontrados:', querySnapshot.size);
        
        const eventosList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📌 Evento:', doc.id, data);
          return {
            id: doc.id,
            ...data
          };
        });
        
        // Ordenar manualmente por data de criação (mais recente primeiro)
        eventosList.sort((a, b) => {
          const dateA = a.dataCriacao?.toDate?.() || new Date(0);
          const dateB = b.dataCriacao?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        
        setEventos(eventosList);
      } catch (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        
        if (error.code === 'failed-precondition') {
          console.error('⚠️ ÍNDICE NECESSÁRIO!');
          console.error('Link do erro:', error.message);
          alert('É necessário criar um índice no Firestore. Verifique o console para mais detalhes.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    carregarEventos();
  }, [userDetails]);

  useEffect(() => {
    async function carregarFotos() {
      if (eventos.length === 0) {
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Carregando seus eventos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaCameraRetro className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PhotoShare</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">
                Olá, {userDetails?.nome || 'Cliente'}!
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                CLIENTE
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
              >
                <FiLogOut />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Meus Eventos</h2>

        {eventos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <FiCamera size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Você ainda não possui eventos cadastrados.
            </p>
            <p className="text-sm text-gray-400">
              Entre em contato com o administrador para criar um evento para você.
            </p>
          </div>
        ) : (
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
                        <h3 className="text-2xl font-bold mb-2">{evento.nome}</h3>
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
                      {totalFotos > 0 && (
                        <Link
                          to={`/evento/${evento.id}`}
                          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                          Ver Todas
                        </Link>
                      )}
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
                      <>
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

                        {totalFotos > 12 && (
                          <div className="mt-4 text-center">
                            <Link
                              to={`/evento/${evento.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              + Ver mais {totalFotos - 12} fotos
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
