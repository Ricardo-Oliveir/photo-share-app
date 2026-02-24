// scripts/migrateUsers.js
// Script para migrar usuários antigos do Firebase Auth para o Firestore

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Caminho para a chave de credenciais do Firebase Admin
// Você precisa baixar do Firebase Console: Project Settings > Service Accounts > Generate New Private Key
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Erro: Arquivo de credenciais não encontrado!');
    console.error(`Esperado em: ${path.resolve(serviceAccountPath)}`);
    console.error('\nComo obter:');
    console.error('1. Acesse Firebase Console (https://console.firebase.google.com)');
    console.error('2. Selecione seu projeto (photoshare-app-5e641)');
    console.error('3. Vá em Project Settings > Service Accounts');
    console.error('4. Clique em "Generate New Private Key"');
    console.error('5. Salve o arquivo como "serviceAccountKey.json" na raiz do projeto');
    process.exit(1);
}

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://photoshare-app-5e641.firebaseio.com'
});

const auth = admin.auth();
const db = admin.firestore();

async function migrateUsers() {
    console.log('🚀 Iniciando migração de usuários...\n');

    try {
        // Obter todos os usuários do Firebase Auth
        let allUsers = [];
        let pageToken = undefined;

        console.log('📥 Buscando usuários do Firebase Auth...');

        do {
            const listUsersResult = await auth.listUsers(1000, pageToken);
            allUsers = allUsers.concat(listUsersResult.users);
            pageToken = listUsersResult.pageToken;
        } while (pageToken !== undefined);

        console.log(`✅ Encontrados ${allUsers.length} usuários no Firebase Auth\n`);

        // Verificar quais usuários existem em "usuarios" coleção
        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const user of allUsers) {
            try {
                const userDocRef = db.collection('usuarios').doc(user.uid);
                const userDocSnap = await userDocRef.get();

                if (!userDocSnap.exists()) {
                    // Usuário não existe, criar documento com dados básicos
                    const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';

                    await userDocRef.set({
                        uid: user.uid,
                        email: user.email || '',
                        nome: displayName,
                        role: 'cliente',
                        createdAt: user.metadata.creationTime.toISOString(),
                        photoURL: user.photoURL || null,
                        migrated: true,
                        migratedAt: new Date().toISOString()
                    });

                    console.log(`✅ Criado: ${user.email} (${displayName})`);
                    migratedCount++;
                } else {
                    console.log(`⏭️  Existente: ${user.email}`);
                    skippedCount++;
                }
            } catch (error) {
                console.error(`❌ Erro ao processar ${user.email}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Resumo da Migração:');
        console.log(`   ✅ Criados: ${migratedCount}`);
        console.log(`   ⏭️  Já existentes: ${skippedCount}`);
        console.log(`   ❌ Erros: ${errorCount}`);
        console.log(`   📈 Total: ${allUsers.length}`);

        if (migratedCount > 0) {
            console.log(`\n🎉 Migração concluída com sucesso!`);
        } else {
            console.log(`\nℹ️  Nenhum novo usuário para migrar.`);
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
        process.exit(1);
    } finally {
        await admin.app().delete();
        console.log('\n✅ Conexão fechada');
        process.exit(0);
    }
}

// Executar migração
migrateUsers();
