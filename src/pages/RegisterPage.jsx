import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase.js'; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nome,
        email,
        role: "cliente" // Usuários do portal nascem como cliente
      });

      alert("Conta criada!");
      navigate('/admin');
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold">Criar Conta</h2>
        <input className="w-full p-2 border" type="text" placeholder="Nome" onChange={e => setNome(e.target.value)} required />
        <input className="w-full p-2 border" type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} required />
        <input className="w-full p-2 border" type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white p-2 rounded font-bold">REGISTRAR</button>
      </form>
    </div>
  );
}