PhotoShare - App de Upload de Fotos por QR Code
Este é um aplicativo web completo, construído com React e Firebase, que simplifica o compartilhamento de fotos em eventos.

O sistema permite que um Administrador (dono do evento) crie eventos exclusivos. Para cada evento, um Link e um QR Code são gerados. Os Convidados podem então escanear esse QR Code com seus celulares, acessar uma página de upload simples e enviar suas fotos diretamente para o banco de dados do evento.

Funcionalidades Principais
Painel de Administrador: Uma área protegida (/admin) para gerenciar tudo.

Gestão de Eventos: Crie, visualize e gerencie todos os seus eventos.

Geração de Links/QR Code: Cada evento tem um link único (ex: /evento/festa-vicente) e um QR Code correspondente.

Página de Upload do Convidado: Uma interface "mobile-first" otimizada para que os convidados façam upload de suas fotos de forma rápida e sem login.

Integração com Firebase: Os eventos são criados e lidos diretamente do banco de dados Firestore.

Roteamento Completo: O app usa react-router-dom para gerenciar todas as páginas (Pública, Admin, Convidado).

Pilha Tecnológica (Tech Stack)
Front-end: React (Vite)

Estilização: Tailwind CSS

Back-end & Banco de Dados: Firebase (Firestore)

Roteamento: React Router (react-router-dom)

Geração de QR Code: qrcode.react

Gerenciador de Pacotes: Yarn

Guia de Instalação e "Passo a Passo"
Siga estes passos para configurar e rodar o projeto localmente.

Pré-requisitos
Node.js (versão LTS)

Yarn (v1.x)

Uma conta no Firebase

1. Clonar o Repositório
Primeiro, clone este repositório para a sua máquina local:

Bash

git clone https://github.com/Ricardo-Oliveir/photo-share-app.git
cd photo-share-app
2. Instalar as Dependências
Este projeto usa Yarn. É importante usar yarn install (e não npm install) para garantir que as versões corretas dos pacotes sejam instaladas.

Bash

yarn install
3. Configurar o Firebase (O Passo Mais Importante)
O projeto precisa das suas "chaves" (credenciais) do Firebase para se conectar ao banco de dados.

Crie um arquivo na pasta src/ chamado firebase.cjs.

Copie e cole o código de template abaixo dentro do seu firebase.cjs:

JavaScript

// src/firebase.cjs

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ▼▼▼ COLE AQUI O SEU OBJETO 'firebaseConfig' ▼▼▼
// (Você pode pegar isso no Console do Firebase > Configurações do Projeto)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
// ▲▲▲ COLE AQUI O SEU OBJETO 'firebaseConfig' ▲▲▲

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços
export const db = getFirestore(app);
Habilite as Regras do Firestore:

Vá até o seu Console do Firebase > Firestore Database > Regras.

Substitua as regras por este código (para permitir a escrita durante o desenvolvimento) e clique em Publicar:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Permite leitura e escrita por qualquer pessoa (Modo de Teste)
      allow read, write: if true; 
    }
  }
}
4. Rodar o Projeto
Após instalar as dependências e configurar o firebase.cjs, inicie o servidor de desenvolvimento:

Bash

yarn dev
O aplicativo estará disponível em http://localhost:5173/.

Rotas Principais
Landing Page: http://localhost:5173/

Login do Admin: http://localhost:5173/login

Painel do Admin: http://localhost:5173/admin

Exemplo de Página de Upload: http://localhost:5173/evento/teste