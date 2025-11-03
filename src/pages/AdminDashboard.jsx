// src/pages/AdminDashboard.jsx

import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard do Administrador</h1>

      {/* Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total de Eventos Ativos" value="12" />
        <KpiCard title="Total de Clientes" value="45" />
        <KpiCard title="Total de Fotos" value="8,730" />
        <KpiCard title="Espaço Usado (GB)" value="74.5 GB" />
      </div>

      {/* Listas de Atividade Recente */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
        <ul>
          <li className="border-b py-2 text-gray-600">
            +15 fotos em "Casamento Ana & Bruno"
          </li>
          <li className="border-b py-2 text-gray-600">
            Novo evento criado: "Confraternização ACME"
          </li>
          <li className="border-b py-2 text-gray-600">
            +5 fotos em "Aniversário 15 anos"
          </li>
        </ul>
      </div>
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}