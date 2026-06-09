/* ============================================================
   CONFIGURAÇÃO DO FIREBASE
   ------------------------------------------------------------
   É só ISTO que você precisa preencher para que as marcações de
   missões fiquem COMPARTILHADAS entre todos (PC e celular).

   Enquanto não estiver preenchido, o site funciona em "modo local":
   o login e as marcações ficam salvos só no seu aparelho.

   PASSO A PASSO (leva ~3 minutos, é grátis):

   1. Acesse https://console.firebase.google.com e clique em
      "Adicionar projeto". Dê um nome (ex: guilda-mineradores) e crie.
      (Pode desativar o Google Analytics, não é necessário.)

   2. No menu à esquerda, abra "Build" > "Realtime Database" e clique
      em "Criar banco de dados". Escolha um local e selecione o
      "modo de teste" (test mode) para começar.

   3. Ainda no Realtime Database, vá na aba "Regras" (Rules) e cole:

        {
          "rules": {
            "marcacoes": {
              ".read": true,
              ".write": true
            }
          }
        }

      Clique em "Publicar". (Isso libera leitura/escrita só do quadro
      de marcações — suficiente para um grupo pequeno e privado.)

   4. Volte para a engrenagem ⚙ > "Configurações do projeto". Role até
      "Seus apps" e clique no ícone "</>" (Web) para registrar um app
      web. Dê um apelido e registre.

   5. O Firebase vai mostrar um objeto "firebaseConfig = { ... }".
      Copie os valores e cole abaixo, substituindo os campos.
      IMPORTANTE: o campo "databaseURL" precisa estar presente — se não
      aparecer no exemplo, pegue-o na página do Realtime Database (algo
      como https://SEU-PROJETO-default-rtdb.firebaseio.com).

   6. Salve este arquivo, faça commit/push (ou peça pro Claude) e pronto:
      as marcações passam a ser compartilhadas em tempo real.
   ============================================================ */

export const firebaseConfig = {
  apiKey: "COLE-AQUI",
  authDomain: "COLE-AQUI",
  databaseURL: "COLE-AQUI",
  projectId: "COLE-AQUI",
  storageBucket: "COLE-AQUI",
  messagingSenderId: "COLE-AQUI",
  appId: "COLE-AQUI",
};
