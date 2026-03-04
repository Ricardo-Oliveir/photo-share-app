import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage, auth } from '../firebase.js'; 
import { 
  doc, collection, query, orderBy, onSnapshot, 
  addDoc, serverTimestamp, updateDoc, increment 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiLoader, FiCamera, FiImage, FiX, FiCheckCircle, FiLock } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

export default function PublicGalleryPage() {
  const { idDoEvento } = useParams();
  const [eventData, setEventData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Referência para o contador real (usada na função de limpeza/saída)
  const photosCountRef = useRef(0);

  useEffect(() => {
    // Sincroniza a referência com o estado das fotos
    photosCountRef.current = photos.length;
  }, [photos.length]);

  useEffect(() => {
    // 1. Ouvinte do Evento (Privacidade e Nome)
    const unsubEvento = onSnapshot(doc(db, "eventos", idDoEvento), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isOwner = auth.currentUser?.uid === data.userId;
        if (data.isPrivate && !isOwner) { // Uso do isPrivate correto
          setAccessDenied(true);
        } else {
          setAccessDenied(false);
          setEventData(data);
        }
      }
    });

    // 2. Ouvinte das Fotos (Galeria Real Time)
    const q = query(collection(db, "eventos", idDoEvento, "photos"), orderBy("uploadedAt", "desc"));
    const unsubFotos = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // --- LÓGICA AUTOMÁTICA DE SINCRONIZAÇÃO NA SAÍDA ---
    const forceSync = async () => {
      if (photosCountRef.current > 0) {
        try {
          await updateDoc(doc(db, "eventos", idDoEvento), { 
            fotos: photosCountRef.current // Força o valor real no banco
          });
        } catch (e) { console.error("Sync de saída falhou"); }
      }
    };

    window.addEventListener('beforeunload', forceSync);

    return () => {
      forceSync(); // Roda ao navegar internamente no app
      window.removeEventListener('beforeunload', forceSync);
      unsubEvento();
      unsubFotos();
    };
  }, [idDoEvento]);

  const handleFileChange = (e) => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  const removeFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
        const res = await uploadBytes(ref(storage, `eventos/${idDoEvento}/${fileName}`), file);
        const url = await getDownloadURL(res.ref);
        
        await addDoc(collection(db, "eventos", idDoEvento, "photos"), {
          downloadURL: url, fileName, uploadedAt: serverTimestamp(), uploaderName: uploaderName.trim() || "ANÔNIMO"
        });
      }
      // Incremento imediato para feedback rápido
      await updateDoc(doc(db, "eventos", idDoEvento), { fotos: increment(selectedFiles.length) });
      setUploadSuccess(true); setSelectedFiles([]);
    } catch (err) { alert("Erro ao enviar. Verifique as regras do Firestore."); }
    finally { setUploading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><FiLoader className="animate-spin text-blue-600" size={50} /></div>;

  if (accessDenied) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md border border-slate-100">
          <FiLock size={40} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 uppercase italic">Evento Privado</h2>
          <button onClick={() => window.location.href = '/'} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">
            Voltar para o Início {/* Correção do OTE */}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-white p-10 text-center shadow-sm border-b-4 border-blue-600 sticky top-0 z-20">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">{eventData?.nome || "GALERIA"}</h1>
        <button onClick={() => { setShowUploadModal(true); setUploadSuccess(false); }} className="mt-6 inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-all"><FiCamera size={20} /> ENVIAR MINHA FOTO</button>
      </header>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {photos.map(photo => (
          <div key={photo.id} className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-md aspect-square border-4 border-white">
            <img src={photo.downloadURL} className="w-full h-full object-cover" alt="Foto" loading="lazy" />
            <div className="absolute bottom-4 left-4"><span className="bg-black/50 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-full font-black uppercase">👤 {photo.uploaderName}</span></div>
          </div>
        ))}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-8 text-center relative">
              <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><FiX size={24} /></button>
              <h2 className="text-2xl font-black text-white uppercase italic">Enviar Fotos</h2>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {!uploadSuccess ? (
                <>
                  <input type="text" placeholder="Seu nome" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-slate-100 rounded-[2rem] cursor-pointer"><FiImage size={30} className="text-blue-500" /><input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} /></label>
                    <label className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1E293B] text-white rounded-[2rem] cursor-pointer"><FiCamera size={30} /><input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleFileChange} /></label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 p-2 bg-slate-50 rounded-3xl">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                          <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"><FiX size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedFiles.length > 0 && <button onClick={handleUpload} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">{uploading ? <FiLoader className="animate-spin inline mr-2" /> : `ENVIAR ${selectedFiles.length} FOTO(S)`}</button>}
                </>
              ) : (
                <div className="text-center py-6">
                  <FiCheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-slate-800 uppercase italic">Sucesso!</h3>
                  <button onClick={() => setShowUploadModal(false)} className="mt-6 w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Fechar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}