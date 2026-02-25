import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage, auth } from '../firebase.js'; // Adicionei auth aqui
import { 
  doc, getDoc, collection, query, orderBy, 
  onSnapshot, addDoc, serverTimestamp, updateDoc, increment 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  FiDownload, FiLoader, FiCamera, FiImage, 
  FiX, FiCheckCircle, FiPlus, FiLock 
} from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

export default function PublicGalleryPage() {
  const { idDoEvento } = useParams();
  const [eventData, setEventData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false); // Nova trava
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "eventos", idDoEvento);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentUser = auth.currentUser;
          const isOwner = currentUser?.uid === data.userId;

          // LOGICA DE SEGURANÇA IAM
          // Se for privado e não for o dono, barra o acesso
          if (data.privado && !isOwner) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }

          setEventData(data);

          // Listener das fotos só ativa se o acesso for permitido
          const q = query(collection(db, "eventos", idDoEvento, "photos"), orderBy("uploadedAt", "desc"));
          const unsubscribe = onSnapshot(q, (snap) => {
            setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
          });
          return unsubscribe;
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro de acesso:", err);
        setAccessDenied(true);
        setLoading(false);
      }
    };

    fetchData();
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
      await updateDoc(doc(db, "eventos", idDoEvento), { fotos: increment(selectedFiles.length) });
      setUploadSuccess(true);
      setSelectedFiles([]);
    } catch (err) {
      alert("Erro ao enviar fotos.");
    } finally {
      setUploading(false);
    }
  };

  // 1. TELA DE CARREGAMENTO (DENTRO DA FUNÇÃO)
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <FiLoader className="animate-spin text-blue-600" size={50} />
      </div>
    );
  }

  // 2. TELA DE ACESSO NEGADO (DENTRO DA FUNÇÃO)
  if (accessDenied) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md border border-slate-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-50">
            <FiLock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Evento Privado</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase mt-4 leading-relaxed tracking-widest">
            Acesso restrito pelo administrador. <br/> Apenas o dono do evento pode visualizar esta galeria.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  // 3. RENDERIZAÇÃO NORMAL (DENTRO DA FUNÇÃO)
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-white p-10 text-center shadow-sm border-b-4 border-blue-600 sticky top-0 z-20">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
          {eventData?.nome || "GALERIA"}
        </h1>
        <button 
          onClick={() => { setShowUploadModal(true); setUploadSuccess(false); }}
          className="mt-6 inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all"
        >
          <FiCamera size={20} /> ENVIAR MINHA FOTO
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {photos.map(photo => (
          <div key={photo.id} className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-md border-4 border-white aspect-square hover:scale-[1.02] transition-transform">
            <img src={photo.downloadURL} className="w-full h-full object-cover" alt="Foto" loading="lazy" />
            <div className="absolute bottom-4 left-4">
               <span className="bg-black/50 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-full font-black uppercase">
                 👤 {photo.uploaderName}
               </span>
            </div>
          </div>
        ))}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-8 text-center relative">
              <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <FiX size={24} />
              </button>
              <h2 className="text-2xl font-black text-white uppercase italic leading-none">{eventData?.nome}</h2>
            </div>
            <div className="p-8 space-y-6">
              {!uploadSuccess ? (
                <>
                  <input 
                    type="text" placeholder="Seu nome (opcional)"
                    className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-sm"
                    value={uploaderName} onChange={(e) => setUploaderName(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-slate-100 rounded-[2rem] cursor-pointer hover:bg-slate-50">
                      <FiImage size={30} className="text-blue-500" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <label className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1E293B] text-white rounded-[2rem] cursor-pointer hover:bg-slate-800">
                      <FiCamera size={30} />
                      <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <button onClick={handleUpload} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">
                      {uploading ? <FiLoader className="animate-spin" /> : `ENVIAR ${selectedFiles.length} FOTO(S)`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <FiCheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-slate-800 uppercase italic">Sucesso!</h3>
                  <button onClick={() => setShowUploadModal(false)} className="mt-6 w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Fechar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}