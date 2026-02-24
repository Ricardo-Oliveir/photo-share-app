import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from '../firebase.js';
import { 
  doc, getDoc, collection, query, orderBy, 
  onSnapshot, addDoc, serverTimestamp, updateDoc, increment 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  FiDownload, FiLoader, FiCamera, FiImage, 
  FiX, FiCheckCircle, FiPlus 
} from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

export default function PublicGalleryPage() {
  const { idDoEvento } = useParams();
  const [eventData, setEventData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o Modal de Upload (Estilo image_fea29e.png)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "eventos", idDoEvento)).then(s => s.exists() && setEventData(s.data()));
    const q = query(collection(db, "eventos", idDoEvento, "photos"), orderBy("uploadedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [idDoEvento]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    try {
      for (const file of selectedFiles) {
        const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
        const res = await uploadBytes(ref(storage, `eventos/${idDoEvento}/${fileName}`), file);
        const url = await getDownloadURL(res.ref);
        
        await addDoc(collection(db, "eventos", idDoEvento, "photos"), {
          downloadURL: url,
          fileName,
          uploadedAt: serverTimestamp(),
          uploaderName: uploaderName.trim() || "ANÔNIMO"
        });
      }
      
      await updateDoc(doc(db, "eventos", idDoEvento), { 
        fotos: increment(selectedFiles.length) 
      });

      setUploadSuccess(true);
      setSelectedFiles([]);
    } catch (err) {
      alert("Erro ao enviar fotos.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><FiLoader className="animate-spin text-blue-600" size={50} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header com Botão de Enviar (image_fea1c6.png) */}
      <header className="bg-white p-10 text-center shadow-sm border-b-4 border-blue-600 sticky top-0 z-20">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
          {eventData?.nome || "FESTA VICENTE"}
        </h1>
        
        <button 
          onClick={() => { setShowUploadModal(true); setUploadSuccess(false); }}
          className="mt-6 inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all"
        >
          <FiCamera size={20} /> ENVIAR MINHA FOTO
        </button>
      </header>

      {/* Grid de Fotos */}
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {photos.map(photo => (
          <div key={photo.id} className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-md border-4 border-white aspect-square">
            <img src={photo.downloadURL} className="w-full h-full object-cover" alt="Foto" loading="lazy" />
            <div className="absolute bottom-4 left-4">
               <span className="bg-black/50 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-full font-black uppercase">
                 👤 {photo.uploaderName}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE UPLOAD (Estilo image_fea29e.png) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            
            {/* Header do Card */}
            <div className="bg-blue-600 p-8 text-center relative">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <FiX size={24} />
              </button>
              <h2 className="text-2xl font-black text-white uppercase italic leading-none">{eventData?.nome}</h2>
              <p className="text-white/70 font-bold uppercase text-[10px] tracking-widest mt-2">Envie suas fotos para a galeria</p>
            </div>

            <div className="p-8 space-y-6">
              {!uploadSuccess ? (
                <>
                  {/* Campo de Nome */}
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Seu nome (opcional)"
                      className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                    />
                  </div>

                  {/* Botões de Seleção */}
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-slate-100 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-colors">
                      <FiImage size={30} className="text-blue-500" />
                      <span className="font-black uppercase text-[10px] text-slate-400">Galeria</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <label className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1E293B] text-white rounded-[2rem] cursor-pointer hover:bg-slate-800 transition-colors">
                      <FiCamera size={30} />
                      <span className="font-black uppercase text-[10px]">Câmera</span>
                      <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>

                  {/* Lista de selecionados/Botão Enviar */}
                  {selectedFiles.length > 0 && (
                    <button 
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-inner flex items-center justify-center gap-2"
                    >
                      {uploading ? <FiLoader className="animate-spin" /> : `ENVIAR ${selectedFiles.length} FOTO(S)`}
                    </button>
                  )}
                </>
              ) : (
                /* MENSAGEM DE SUCESSO (Deseja enviar mais fotos?) */
                <div className="text-center py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-50">
                    <FiCheckCircle size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase italic">Fotos enviadas!</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase mt-2">Deseja enviar mais fotos?</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setUploadSuccess(false)}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                    >
                      <FiPlus /> Sim, enviar mais
                    </button>
                    <button 
                      onClick={() => setShowUploadModal(false)}
                      className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                    >
                      Não, ver galeria
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}