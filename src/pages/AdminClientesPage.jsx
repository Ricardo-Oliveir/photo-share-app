// src/pages/AdminClientesPage.jsx

import React from 'react';
import { FiPlus } from 'react-icons/fi';

// Dados simulados
const clientesSimulados = [
  { id: 1, nome: 'Ana e Bruno (Noivos)', email: 'ana.bruno@email.com', eventos: 1 },
  { id: 2, nome: 'Empresa ACME', email: 'contato@acme.com', eventos: 1 },
  { id: 3, nome: 'Família Silva (15 Anos)', email: 'familia.silva@email.com', eventos: 1 },
];

export default function AdminClientesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Clientes</h1>
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
        >
          <FiPlus />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Lista/Tabela de Clientes */}
      <div className="bg-white rounded-lg shadow-lg">
        <table className="w-full table-auto">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Nome do Cliente</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Email</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Eventos</th>
            </tr>
          </thead>
          <tbody>
            {clientesSimulados.map((cliente) => (
              <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-gray-800 font-medium">{cliente.nome}</td>
                <td className="p-4 text-gray-600">{cliente.email}</td>
                <td className="p-4 text-gray-600">{cliente.eventos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}