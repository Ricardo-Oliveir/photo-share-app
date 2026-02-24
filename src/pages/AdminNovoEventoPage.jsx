import React, { useState } from 'react';
import { db, auth } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiCheck, FiStar } from 'react-icons/fi';

export default function AdminNovoEventoPage() {
  const [nome, setNome] = useState('');
  const [plano, setPlano] = useState('basico');
  const navigate = useNavigate();

  const planosConfig = {
    basico: { nome: 'Básico', preco: 49.90, limite: 300 },
    padrao: { nome: 'Padrão', preco: 149.90, limite: 1000 },
    premium: { nome: 'Premium', preco: 499.90, limite: 999999 }
  };

  async function handleCriar(e) {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, "eventos"), {
        nome,
        userId: auth.currentUser.uid,
        status: 'ativo',
        createdAt: serverTimestamp(),
        fotos: 0,
        preco: planosConfig[plano].preco,
        limiteFotos: planosConfig[plano].limite,
        tipoPlano: planosConfig[plano].nome
      });
      navigate('/admin/eventos');
    } catch (error) { console.error(error); }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-black text-slate-800 uppercase italic">Novo Evento</h1>
      <form onSubmit={handleCriar} className="space-y-6 bg-white p-8 rounded-3xl border shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Evento</label>
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-blue-600 font-bold" placeholder="Ex: Casamento Ricardo" />
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escolha o Plano de Fotos</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(planosConfig).map((key) => (
              <button key={key} type="button" onClick={() => setPlano(key)} className={`p-4 rounded-2xl border-2 text-left transition-all ${plano === key ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">{planosConfig[key].nome}</span>
                  {plano === key && <FiCheck className="text-blue-600" />}
                </div>
                <p className="text-lg font-black text-slate-800">R$ {planosConfig[key].preco.toFixed(2).replace('.', ',')}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">{planosConfig[key].limite > 1000 ? 'Ilimitado' : `${planosConfig[key].limite} fotos`}</p>
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"><FiSave /> Ativar Evento</button>
      </form>
    </div>
  );
}