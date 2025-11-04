// src/pages/AdminEventoGaleriaPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// --- IMPORTS DO FIREBASE ATUALIZADOS ---
import { db, storage } from '../firebase.cjs';
import { collection, query, getDocs, orderBy, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore'; 
import { ref, deleteObject } from 'firebase/storage'; // Funções para DELETAR

// --- ÍCONES ATUALIZADOS ---
import { FiArrowLeft, FiUser, FiTrash2 } from 'react-icons/fi';

export default function AdminEventoGaleriaPage() {
  const { idDoEvento } = useParams();
  const [photos, setPhotos] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const nomeDoEvento = idDoEvento.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Efeito para buscar as imagens (sem alteração)
  useEffect(() => {
    async function fetchImages() {
      try {
        const photosRef = collection(db, 'eventos', idDoEvento, 'photos');
        const q = query(photosRef, orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const photosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPhotos(photosList);
      } catch (err) {
        console.error("Erro ao buscar imagens da galeria:", err);
        alert("Não foi possível carregar as imagens.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchImages();
  }, [idDoEvento]);

  // --- NOVA FUNÇÃO PARA DELETAR A FOTO ---
  async function handleDeletePhoto(photoToDelete) {
    // 1. Confirmação
    if (!window.confirm(`Tem certeza que deseja deletar esta foto? (Enviada por: ${photoToDelete.uploaderName})`)) {
      return;
    }

    try {
      // 2. Deletar o arquivo do Storage
      // (Precisamos do 'fileName' que salvamos no Firestore)
      const fileRef = ref(storage, `eventos/${idDoEvento}/${photoToDelete.fileName}`);
      await deleteObject(fileRef);
      console.log("Arquivo deletado do Storage.");

      // 3. Deletar o documento do Firestore (subcoleção)
      const photoDocRef = doc(db, 'eventos', idDoEvento, 'photos', photoToDelete.id);
      await deleteDoc(photoDocRef);
      console.log("Documento deletado do Firestore.");

      // 4. Atualizar o contador no evento principal (subtrair 1)
      const eventDocRef = doc(db, 'eventos', idDoEvento);
      await updateDoc(eventDocRef, {
        fotos: increment(-1) // Decrementa o contador
      });
      console.log("Contador do evento atualizado.");

      // 5. Atualizar a interface (remove a foto da lista)
      setPhotos((prevPhotos) => 
        prevPhotos.filter((photo) => photo.id !== photoToDelete.id)
      );
      
    } catch (err) {
      console.error("Erro ao deletar a foto:", err);
      alert("Não foi possível deletar a foto. Tente novamente.");
    }
  }


  if (isLoading) {
    return (
      <div className="text-center p-10">
        <p className="text-lg text-gray-600 animate-pulse">Carregando galeria...</p>
      </div>
    );
  }

  return (
    <div>
      <Link 
        to="/admin/eventos" 
        className="flex items-center gap-2 text-blue-600 hover:underline mb-4 text-sm"
      >
        <FiArrowLeft />
        Voltar para lista de eventos
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Galeria: {nomeDoEvento}</h1>

      {/* --- GRID DE IMAGENS ATUALIZADO --- */}
      {photos.length === 0 ? (
        <p className="text-gray-600">Nenhuma foto foi enviada para este evento ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {photos.map((photo) => (
            // O 'group' é importante para o botão de lixeira aparecer
            <div key={photo.id} className="rounded-lg overflow-hidden shadow-md group relative">
              
              {/* --- BOTÃO DELETAR ADICIONADO --- */}
              <button 
                onClick={() => handleDeletePhoto(photo)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700"
                title="Deletar foto"
              >
                <FiTrash2 size={14} />
              </button>
              
              <a href={photo.downloadURL} target="_blank" rel="noopener noreferrer">
                <img 
                  src={photo.downloadURL} 
                  alt={`Enviada por ${photo.uploaderName}`} 
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" 
                />
              </a>
              <div className="p-3 bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUser size={14} />
                  <span className="font-medium truncate">{photo.uploaderName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}