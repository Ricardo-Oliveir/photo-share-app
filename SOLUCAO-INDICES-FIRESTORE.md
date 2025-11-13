# ⚠️ Configuração de Índices do Firestore - IMPORTANTE

## Problema: Eventos não aparecem para clientes

Se ao fazer login como cliente você vê "Nenhum evento encontrado" mesmo tendo eventos associados ao seu usuário, provavelmente falta criar um **índice composto** no Firestore.

## 🔍 Como Identificar o Problema

Abra o **Console do Navegador** (F12) e procure por erros como:

```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## ✅ Solução: Criar Índice Composto

### Método 1: Link Automático (Mais Fácil)

1. Faça login como cliente
2. Abra o Console do navegador (F12)
3. Procure pelo erro que menciona "index"
4. Clique no link fornecido pelo Firebase
5. Ele abrirá o Firebase Console já configurado
6. Clique em **"Create Index"**
7. Aguarde alguns minutos (pode demorar 5-10 min)
8. Recarregue a página do app

### Método 2: Manual

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto: `photoshare-app-5e641`
3. Vá em **Firestore Database**
4. Clique na aba **Indexes** (Índices)
5. Clique em **Create Index** (Criar Índice)
6. Configure:
   - **Collection**: `eventos`
   - **Fields to index**:
     - Campo 1: `usuarioId` - **Ascending**
     - Campo 2: `dataCriacao` - **Descending**
   - **Query scope**: Collection
7. Clique em **Create**
8. Aguarde a criação (5-10 minutos)

## 📋 Índices Necessários

### 1. Para Clientes verem seus eventos ordenados

```
Collection: eventos
Fields:
  - usuarioId (Ascending)
  - dataCriacao (Descending)
```

### 2. Para Admin/Fotógrafo verem eventos ativos

```
Collection: eventos
Fields:
  - status (Ascending)
  - dataCriacao (Descending)
```

### 3. Para Clientes verem eventos ativos ordenados

```
Collection: eventos
Fields:
  - status (Ascending)
  - usuarioId (Ascending)
  - dataCriacao (Descending)
```

## 🧪 Como Testar

1. Crie o índice no Firestore
2. Aguarde a mensagem "Index created successfully"
3. No app, faça logout
4. Faça login como cliente novamente
5. O dashboard deve mostrar seus eventos

## 🔍 Verificar no Console

Após fazer login como cliente, verifique o console:

```javascript
// Deve aparecer:
Buscando eventos para cliente: ABC123xyz
Eventos encontrados: 1
Lista de eventos: [{id: "evento-teste", nome: "Evento Teste", ...}]
```

Se aparecer `Eventos encontrados: 0` mas você sabe que tem eventos:

1. Verifique se o `usuarioId` no evento é o mesmo UID do usuário logado
2. Vá no Firestore e compare:
   - Authentication → Users → Copie o UID
   - Firestore → eventos → Verifique se `usuarioId` é igual ao UID

## 🛠️ Debug: Verificar UID vs usuarioId

Execute no Console do navegador (enquanto logado):

```javascript
// Ver UID do usuário logado
console.log('UID Logado:', auth.currentUser.uid);

// Ver eventos no Firestore (substitua pelo ID do evento)
const eventoRef = doc(db, 'eventos', 'SEU_EVENTO_ID');
const eventoDoc = await getDoc(eventoRef);
console.log('usuarioId do evento:', eventoDoc.data().usuarioId);

// Devem ser iguais!
```

## ⚡ Solução Rápida se UID não bater

Se o UID do usuário logado for diferente do `usuarioId` no evento:

1. Vá no Firestore Console
2. Abra o documento do evento
3. Edite o campo `usuarioId`
4. Cole o UID correto do Authentication
5. Salve

## 📝 Resumo

**Problema**: Query com WHERE + ORDER BY precisa de índice  
**Solução**: Criar índice composto no Firestore  
**Tempo**: ~5-10 minutos para criar  
**Permanente**: Índice fica criado e funciona sempre  

## 🎯 Status Esperado

✅ **Funcionando corretamente:**
```
Dashboard → Meus Eventos
┌─────────────────────────────┐
│ Evento Teste Gabriel        │
│ 📅 12/11/2025  📷 0 fotos   │
│ Nenhuma foto neste evento   │
└─────────────────────────────┘
```

❌ **Com problema:**
```
Dashboard → Meus Eventos
Nenhum evento encontrado
Você ainda não possui eventos cadastrados.
```

---

**Última atualização**: 12/11/2025  
**Implementado com logs de debug para facilitar diagnóstico**
