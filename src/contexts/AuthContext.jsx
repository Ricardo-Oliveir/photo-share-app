// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.cjs';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 [AUTH] Estado de autenticação mudou');
      console.log('🔐 [AUTH] Usuário autenticado:', user?.email || 'Nenhum');
      setCurrentUser(user);

      if (user) {
        // Buscar detalhes do usuário no Firestore
        try {
          console.log('🔍 [AUTH] Buscando dados do usuário no Firestore...');
          console.log('🔍 [AUTH] UID:', user.uid);
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          console.log('📄 [AUTH] Documento existe?', userDoc.exists());
          
          if (userDoc.exists()) {
            const userData = {
              uid: user.uid,
              ...userDoc.data()
            };
            console.log('✅ [AUTH] Dados do usuário carregados:', userData);
            setUserDetails(userData);
          } else {
            console.warn('⚠️ [AUTH] Documento do usuário NÃO existe no Firestore!');
            console.warn('⚠️ [AUTH] Criando documento de admin automaticamente...');
            
            // Cria automaticamente um usuário admin se não existir
            const newUserData = {
              email: user.email,
              nome: user.email.split('@')[0], // Usa parte do email como nome
              tipo: 'admin',
              ativo: true,
              dataCriacao: new Date()
            };
            
            await setDoc(doc(db, 'usuarios', user.uid), newUserData);
            console.log('✅ [AUTH] Documento de admin criado com sucesso!');
            
            setUserDetails({
              uid: user.uid,
              ...newUserData
            });
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao buscar detalhes do usuário:', error);
          setUserDetails(null);
        }
      } else {
        console.log('🚪 [AUTH] Usuário deslogado');
        setUserDetails(null);
      }

      console.log('✅ [AUTH] Loading finalizado');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDetails,
    loading,
    isAdmin: userDetails?.tipo === 'admin',
    isFotografo: userDetails?.tipo === 'fotografo',
    isCliente: userDetails?.tipo === 'cliente'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
