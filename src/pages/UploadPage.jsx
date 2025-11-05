// src/pages/UploadPage.jsx

import React, { useState, useEffect, useRef } from 'react'; // <-- Adicionamos useRef
import { useParams } from 'react-router-dom';
import { FiUploadCloud, FiCamera, FiX, FiCheckCircle, FiLoader } from 'react-icons/fi';

// Imports do Firebase (Firestore e Storage)
import { storage, db } from '../firebase.cjs';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Importamos 'doc' e 'getDoc' para BUSCAR os dados do evento
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";

import { v4 as uuidv4 } from 'uuid'; 

// --- NOVO COMPONENTE: O MODAL DE PREVIEW DA MOLDURA ---
// (Coloquei dentro do mesmo arquivo para facilitar)

/**
 * Este é o Pop-up que funde a foto do usuário com a moldura.
 */
function FramePreviewModal({ originalImage, frameUrl, onCancel, onConfirm }) {
  const canvasRef = useRef(null); // Referência para o <canvas>
  const [mergedImage, setMergedImage] = useState(null); // A imagem final (para o upload)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carrega e funde as imagens
    async function mergeImages() {
      setIsLoading(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // 1. Carregar a foto do convidado
      const userImg = new Image();
      userImg.crossOrigin = "anonymous";
      userImg.src = URL.createObjectURL(originalImage);
      
      await new Promise((resolve) => { userImg.onload = resolve; });

      // 2. Carregar a moldura (do Firebase)
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      frameImg.src = frameUrl;
      
      await new Promise((resolve) => { frameImg.onload = resolve; });

      // 3. Define o tamanho do canvas (ex: 1080x1080)
      //    (Aqui estamos usando o tamanho da moldura como base)
      canvas.width = frameImg.width;
      canvas.height = frameImg.height;

      // 4. Desenha a foto do usuário (esticada para preencher o canvas)
      ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);
      
      // 5. Desenha a moldura POR CIMA da foto do usuário
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

      // 6. Converte o canvas de volta para um arquivo (Blob)
      canvas.toBlob((blob) => {
        // Cria um novo arquivo a partir do "blob"
        const finalFile = new File([blob], `framed_${originalImage.name}`, { type: 'image/jpeg', lastModified: Date.now() });
        setMergedImage(finalFile); // Salva o ARQUIVO final no estado
        setIsLoading(false);
      }, 'image/jpeg', 0.9); // 90% de qualidade
    }

    mergeImages();
    
  }, [originalImage, frameUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pré-visualizar Moldura</h2>
        <p className="text-gray-600 mb-4">É assim que sua foto ficará no evento!</p>
        
        {/* O Canvas fica escondido, ele é só para processamento */}
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        {/* Mostramos uma pré-visualização em <img> */}
        <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
          {isLoading ? (
            <FiLoader className="w-12 h-12 text-blue-600 animate-spin" />
          ) : (
            <img 
              src={canvasRef.current.toDataURL()} 
              alt="Pré-visualização com moldura"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg w-1/2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(mergedImage)} // Envia o ARQUIVO fundido de volta
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg w-1/2"
          >
            Confirmar e Enviar
          </button>
        </div>
      </div>
    </div>
  );
}


// --- PÁGINA DE UPLOAD PRINCIPAL ---

export default function UploadPage() {
  const { idDoEvento } = useParams();
  const [nomeDoEvento, setNomeDoEvento] = useState("...");
  
  // --- NOVOS ESTADOS PARA A MOLDURA ---
  const [eventFrameUrl, setEventFrameUrl] = useState(null); // URL da moldura
  const [photoToPreview, setPhotoToPreview] = useState(null); // A foto que foi para o modal
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  const [files, setFiles] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- NOVO useEffect: BUSCAR OS DADOS DO EVENTO (E A MOLDURA) ---
  useEffect(() => {
    async function fetchEventData() {
      try {
        const eventRef = doc(db, "eventos", idDoEvento);
        const docSnap = await getDoc(eventRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNomeDoEvento(data.nome);
          if (data.frameURL) {
            setEventFrameUrl(data.frameURL); // <-- ENCONTRAMOS UMA MOLDURA!
          }
        } else {
          console.error("Evento não encontrado!");
          alert("Erro: Evento não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar dados do evento:", err);
      } finally {
        setIsLoadingEvent(false);
      }
    }
    fetchEventData();
  }, [idDoEvento]);


  // --- FUNÇÃO handleFileChange ATUALIZADA ---
  function handleFileChange(event) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Se este evento TEM uma moldura...
    if (eventFrameUrl) {
      // ...envia a foto para o modal de preview, em vez de para a lista.
      setPhotoToPreview(selectedFile);
    } else {
      // ...se NÃO tem moldura, funciona como antes (adiciona direto na lista).
      setFiles((prevFiles) => [...prevFiles, selectedFile]);
    }
    
    // Limpa o input para permitir selecionar o mesmo arquivo de novo
    event.target.value = null;
  }

  function removeFile(indexToRemove) {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  }

  // --- NOVA FUNÇÃO (Chamada pelo Modal) ---
  // Quando o usuário clica "Confirmar e Enviar" no modal
  function handleConfirmFrame(mergedFile) {
    setFiles((prevFiles) => [...prevFiles, mergedFile]); // Adiciona a foto JÁ FUNDIDA à lista
    setPhotoToPreview(null); // Fecha o modal
  }
  
  // Função de Submit (sem alteração, ela já envia o que está na 'files')
  async function handleSubmit(event) {
    // ... (o código do handleSubmit é o mesmo que já tínhamos) ...
    event.preventDefault();
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaderName = guestName.trim() === "" ? "Anônimo" : guestName;
      const photosColRef = collection(db, "eventos", idDoEvento, "photos");
      for (const file of files) {
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const storageRef = ref(storage, `eventos/${idDoEvento}/${uniqueFileName}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        await addDoc(photosColRef, {
          downloadURL: downloadURL,
          uploaderName: uploaderName,
          uploadedAt: serverTimestamp(),
          fileName: uniqueFileName,
        });
      }
      const eventoRef = doc(db, "eventos", idDoEvento);
      await updateDoc(eventoRef, {
        fotos: increment(files.length)
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao fazer upload ou atualizar documento: ", error);
      alert("Houve um erro ao enviar suas fotos. Verifique sua conexão e tente novamente.");
    } finally {
      setIsUploading(false);
    }
  }

  // Tela de sucesso (sem alteração)
  if (isSuccess) {
    // ... (código da tela de sucesso) ...
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

  // Se o evento ainda estiver carregando, mostre um spinner
  if (isLoadingEvent) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <FiLoader className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
    );
  }
  
  // Tela de Upload
  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-4">
      {/* --- RENDERIZA O MODAL SE UMA FOTO ESTIVER SENDO PREVISTA --- */}
      {photoToPreview && (
        <FramePreviewModal 
          originalImage={photoToPreview}
          frameUrl={eventFrameUrl}
          onCancel={() => setPhotoToPreview(null)}
          onConfirm={handleConfirmFrame}
        />
      )}

      <div className="w-full max-w-lg mx-auto">
        <header className="text-center my-8">
          <FiCamera className="text-blue-600 w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">{nomeDoEvento}</h1>
          <p className="text-lg text-gray-600">Envie suas fotos do evento aqui!</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 relative">
          
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

          {/* Opção 1: Escolher da Galeria */}
          <div className="mb-4">
            <label 
              htmlFor="file-gallery" 
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100"
            >
              <FiUploadCloud className="w-10 h-10 text-blue-500" />
              <span className="mt-2 text-base font-medium text-gray-700">Escolher da Galeria</span>
              <span className="text-sm text-gray-500">ou arraste e solte (PC)</span>
            </label>
            <input
              id="file-gallery"
              type="file"
              // Removemos 'multiple' - agora é uma foto por vez para aplicar o filtro
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 uppercase text-sm">ou</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Opção 2: Abrir a Câmera */}
          <div className="mb-4">
            <label 
              htmlFor="file-camera" 
              className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg cursor-pointer"
            >
              <FiCamera size={20} />
              <span>Tirar Foto Agora</span>
            </label>
            <input
              id="file-camera"
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Previews (agora mostram as fotos JÁ COM MOLDURA) */}
          {files.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Fotos prontas para enviar ({files.length}):</h3>
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