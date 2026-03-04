import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, storage } from '../firebase.js';
import { doc, updateDoc, collection, query, orderBy, onSnapshot, deleteDoc, increment } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { FiArrowLeft, FiLock, FiUnlock, FiTrash2, FiDownload, FiCheckSquare, FiSquare, FiLoader, FiCheck, FiMaximize2 } from 'react-icons/fi';

export default function AdminEventoGaleriaPage() {
  const { idDoEvento } = useParams();
  const [eventData, setEventData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoView, setSelectedPhotoView] = useState(null);
  const photosCountRef = useRef(0);

  useEffect(() => {
    photosCountRef.current = photos.length;
  }, [photos.length]);

  useEffect(() => {
    const unsubEvento = onSnapshot(doc(db, "eventos", idDoEvento), (docSnap) => {
      if (docSnap.exists()) setEventData(docSnap.data());
    });

    const q = query(collection(db, "eventos", idDoEvento, "photos"), orderBy("uploadedAt", "desc"));
    const unsubFotos = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const forceSync = async () => {
      if (photosCountRef.current >= 0) {
        try {
          await updateDoc(doc(db, "eventos", idDoEvento), { fotos: photosCountRef.current });
        } catch (e) { console.error("Sync falhou"); }
      }
    };

    window.addEventListener('beforeunload', forceSync);
    return () => {
      forceSync();
      window.removeEventListener('beforeunload', forceSync);
      unsubEvento();
      unsubFotos();
    };
  }, [idDoEvento]);

  const toggleSelection = useCallback((id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const togglePrivacy = async () => {
    await updateDoc(doc(db, "eventos", idDoEvento), {
      isPrivate: !eventData?.isPrivate
    });
  };

  const downloadAll = async () => {
    const targets = selected.length > 0
      ? photos.filter(p => selected.includes(p.id))
      : photos;

    if (targets.length === 0) return alert("Nenhuma foto para baixar.");

    for (const photo of targets) {
      const res = await fetch(photo.downloadURL);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = photo.fileName || "foto.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(r => setTimeout(r, 500));
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0 || !window.confirm(`Deletar ${selected.length} fotos?`)) return;

    setLoading(true);
    let successfullyDeleted = 0;

    try {
      for (const id of selected) {
        const photo = photos.find(p => p.id === id);

        if (photo?.fileName) {
          try {
            await deleteObject(ref(storage, `eventos/${idDoEvento}/${photo.fileName}`));
          } catch (e) {}
        }

        await deleteDoc(doc(db, "eventos", idDoEvento, "photos", id));
        successfullyDeleted++;
      }

      await updateDoc(doc(db, "eventos", idDoEvento), {
        fotos: increment(-successfullyDeleted)
      });

      setSelected([]);
    } catch (err) {
      alert("Erro ao deletar.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-blue-600" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* CONTEÚDO SUPERIOR */}
      <div className="p-6 md:p-10 space-y-6">

        <Link
          to="/admin/eventos"
          className="text-blue-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 w-fit"
        >
          <FiArrowLeft /> VOLTAR AO PAINEL
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black text-[#1E293B] uppercase italic">
            {eventData?.nome || "Evento"}
          </h1>

          <button
            onClick={togglePrivacy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 transition-all ${
              eventData?.isPrivate
                ? 'bg-[#1E293B] text-white border-[#1E293B]'
                : 'bg-white text-emerald-500 border-emerald-500'
            }`}
          >
            {eventData?.isPrivate
              ? <><FiLock /> PRIVADO</>
              : <><FiUnlock /> PÚBLICO</>}
          </button>
        </div>
      </div>

      {/* BARRA FIXA */}
      <div className="sticky top-0 z-50 bg-[#F8FAFC] border-b border-slate-200">
        <div className="px-6 md:px-10 py-4">
          <div className="bg-white p-4 rounded-[2rem] shadow-xl flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setSelected(selected.length === photos.length
                    ? []
                    : photos.map(p => p.id))
                }
                className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl"
              >
                {selected.length === photos.length && photos.length > 0
                  ? <FiCheckSquare className="text-blue-600" />
                  : <FiSquare />}
                SELECIONAR TUDO
              </button>

              <span className="text-[10px] font-black text-slate-300 uppercase">
                {photos.length} FOTOS
              </span>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={downloadAll}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-blue-700"
              >
                <FiDownload size={14} />
                {selected.length > 0
                  ? `BAIXAR (${selected.length})`
                  : "BAIXAR TUDO"}
              </button>

              {selected.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="bg-red-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg"
                >
                  <FiTrash2 />
                  DELETAR ({selected.length})
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {photos.map(photo => (
            <div
              key={photo.id}
              onClick={() => toggleSelection(photo.id)}
              className={`group relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-200 cursor-pointer ${
                selected.includes(photo.id)
                  ? 'border-blue-500 scale-95 shadow-inner'
                  : 'border-white shadow-md hover:border-slate-200'
              }`}
            >
              <img
                src={photo.downloadURL}
                className="w-full h-full object-cover"
                alt="Foto"
                loading="lazy"
              />

              <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                selected.includes(photo.id)
                  ? 'bg-blue-500 text-white scale-110 shadow-lg'
                  : 'bg-white/40 text-transparent opacity-0 group-hover:opacity-100 border-2 border-white'
              }`}>
                <FiCheck size={16} strokeWidth={4} />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhotoView(photo);
                }}
                className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-full text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-lg"
              >
                <FiMaximize2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPhotoView && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedPhotoView(null)}
            className="absolute top-6 right-6 text-white text-[10px] font-black uppercase flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full"
          >
            <FiArrowLeft /> VOLTAR
          </button>
          <img
            src={selectedPhotoView.downloadURL}
            className="max-h-full max-w-full object-contain rounded-[2rem] shadow-2xl"
            alt="Preview"
          />
        </div>
      )}
    </div>
  );
}