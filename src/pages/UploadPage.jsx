// src/pages/UploadPage.jsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiUploadCloud, FiCamera, FiX, FiCheckCircle, FiLoader } from 'react-icons/fi';

// --- IMPORTS DO FIREBASE ATUALIZADOS ---
import { storage, db } from '../firebase.cjs';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Precisamos de 'collection' e 'addDoc' para criar o novo doc da foto
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";

import { v4 as uuidv4 } from 'uuid'; 

export default function UploadPage() {
  const { idDoEvento } = useParams();
  const nomeDoEvento = idDoEvento.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const [files, setFiles] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleFileChange(event) {
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }

  function removeFile(indexToRemove) {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  }

  // --- FUNÇÃO DE SUBMIT TOTALMENTE REFEITA ---
  async function handleSubmit(event) {
    event.preventDefault();
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Pega o nome do convidado (ou "Anônimo")
      const uploaderName = guestName.trim() === "" ? "Anônimo" : guestName;

      // 1. Cria uma referência para a SUBCOLEÇÃO de fotos
      // Ex: eventos/festa-vicente/photos
      const photosColRef = collection(db, "eventos", idDoEvento, "photos");

      // 2. Loop para cada arquivo
      // Usamos um loop 'for...of' para garantir que esperamos cada etapa (upload > getURL > saveDoc)
      for (const file of files) {
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        
        // 2a. Referência no Storage
        const storageRef = ref(storage, `eventos/${idDoEvento}/${uniqueFileName}`);
        
        // 2b. Faz o upload da foto
        const uploadResult = await uploadBytes(storageRef, file);
        
        // 2c. Pega a URL de download da foto que acabamos de enviar
        const downloadURL = await getDownloadURL(uploadResult.ref);
        
        // 2d. Salva as informações (URL e Nome) no Firestore
        await addDoc(photosColRef, {
          downloadURL: downloadURL,
          uploaderName: uploaderName,
          uploadedAt: serverTimestamp(), // Data/Hora do envio
          fileName: uniqueFileName, // Nome do arquivo no storage
        });
      }

      console.log(`Todos os ${files.length} arquivos foram salvos no Storage e Firestore.`);

      // 3. Atualiza o contador de fotos no documento PRINCIPAL do evento
      const eventoRef = doc(db, "eventos", idDoEvento);
      await updateDoc(eventoRef, {
        fotos: increment(files.length) // Adiciona +X ao contador
      });

      console.log("Contador do evento atualizado!");
      setIsSuccess(true); // Mostra a tela de sucesso

    } catch (error) {
      console.error("Erro ao fazer upload ou atualizar documento: ", error);
      alert("Houve um erro ao enviar suas fotos. Verifique sua conexão e tente novamente.");
    } finally {
      setIsUploading(false); // Termina o upload
    }
  }

  // --- TELA DE SUCESSO ---
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

  // --- TELA DE UPLOAD (SEM MUDANÇAS, SÓ O SPINNER DE LOADING) ---
  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg mx-auto">
        <header className="text-center my-8">
          <FiCamera className="text-blue-600 w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">{nomeDoEvento}</h1>
          <p className="text-lg text-gray-600">Envie suas fotos do evento aqui!</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 relative">
          
          {/* TELA DE LOADING (SOBREPÕE O FORMULÁRIO) */}
          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-xl z-10">
              <FiLoader className="w-16 h-16 text-blue-600 animate-spin" />
              <span className="text-lg font-medium text-gray-700 mt-4">Enviando...</span>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Seu nome (opcional)
            </label>
            <input
              type="text" id="name" value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: Ricardo (Padrinho)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label 
              htmlFor="file-upload" 
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100"
            >
              <FiUploadCloud className="w-12 h-12 text-blue-500" />
              <span className="mt-2 text-base font-medium text-gray-700">Clique para selecionar as fotos</span>
              <span className="text-sm text-gray-500">ou arraste e solte aqui</span>
            </label>
            <input
              id="file-upload" type="file" multiple accept="image/*"
              className="hidden" onChange={handleFileChange}
            />
          </div>

          {/* Previews */}
          {files.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Fotos selecionadas ({files.length}):</h3>
              <div className="grid grid-cols-3 gap-2">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)} 
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
            disabled={files.length === 0 || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Enviando..." : (files.length === 0 ? "Selecione as fotos" : `Enviar ${files.length} Foto(s)`)}
          </button>
        </form>
      </div>
    </div>
  );
}