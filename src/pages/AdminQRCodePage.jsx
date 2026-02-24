import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { FiArrowLeft, FiCopy, FiLock, FiExternalLink } from 'react-icons/fi';

export default function AdminQRCodePage() {
  const { idDoEvento } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); 
  const [loading, setLoading] = useState(true);

  const uploadUrl = `${window.location.origin}/evento/${idDoEvento}`;
  const galeriaUrl = `${window.location.origin}/galeria/${idDoEvento}`;

  useEffect(() => {
    getDoc(doc(db, "eventos", idDoEvento)).then(s => {
      if (s.exists()) {
        const data = s.data();
        setEvento(data);
        // Se o evento for privado, força a aba a ser 'upload' por segurança
        if (data.isPrivate) setActiveTab('upload');
      }
      setLoading(false);
    });
  }, [idDoEvento]);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Link copiado com sucesso!");
  };

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400 animate-pulse">Verificando Permissões...</div>;

  return (
    <div className="p-10 space-y-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest">
        <FiArrowLeft /> VOLTAR
      </button>

      <div className="text-center">
        <h1 className="text-5xl font-black text-slate-800 uppercase italic tracking-tighter">{evento?.nome}</h1>
      </div>

      {/* SELEÇÃO DE LINK (CONDICIONAL) */}
      <div className="flex bg-slate-100 p-2 rounded-[2rem] max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-4 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'upload' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}
        >
          Link de Envio
        </button>

        {/* SÓ MOSTRA O BOTÃO DA GALERIA SE O EVENTO NÃO FOR PRIVADO */}
        {!evento?.isPrivate ? (
          <button 
            onClick={() => setActiveTab('galeria')}
            className={`flex-1 py-4 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'galeria' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}
          >
            Link da Galeria
          </button>
        ) : (
          <div className="flex-1 py-4 flex items-center justify-center gap-2 text-slate-300 cursor-not-allowed">
            <FiLock size={12} />
            <span className="font-black uppercase text-[10px] tracking-widest">Galeria Privada</span>
          </div>
        )}
      </div>

      {/* ÁREA DO QR CODE */}
      <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-50 flex flex-col items-center space-y-8">
        <div className="p-8 bg-slate-50 rounded-[3rem] shadow-inner">
          <QRCodeCanvas value={activeTab === 'upload' ? uploadUrl : galeriaUrl} size={250} level="H" includeMargin={true} />
        </div>

        <div className="text-center space-y-4 w-full max-w-sm">
          <p className="font-black text-slate-800 uppercase italic text-sm">
            {activeTab === 'upload' ? "📷 QR Code para Enviar Fotos" : "🖼️ QR Code para Ver Galeria"}
          </p>
          
          <div className="flex bg-slate-50 p-2 rounded-2xl items-center border border-slate-100">
            <input 
              type="text" readOnly value={activeTab === 'upload' ? uploadUrl : galeriaUrl} 
              className="flex-1 bg-transparent border-none p-3 font-bold text-[10px] text-slate-400 truncate" 
            />
            <button 
              onClick={() => copyToClipboard(activeTab === 'upload' ? uploadUrl : galeriaUrl)}
              className="bg-white p-3 rounded-xl text-blue-600 shadow-sm"
            >
              <FiCopy size={18} />
            </button>
          </div>

          <button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest">
            Imprimir QR Code
          </button>
        </div>
      </div>

      {/* AVISO DE GOVERNANÇA */}
      {evento?.isPrivate && (
        <div className="bg-amber-50 p-6 rounded-[2rem] border-2 border-dashed border-amber-200 flex items-center gap-4">
          <FiLock className="text-amber-500" size={24} />
          <p className="text-amber-700 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
            Este evento está configurado como **Privado**. A opção de gerar link público de visualização foi desabilitada para garantir a segurança dos dados.
          </p>
        </div>
      )}
    </div>
  );
}