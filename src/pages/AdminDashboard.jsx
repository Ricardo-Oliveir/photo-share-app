import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../firebase.js';
import { collection, query, getDocs, doc, getDoc, orderBy, where } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { FiCamera, FiImage, FiLoader, FiDatabase, FiDollarSign, FiTrash2, FiTrendingUp, FiPieChart, FiPlus, FiSearch, FiFilter, FiCalendar, FiClock } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todosEventos, setTodosEventos] = useState([]);
  
  // Filtros Avançados
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("todos");
  const [filtroMes, setFiltroMes] = useState("todos");
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear().toString());
  const [filtroStatus, setFiltroStatus] = useState("ativo");

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userSnap = await getDoc(doc(db, "usuarios", user.uid));
          const uData = userSnap.data();
          setUserData(uData);
          const isAdmin = uData?.role === 'admin';

          const usersMap = {};
          if (isAdmin) {
            const usersSnap = await getDocs(collection(db, "usuarios"));
            usersSnap.forEach(d => usersMap[d.id] = d.data().nome);
          }

          const q = isAdmin 
            ? query(collection(db, "eventos"), orderBy("createdAt", "desc")) 
            : query(collection(db, "eventos"), where("userId", "==", user.uid));
          
          const snap = await getDocs(q);
          const tempLista = [];
          snap.forEach(d => {
            const data = d.data();
            const dataCriacao = data.createdAt?.toDate() || new Date();
            
            const hoje = new Date();
            const diffTime = Math.abs(hoje - dataCriacao);
            const diasAtivo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            tempLista.push({ 
              id: d.id, ...data, 
              dataCriacao,
              diasAtivo,
              clienteNome: usersMap[data.userId] || uData.nome,
              porcentagemUso: Math.min(((data.fotos || 0) / (data.limiteFotos || 300)) * 100, 100)
            });
          });
          setTodosEventos(tempLista);
        } catch (e) { console.error(e); } finally { setLoading(false); }
      }
    });
    return () => unsubscribe();
  }, []);

  const dadosFiltrados = useMemo(() => {
    return todosEventos.filter(ev => {
      const matchNome = ev.nome.toLowerCase().includes(filtroNome.toLowerCase()) || 
                        ev.clienteNome.toLowerCase().includes(filtroNome.toLowerCase());
      const matchPlano = filtroPlano === "todos" || ev.tipoPlano === filtroPlano;
      const matchMes = filtroMes === "todos" || (ev.dataCriacao.getMonth() + 1).toString() === filtroMes;
      const matchAno = filtroAno === "todos" || ev.dataCriacao.getFullYear().toString() === filtroAno;
      const matchStatus = filtroStatus === "todos" || ev.status === filtroStatus;
      
      return matchNome && matchPlano && matchMes && matchAno && matchStatus;
    });
  }, [todosEventos, filtroNome, filtroPlano, filtroMes, filtroAno, filtroStatus]);

  const stats = useMemo(() => {
    let fotosT = 0, receitaT = 0;
    const faturamentoMensal = {};
    const planosContagem = { 'Básico': 0, 'Padrão': 0, 'Premium': 0 };

    dadosFiltrados.forEach(ev => {
      fotosT += (ev.fotos || 0);
      receitaT += (ev.preco || 0);
      planosContagem[ev.tipoPlano || 'Básico']++;
      const mesAno = ev.dataCriacao.toLocaleDateString('pt-BR', { month: 'short' });
      faturamentoMensal[mesAno] = (faturamentoMensal[mesAno] || 0) + (ev.preco || 0);
    });

    const gb = (fotosT * 2.5) / 1024;
    return {
      eventos: dadosFiltrados.length, fotos: fotosT, faturamento: receitaT,
      armazenamento: gb.toFixed(2), custoEst: (gb * 0.15).toFixed(2),
      chartData: Object.keys(faturamentoMensal).map(m => ({ name: m, total: faturamentoMensal[m] })),
      planoData: [
        { name: 'Básico', value: planosContagem['Básico'] },
        { name: 'Padrão', value: planosContagem['Padrão'] },
        { name: 'Premium', value: planosContagem['Premium'] }
      ]
    };
  }, [dadosFiltrados]);

  if (loading) return <div className="p-20 text-center"><FiLoader className="animate-spin text-blue-600" size={50} /></div>;

  const isAdmin = userData?.role === 'admin';

  return (
    <div className="space-y-8 pb-16 max-w-[1500px] mx-auto p-4">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
          Dashboard <span className="text-blue-600 font-black italic">PhotoShare</span>
        </h1>
        <Link to="/admin/eventos/novo" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2">
          <FiPlus /> Novo Evento
        </Link>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-5 rounded-[2rem] border shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Buscar por cliente ou evento..." 
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-blue-500"
            value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filtroPlano} onChange={(e) => setFiltroPlano(e.target.value)}>
          <option value="todos">Planos</option>
          <option value="Básico">Básico</option>
          <option value="Padrão">Padrão</option>
          <option value="Premium">Premium</option>
        </select>
        <select className="filter-select" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
          <option value="todos">Mês</option>
          {Array.from({length: 12}, (_, i) => (
            <option key={i+1} value={(i+1).toString()}>{new Date(0, i).toLocaleString('pt-BR', {month: 'short'})}</option>
          ))}
        </select>
        <select className="filter-select" value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)}>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <select className="filter-select bg-blue-50 text-blue-600 border-blue-100" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="ativo">Ativos</option>
          <option value="finalizado">Finalizados</option>
        </select>
      </div>

      {/* CARDS COM FONTE COMPACTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Receita Filtrada" value={`R$ ${stats.faturamento.toFixed(2)}`} icon={<FiDollarSign />} color="bg-purple-600" />
        <StatCard title="Fotos Totais" value={stats.fotos} icon={<FiImage />} color="bg-green-500" />
        <StatCard title="Eventos Ativos" value={stats.eventos} icon={<FiCamera />} color="bg-blue-600" />
        <StatCard title="Uso Cloud" value={`${stats.armazenamento} GB`} icon={<FiDatabase />} color="bg-orange-500" />
      </div>

      {/* GRÁFICOS RESTAURADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-sm h-[350px]">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 flex items-center gap-2 tracking-[0.2em]"><FiTrendingUp /> Tendência de Receita</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData}>
              <defs><linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm h-[350px]">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 flex items-center gap-2 tracking-[0.2em]"><FiPieChart /> Mix de Planos</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stats.planoData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {stats.planoData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABELA: SAÚDE DOS EVENTOS */}
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Saúde dos Eventos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
                <th className="p-6">Evento / Data Criado</th>
                <th className="p-6 text-center">Dias Online</th>
                <th className="p-6">Progresso da Cota</th>
                <th className="p-6 text-right">Plano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dadosFiltrados.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">{ev.clienteNome}</p>
                    <p className="font-black text-slate-800 text-lg italic uppercase tracking-tighter leading-none">{ev.nome}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <FiCalendar size={10} className="text-blue-500" /> Criado em {ev.dataCriacao.toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <FiClock size={12} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                        {ev.diasAtivo} {ev.diasAtivo === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 w-64">
                    <div className="flex justify-between text-[9px] font-black mb-2 text-slate-400 uppercase">
                      <span>{ev.fotos || 0} / {ev.limiteFotos}</span>
                      <span className={ev.porcentagemUso > 90 ? 'text-red-500' : ''}>{ev.porcentagemUso.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${ev.porcentagemUso > 90 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${ev.porcentagemUso}%` }}></div>
                    </div>
                  </td>
                  <td className="p-6 text-right font-black text-[9px] uppercase text-slate-300 tracking-widest">{ev.tipoPlano}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-w-0 transition-transform hover:scale-[1.02]">
      <div className={`${color} w-10 h-10 shrink-0 rounded-xl text-white flex items-center justify-center mb-4 shadow-lg shadow-opacity-20`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">{title}</p>
      <p className="text-2xl font-black text-slate-800 mt-1 whitespace-nowrap leading-none tracking-tighter italic">{value}</p>
    </div>
  );
}