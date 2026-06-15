# CLAUDE.md

Notas técnicas para manutenção deste projeto. Leia antes de editar.

## O que é

Site **estático** (HTML/CSS/JS puro, sem build) hospedado no **GitHub Pages**
no domínio `guilda.raynathus.com.br` (arquivo `CNAME`). É um quadro de missões
de RPG com tema pergaminho/medieval. Deploy é automático: **todo push na
`main` publica**. Não há etapa de build nem dependências de npm.

## Arquivos

- `index.html` — markup: overlay de login, cabeçalho (brasão SVG + selo do
  usuário + aviso offline), `<main id="quadro">` (cartazes injetados via JS),
  rodapé. Carrega `missions.js` como `<script type="module">`.
- `styles.css` — todo o visual e o responsivo. Variáveis de tema no `:root`.
- `missions.js` — **módulo ES**. Contém os dados (`MISSOES`, `AVENTUREIROS`,
  `ICONES`) no topo e o motor de renderização abaixo. Importa o Firebase por
  CDN (`gstatic`) e a config de `firebase-config.js`.
- `firebase-config.js` — exporta `firebaseConfig`. Único lugar a editar para
  configurar/desligar o Firebase.
- `favicon.svg` — brasão (escudo + 2 picaretas cruzadas) para a aba.

## Como funciona

### Login (local, por dispositivo)
- `AVENTUREIROS` lista os nomes; `MESTRE = "Mestre"` é especial.
- O nome escolhido vai para `localStorage["guilda_usuario"]`. Na carga, se
  houver um nome válido salvo, entra direto; senão mostra o overlay.
- `ehMestre()` = usuário atual é o Mestre. Quando Mestre, o `<body>` ganha a
  classe `modo-mestre` (CSS revela os botões de concluir).

### Estado compartilhado (Firebase Realtime Database)
- Dois ramos: `marcacoes/{idMissao}/{nome} = true` (votos) e
  `concluidas/{idMissao} = true` (missões cumpridas).
- `idDaMissao(titulo)` gera o id (slug sem acento). **Renomear o título muda
  o id** e zera votos/conclusão daquela missão.
- Abstração de storage com duas implementações de mesma interface:
  `criarArmazenamentoFirebase()` e `criarArmazenamentoLocal()` (fallback que
  usa `localStorage["guilda_dados"]` quando não há config válida). Interface:
  `assinar(cb)` → `cb({marcacoes, concluidas})`, `alternarMarcacao(id, nome,
  ligar)`, `concluir(id, ligar)`.
- `configValida()` decide qual usar (checa `databaseURL`). Sem Firebase, mostra
  `#avisoOffline` e nada é compartilhado.

### Renderização
- `criarCartaz()` cria cada cartaz **uma vez** (com a animação de entrada).
- `reaplicar()` é chamado a cada mudança de estado/login e **não recria** os
  cartazes: atualiza textos/crachás, alterna classes (`concluida`, `destaque`,
  botão `ativo`/`reabrir`) e reordena via **CSS `order`** nos itens do grid
  (sem reiniciar animações). Também atualiza o contador.
- Ordem: cumpridas no topo (ordem original) → abertas por nº de votos (desc)
  → empate pela ordem original (`indice`).
- Concluir uma missão: `concluir(id, true)` apaga os votos dela e marca em
  `concluidas`; o CSS esconde a votação (`.cartaz.concluida .cartaz-grupo`) e
  mostra o selo `.carimbo-cumprido` ("Cumprido / Pelos Viajantes Eternos").

## Convenções de estilo

- Texto da UI em **português (pt-BR)**, tom medieval.
- Sem framework, sem dependências. Manter JS em módulo ES e CSS único.
- Cores/tipografia via CSS custom properties no `:root`.
- Ícones de personagem são SVG inline em `ICONES` (usam `currentColor`).

## Cuidados / gotchas

- **Não abrir via `file://`**: módulos ES + import de CDN exigem `http`. Para
  testar local: `python3 -m http.server 8000`.
- **Mobile**: efeitos de `:hover`/expandir ficam atrás de
  `@media (hover: hover) and (pointer: fine) and (min-width: 700px)` porque
  navegadores de celular (Samsung/S-Pen) relatam `hover: hover` por engano.
  No celular as animações de entrada são desligadas e há `overflow-x: hidden`
  para evitar deslocamento horizontal. Preserve isso ao mexer no CSS.
- **Regras do Firebase** precisam liberar **`marcacoes` e `concluidas`**
  (leitura/escrita). Se adicionar um novo ramo no DB, atualize as regras e o
  comentário em `firebase-config.js`.
- Chaves do Firebase para web são públicas (vão no cliente) — não tratar como
  segredo; a proteção é via regras do banco.
- Ao adicionar personagem: incluir em `AVENTUREIROS` e, idealmente, um SVG em
  `ICONES` com a mesma chave (sem ícone, cai nas iniciais).

## Deploy

Commitar e dar push na `main`. O GitHub Pages republica em ~1-2 min.
Favicon e CSS costumam ficar em cache agressivo no navegador — testar com
recarregamento forçado / aba anônima.
