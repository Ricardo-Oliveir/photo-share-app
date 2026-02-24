import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiUploadCloud, FiCamera, FiX, FiCheckCircle, FiLoader, FiUser, FiImage } from 'react-icons/fi';
import { storage, db } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

export default function UploadPage() {
  const { idDoEvento } = useParams();
  const [nomeDoEvento, setNomeDoEvento] = useState("Carregando...");
  const [files, setFiles] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  useEffect(() => {
    async function fetchEventData() {
      try {
        const docSnap = await getDoc(doc(db, "eventos", idDoEvento));
        if (docSnap.exists()) {
          setNomeDoEvento(docSnap.data().nome);
        }
      } catch (err) {
        console.error("Erro ao buscar evento:", err);
      } finally {
        setIsLoadingEvent(false);
      }
    }
    fetchEventData();
  }, [idDoEvento]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log("Arquivos selecionados:", selectedFiles); // Para você ver no console se pegou
    setFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = null; // Limpa para permitir selecionar a mesma foto de novo
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  async function handleSubmit(event) {
    event.preventDefault();
    if (files.length === 0) return;
    setIsUploading(true);
    
    try {
      const eventSnap = await getDoc(doc(db, "eventos", idDoEvento));
      const eventData = eventSnap.data();
      const limite = eventData?.limiteFotos || 300;
      const atuais = eventData?.fotos || 0;

      if (atuais + files.length > limite) {
        alert(`Limite atingido! Restam apenas ${limite - atuais} vagas.`);
        setIsUploading(false);
        return;
      }

      for (const file of files) {
        const uniqueFileName = `${uuidv4()}.${file.name.split('.').pop()}`;
        const storageRef = ref(storage, `eventos/${idDoEvento}/${uniqueFileName}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        
        await addDoc(collection(db, "eventos", idDoEvento, "photos"), {
          downloadURL,
          uploaderName: guestName || "Anônimo",
          uploadedAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, "eventos", idDoEvento), { fotos: increment(files.length) });
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      alert("Erro ao enviar. Verifique as regras do Firebase.");
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoadingEvent) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><FiLoader className="animate-spin text-blue-600" size={40} /></div>;

  if (isSuccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <FiCheckCircle className="text-green-500 w-20 h-20 mb-4" />
      <h1 className="text-3xl font-black text-slate-800 italic uppercase">Enviado!</h1>
      <button onClick={() => { setIsSuccess(false); setFiles([]); }} className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">Enviar mais fotos</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-[2.5rem] w-full max-w-md overflow-hidden border border-white">
        
        <div className="bg-blue-600 p-8 text-center text-white">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">{nomeDoEvento}</h1>
          <p className="text-blue-100 text-xs font-bold uppercase mt-1">Envie suas fotos para a galeria</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
              placeholder="Seu nome (opcional)" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 transition-all">
              <FiImage className="text-blue-600" size={32} />
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Galeria</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <label className="bg-slate-900 border-2 border-slate-900 p-6 rounded-[2rem] flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-800 transition-all">
              <FiCamera className="text-white" size={32} />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Câmera</span>
              <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
              {files.map((file, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-xl" alt="preview" />
                  <button type="button" onClick={() => removeFile(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><FiX size={10} /></button>
                </div>
              ))}
            </div>
          )}

          <button 
            type="submit" disabled={files.length === 0 || isUploading}
            className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-100 disabled:bg-slate-200 transition-all active:scale-95"
          >
            {isUploading ? <FiLoader className="animate-spin mx-auto" size={24} /> : `Enviar ${files.length} Foto(s)`}
          </button>
        </form>
      </div>
      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Powered by PhotoShare</p>
    </div>
  );
}