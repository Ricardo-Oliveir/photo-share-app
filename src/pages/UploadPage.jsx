// src/pages/UploadPage.jsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiUploadCloud, FiCamera, FiX, FiCheckCircle } from 'react-icons/fi';

export default function UploadPage() {
  // O useParams lê o ID do evento da URL (ex: /evento/casamento-ana-e-bruno)
  const { idDoEvento } = useParams();
  
  // Transforma o ID em um nome de evento legível (vamos simular por enquanto)
  const nomeDoEvento = idDoEvento.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const [files, setFiles] = useState([]); // Armazena os arquivos selecionados
  const [guestName, setGuestName] = useState(""); // Nome opcional
  const [isSuccess, setIsSuccess] = useState(false); // Controla a tela de sucesso

  // Função chamada quando o usuário seleciona os arquivos
  function handleFileChange(event) {
    const newFiles = Array.from(event.target.files);
    
    // Adiciona os novos arquivos à lista existente
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }

  // Função para remover um arquivo da lista de preview
  function removeFile(indexToRemove) {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  }

  // Função chamada ao clicar em "Enviar"
  function handleSubmit(event) {
    event.preventDefault();
    
    // --- LÓGICA DE UPLOAD PARA O FIREBASE VIRIA AQUI ---
    console.log(`Enviando ${files.length} fotos para o evento: ${idDoEvento}`);
    console.log(`Enviadas por: ${guestName || 'Anônimo'}`);

    // Simula o sucesso do upload
    setIsSuccess(true);
  }

  // Se o upload foi bem-sucedido, mostra a tela de "Obrigado"
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <FiCheckCircle className="text-green-500 w-24 h-24 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Obrigado!</h1>
        <p className="text-lg text-gray-600">
          Suas fotos foram enviadas com sucesso para o evento
          <br />
          <strong className="text-blue-600">{nomeDoEvento}</strong>.
        </p>
        <button 
          onClick={() => {
            setIsSuccess(false);
            setFiles([]);
            setGuestName("");
          }}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
        >
          Enviar mais fotos
        </button>
      </div>
    );
  }

  // Tela principal de Upload
  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Cabeçalho do Evento */}
        <header className="text-center my-8">
          <FiCamera className="text-blue-600 w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            {nomeDoEvento}
          </h1>
          <p className="text-lg text-gray-600">
            Envie suas fotos do evento aqui!
          </p>
        </header>

        {/* Formulário de Upload */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Seu nome (opcional)
            </label>
            <input
              type="text"
              id="name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: Ricardo (Padrinho)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Área de Seleção de Arquivos */}
          <div className="mb-4">
            <label 
              htmlFor="file-upload" 
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100"
            >
              <FiUploadCloud className="w-12 h-12 text-blue-500" />
              <span className="mt-2 text-base font-medium text-gray-700">
                Clique para selecionar as fotos
              </span>
              <span className="text-sm text-gray-500">ou arraste e solte aqui</span>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Previews das Imagens Selecionadas */}
          {files.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Fotos selecionadas ({files.length}):</h3>
              <div className="grid grid-cols-3 gap-2">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)} // Cria um preview local
                      alt={`preview ${file.name}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={files.length === 0} // Desabilita o botão se não houver fotos
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {files.length === 0 ? "Selecione as fotos" : `Enviar ${files.length} Foto(s)`}
          </button>
        </form>
      </div>
    </div>
  );
}