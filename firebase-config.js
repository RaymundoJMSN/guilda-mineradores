/* ============================================================
   CONFIGURAÇÃO DO FIREBASE — projeto "guilda-de-mineradores"
   ------------------------------------------------------------
   Já está preenchido. As chaves de um app web do Firebase são
   públicas por natureza (ficam visíveis no site); a segurança vem
   das REGRAS do Realtime Database, configuradas no console.

   IMPORTANTE — regras de segurança:
   O "modo de teste" expira em ~30 dias. Para não parar de funcionar,
   troque as regras do Realtime Database por estas (Console do Firebase
   > Realtime Database > aba "Regras" > colar > Publicar):

     {
       "rules": {
         "marcacoes": {
           ".read": true,
           ".write": true
         }
       }
     }
   ============================================================ */

export const firebaseConfig = {
  apiKey: "AIzaSyC0V-cI5JJJ0y9PrjwiruJUZk0jDYyZk54",
  authDomain: "guilda-de-mineradores.firebaseapp.com",
  databaseURL: "https://guilda-de-mineradores-default-rtdb.firebaseio.com",
  projectId: "guilda-de-mineradores",
  storageBucket: "guilda-de-mineradores.firebasestorage.app",
  messagingSenderId: "768282042444",
  appId: "1:768282042444:web:bf0100c03c87018654d4e9",
  measurementId: "G-6VEYLXP9F3",
};
