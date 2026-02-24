import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, storage } from '../firebase.js';
import {
  doc, getDoc, updateDoc, collection, query,
  orderBy, onSnapshot, deleteDoc, increment
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import {
  FiArrowLeft, FiLock, FiUnlock, FiTrash2,
  FiDownload, FiCheckSquare, FiSquare, FiLoader, FiCheck, FiX
} from 'react-icons/fi';

export default function AdminEventoGaleriaPage() {
  const { idDoEvento } = useParams();
  const [eventData, setEventData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  // Estado para controlar a foto selecionada para visualização em tela cheia
  const [selectedPhotoView, setSelectedPhotoView] = useState(null);

  useEffect(() => {
    getDoc(doc(db, "eventos", idDoEvento)).then(s => s.exists() && setEventData(s.data()));
    const q = query(collection(db, "eventos", idDoEvento, "photos"), orderBy("uploadedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [idDoEvento]);

  const togglePrivacy = async () => {
    const newStatus = !eventData?.isPrivate;
    await updateDoc(doc(db, "eventos", idDoEvento), { isPrivate: newStatus });
    setEventData({ ...eventData, isPrivate: newStatus });
  };

  const downloadPhoto = async (url, fileName) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName || "foto.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    const targets = selected.length > 0 ? photos.filter(p => selected.includes(p.id)) : photos;
    if (targets.length === 0) {
      alert("Nenhuma foto para baixar.");
      return;
    }
    if (!window.confirm(`Baixar ${targets.length} fotos?`)) return;
    for (const photo of targets) {
      await downloadPhoto(photo.downloadURL, photo.fileName);
      await new Promise(r => setTimeout(r, 600));
    }
  };

  const handleDeleteSelected = async () => {
    const count = selected.length;
    if (count === 0 || !window.confirm(`Deletar permanentemente ${count} fotos?`)) return;
    try {
      for (const id of selected) {
        const photo = photos.find(p => p.id === id);
        await deleteObject(ref(storage, `eventos/${idDoEvento}/${photo.fileName}`));
        await deleteDoc(doc(db, "eventos", idDoEvento, "photos", id));
      }
      await updateDoc(doc(db, "eventos", idDoEvento), { fotos: increment(-count) });
      setSelected([]);
    } catch (err) { alert("Erro ao deletar."); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><FiLoader className="animate-spin text-blue-600" size={50} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 space-y-6 relative">

      {/* Header: Link de Voltar e Título/Botão de Privacidade */}
      <div className="space-y-4">
        <Link to="/admin/eventos" className="flex items-center gap-2 text-blue-500 font-black uppercase text-[10px] tracking-widest w-fit">
          <FiArrowLeft /> VOLTAR AO PAINEL
        </Link>

        {/* Container flex para Título e Botão de Privacidade */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-black text-[#1E293B] uppercase italic">
            {eventData?.nome || "Carregando..."}
          </h1>

          {/* Botão de Privacidade mais discreto e alinhado à direita */}
          <button
            onClick={togglePrivacy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm border-2 transition-all ${
              eventData?.isPrivate ? 'bg-[#1E293B] text-white border-[#1E293B]' : 'bg-white text-[#10B981] border-[#10B981]'
            }`}
          >
            {eventData?.isPrivate ? <><FiLock size={14} /> EVENTO PRIVADO</> : <><FiUnlock size={14} /> EVENTO PÚBLICO</>}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelected(selected.length === photos.length && photos.length > 0 ? [] : photos.map(p => p.id))}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase"
          >
            {selected.length === photos.length && photos.length > 0 ? <FiCheckSquare className="text-blue-600" /> : <FiSquare />}
            SELECIONAR TUDO
          </button>
          <span className="text-[10px] font-black text-slate-300 uppercase">
            {photos.length} FOTOS NO TOTAL
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadAll}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
          >
            <FiDownload /> {selected.length > 0 ? `BAIXAR (${selected.length})` : "BAIXAR TUDO"}
          </button>

          {selected.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-red-100 animate-in zoom-in hover:bg-red-600 transition-colors"
            >
              <FiTrash2 /> DELETAR ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* Grid de Fotos Maior */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map(photo => (
          <div
            key={photo.id}
            // Clique no card abre o modal de visualização
            onClick={() => setSelectedPhotoView(photo)}
            className={`group relative bg-white rounded-[2.5rem] overflow-hidden cursor-pointer border-4 transition-all ${
              selected.includes(photo.id) ? 'border-blue-500 scale-95' : 'border-white shadow-md hover:shadow-lg'
            }`}
          >
            <img src={photo.downloadURL} className="w-full aspect-square object-cover" alt="Foto" />

            {/* Botão de Seleção (Checkbox) - propagation parado para não abrir o modal */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelected(prev => prev.includes(photo.id) ? prev.filter(i => i !== photo.id) : [...prev, photo.id]);
              }}
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                selected.includes(photo.id) ? 'bg-blue-500 text-white' : 'bg-white/80 text-blue-500 opacity-0 group-hover:opacity-100'
              }`}
            >
              <FiCheck size={16} strokeWidth={4} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                👤 {photo.uploaderName || "ANÔNIMO"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Visualização de Foto em Tela Cheia */}
      {selectedPhotoView && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200">
          {/* Botão de Fechar/Voltar */}
          <button
            onClick={() => setSelectedPhotoView(null)}
            className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors z-10 flex items-center gap-2 font-black uppercase text-xs tracking-widest"
          >
            <FiArrowLeft size={20} /> VOLTAR
          </button>

          {/* Container da Imagem */}
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <img
              src={selectedPhotoView.downloadURL}
              alt="Visualização em tela cheia"
              className="max-h-full max-w-full object-contain rounded-[2rem] shadow-2xl"
            />
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white text-sm px-4 py-2 rounded-full font-black uppercase tracking-wider">
                👤 {selectedPhotoView.uploaderName || "ANÔNIMO"}
              </div>
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-black uppercase tracking-widest">
          Nenhuma foto encontrada neste evento.
        </div>
      )}
    </div>
  );
}