/* (não precisa mexer) bibliotecas do Firebase, carregadas da CDN do Google */
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

/* ============================================================
   QUADRO DE MISSÕES — Guilda de Aventureiros
   ------------------------------------------------------------
   COMO EDITAR:
   Cada missão é um bloco { ... } dentro da lista MISSOES abaixo.
   Copie um bloco inteiro (de { até },) para criar uma nova.

   Campos:
     titulo      -> nome da missão
     solicitante -> quem pediu
     local       -> onde acontece
     descricao   -> texto livre
     perigo      -> número de 1 a 5 (define a cor do selo)
     recompensa  -> texto livre (ex: "T$ 500", "a definir")

   Dica: o nível de perigo controla a cor do selo de cera:
     1 = verde   2 = amarelo   3 = laranja   4 = vermelho   5 = negro

   OBS: marcar uma missão como "cumprida" é feito DENTRO do site, pelo
   Mestre (login com a coroa) — não precisa editar nada aqui.

   ATENÇÃO: cada missão é identificada pelo seu título para guardar as
   marcações. Se você renomear uma missão, as marcações dela recomeçam.
   ============================================================ */

const MISSOES = [
  {
    titulo: "Amansar Espírito do Gelo",
    solicitante: "Penellope Pendragon",
    local: "Oficina Beluhga, Distrito da Bigorna",
    descricao:
      "Adquiri um cristal elemental das Uivantes, mas parece que o espírito dentro dele ainda está ativo. Preciso de aventureiros bons de briga para cuidar do elemental quando eu abrir o cristal.",
    perigo: 3,
    recompensa: "T$ 200",
    status: "aberta",
  },
  {
    titulo: "Auxílio em Manufatura",
    solicitante: "Goro Okazaki",
    local: "Oficina Kanpeki, Distrito da Forja",
    descricao:
      "Contrato ajudantes para ajudar na forja de espada. Pago bem.",
    perigo: 1,
    recompensa: "T$ 30 / pessoa",
    status: "aberta",
  },
  {
    titulo: "Caçada Exótica",
    solicitante: "Chef Rizzelena",
    local: "Taverna Pombo de Ouro, Distrito da Forja",
    descricao:
      "Procuro aventureiros capazes para perseguir e abater uma iguaria que habita o leito do rio.",
    perigo: 2,
    recompensa: "T$ 120 / peça",
    status: "aberta",
  },
  {
    titulo: "Coleta de Ingredientes",
    solicitante: "Boticário Rafu",
    local: "Poções Promissoras, Distrito da Bigorna",
    descricao:
      "Procuro caçadores de monstros para ajudar na coleta de ingredientes... Perigosos.",
    perigo: 2,
    recompensa: "T$ 100+",
    status: "aberta",
  },
  {
    titulo: "Coleta e Entrega de Encomenda",
    solicitante: "“Sr. P”",
    local: "Normandia",
    descricao:
      "Procuro um grupo de aventureiros destemidos e discretos que possam coletar uma encomenda no porto e levá-la para um ponto específico na cidade. Pago muito bem pelo serviço. Interessados me encontrem em Normandia, estarei todos os dias, ao meio-dia, sentado num dos bancos da praça central vestindo uma boina azul.",
    perigo: 1,
    recompensa: "a definir",
    status: "aberta",
  },
  {
    titulo: "Escolta até Tarrafet",
    solicitante: "Astor Cartografia & Geologia",
    local: "Distrito da Bigorna",
    descricao:
      "Preciso colher amostras de solo na região de Tarrafet, mas o local é infestado de mortos-vivos errantes. Por esse motivo busco contratar uma escolta de aventureiros.",
    perigo: 3,
    recompensa: "T$ 400",
    status: "aberta",
  },
  {
    titulo: "Investigação de Contrabando e Venda de Material Ilegal",
    solicitante: "Guilda dos Mineradores",
    local: "Taverna Fim do Mundo, Distrito da Bigorna",
    descricao:
      "A Guilda recebeu denúncias de que goblins estão vendendo explosivos ilegais na taverna Fim do Mundo. Investiguem o local por pistas que possam levar aos produtos ou aos contrabandistas, e tragam as informações e provas para a Sede da Guarda.",
    perigo: 1,
    recompensa: "T$ 200",
    status: "aberta",
  },
  {
    titulo: "Investigação nas Minas Heldret",
    solicitante: "Mineradora Heldret",
    local: "Minas Heldret",
    descricao:
      "A Mineradora Heldret contrata aventureiros experientes para averiguar uma câmara suspeita encontrada durante as escavações.",
    perigo: 3,
    recompensa: "T$ 500",
    status: "aberta",
  },
  {
    titulo: "Reforço nas Muralhas",
    solicitante: "Sargento Elias Fletcher",
    local: "Distrito do Carvão, Portão Sul",
    descricao:
      "Estamos com problemas para fiscalizar o portão e poucos homens disponíveis. Aceitamos reforço de aventureiros registrados.",
    perigo: 2,
    recompensa: "T$ 50 / pessoa",
    status: "aberta",
  },
];

/* ============================================================
   AVENTUREIROS que podem fazer "login" (escolher quem são).
   Para adicionar/remover alguém, edite esta lista.

   O "Mestre" (MESTRE abaixo) é especial: além de votar, pode marcar
   missões como cumpridas / reabri-las. Tem o símbolo de coroa.
   ============================================================ */
const MESTRE = "Mestre";
const AVENTUREIROS = [
  "Behrtio",
  "Bjorn Stevenson",
  "Lydia Alnari",
  "Mist Yavallan",
  "Valka Calen",
  MESTRE,
];

/* ============================================================
   Daqui pra baixo é o motor de renderização.
   Você NÃO precisa mexer nada abaixo desta linha.
   ============================================================ */

const PERIGO_INFO = {
  1: { nome: "Trivial", classe: "perigo-1" },
  2: { nome: "Moderado", classe: "perigo-2" },
  3: { nome: "Perigoso", classe: "perigo-3" },
  4: { nome: "Mortal", classe: "perigo-4" },
  5: { nome: "Lendário", classe: "perigo-5" },
};

const CHAVE_USUARIO = "guilda_usuario";
const CHAVE_DADOS_LOCAL = "guilda_dados";

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Gera um identificador estável e seguro (para chave do Firebase) a partir
   do título da missão. Remove acentos e caracteres proibidos (. $ # [ ] /). */
function idDaMissao(titulo) {
  return String(titulo)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* Iniciais do aventureiro, usadas como reserva se não houver ícone. */
function iniciais(nome) {
  const partes = String(nome).trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

/* Ícone (brasão) de cada aventureiro. SVGs em "currentColor" para herdar
   a cor do crachá. Para mudar o ícone de alguém, edite o SVG aqui. */
const ICONES = {
  // Behrtio — caveira
  Behrtio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3C8 3 5 6 5 9.8c0 2 .9 3.8 2.3 5 .4.4.7.9.7 1.5V18c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-1.7c0-.6.3-1.1.7-1.5C19.1 13.6 20 11.8 20 9.8 20 6 17 3 12 3z"/><circle cx="9.2" cy="11" r="1.6" fill="currentColor" stroke="none"/><circle cx="14.8" cy="11" r="1.6" fill="currentColor" stroke="none"/><path d="M12 13.2l-.9 1.6h1.8z" fill="currentColor" stroke="none"/><path d="M10 19v-2M14 19v-2M12 19v-2.4"/></svg>`,
  // Bjorn Stevenson — machado e marreta cruzados
  "Bjorn Stevenson": `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><g transform="rotate(-45 12 12)"><rect x="11.25" y="5.5" width="1.5" height="14" rx="0.75"/><path d="M12 2.8 Q16.9 3.2 17.5 8.4 Q14.2 6.6 12 7.4 Q9.8 6.6 6.5 8.4 Q7.1 3.2 12 2.8 Z"/></g><g transform="rotate(45 12 12)"><rect x="11.25" y="5.5" width="1.5" height="14" rx="0.75"/><rect x="8.1" y="3.2" width="7.8" height="3.8" rx="0.9"/></g></svg>`,
  // Lydia Alnari — alaúde
  "Lydia Alnari": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="15.2" r="5.4"/><circle cx="9" cy="15.2" r="1.3"/><path d="M12.9 11.4 18.6 5.7"/><path d="M17.2 3.6 21 7.4l-1.9 1.1-2-2z" fill="currentColor" stroke="none"/></svg>`,
  // Mist Yavallan — livro
  "Mist Yavallan": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3H18a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 18V4.5A1.5 1.5 0 0 1 6.5 3z"/><path d="M5 18a1.5 1.5 0 0 1 1.5-1.5H19"/><path d="M9 7h6M9 10h4"/></svg>`,
  // Valka Calen — escudo de paladino
  "Valka Calen": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 2.4v4.8c0 4.5-3 7.9-7 9.6-4-1.7-7-5.1-7-9.6V5.4z"/><path d="M12 7.2v8.2M8.4 11.2h7.2"/></svg>`,
  // Mestre — coroa
  Mestre: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.5 9.5 8 12.2 12 6.8 16 12.2 19.5 9.5 18 17.2H6z"/><rect x="5.6" y="18.4" width="12.8" height="2.2" rx="1"/><circle cx="4.5" cy="8" r="1.5"/><circle cx="19.5" cy="8" r="1.5"/><circle cx="12" cy="5.2" r="1.7"/></svg>`,
};

/* Devolve o SVG do aventureiro, ou as iniciais se ele não tiver ícone. */
function iconeDe(nome) {
  return ICONES[nome] || escapeHTML(iniciais(nome));
}

/* O usuário atual é o Mestre? (pode concluir/reabrir missões) */
function ehMestre() {
  return usuarioAtual === MESTRE;
}

function pips(nivel) {
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<span class="pip ${i <= nivel ? "pip-on" : "pip-off"}"></span>`;
  }
  return out;
}

/* ------------------------------------------------------------
   ARMAZENAMENTO COMPARTILHADO
   Duas implementações com a mesma interface:
     - assinar(callback): recebe { marcacoes, concluidas }
         marcacoes  = { idMissao: { nome: true } }   (votos)
         concluidas = { idMissao: true }             (missões cumpridas)
     - alternarMarcacao(idMissao, nome, ligar): vota/desvota
     - concluir(idMissao, ligar): marca/desmarca como cumprida
         (ao concluir, os votos da missão são apagados)
   Usa o Firebase se houver configuração válida; senão, modo local.
   ------------------------------------------------------------ */

function configValida() {
  return (
    firebaseConfig &&
    typeof firebaseConfig.databaseURL === "string" &&
    firebaseConfig.databaseURL.startsWith("http") &&
    !firebaseConfig.databaseURL.includes("COLE-AQUI")
  );
}

function criarArmazenamentoLocal() {
  function ler() {
    try {
      const d = JSON.parse(localStorage.getItem(CHAVE_DADOS_LOCAL)) || {};
      return { marcacoes: d.marcacoes || {}, concluidas: d.concluidas || {} };
    } catch {
      return { marcacoes: {}, concluidas: {} };
    }
  }
  function salvar(dados) {
    localStorage.setItem(CHAVE_DADOS_LOCAL, JSON.stringify(dados));
  }
  let ouvinte = null;
  return {
    compartilhado: false,
    assinar(callback) {
      ouvinte = callback;
      callback(ler());
      // sincroniza entre abas do mesmo navegador
      window.addEventListener("storage", (e) => {
        if (e.key === CHAVE_DADOS_LOCAL) callback(ler());
      });
    },
    alternarMarcacao(idMissao, nome, ligar) {
      const dados = ler();
      dados.marcacoes[idMissao] = dados.marcacoes[idMissao] || {};
      if (ligar) dados.marcacoes[idMissao][nome] = true;
      else delete dados.marcacoes[idMissao][nome];
      if (Object.keys(dados.marcacoes[idMissao]).length === 0)
        delete dados.marcacoes[idMissao];
      salvar(dados);
      if (ouvinte) ouvinte(dados);
    },
    concluir(idMissao, ligar) {
      const dados = ler();
      if (ligar) {
        dados.concluidas[idMissao] = true;
        delete dados.marcacoes[idMissao]; // missão cumprida perde os votos
      } else {
        delete dados.concluidas[idMissao];
      }
      salvar(dados);
      if (ouvinte) ouvinte(dados);
    },
  };
}

function criarArmazenamentoFirebase() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const estado = { marcacoes: {}, concluidas: {} };
  let ouvinte = null;
  const notificar = () => ouvinte && ouvinte(estado);
  return {
    compartilhado: true,
    assinar(callback) {
      ouvinte = callback;
      onValue(ref(db, "marcacoes"), (snap) => {
        estado.marcacoes = snap.val() || {};
        notificar();
      });
      onValue(ref(db, "concluidas"), (snap) => {
        estado.concluidas = snap.val() || {};
        notificar();
      });
    },
    alternarMarcacao(idMissao, nome, ligar) {
      const alvo = ref(db, `marcacoes/${idMissao}/${nome}`);
      if (ligar) set(alvo, true);
      else remove(alvo);
    },
    concluir(idMissao, ligar) {
      if (ligar) {
        set(ref(db, `concluidas/${idMissao}`), true);
        remove(ref(db, `marcacoes/${idMissao}`)); // perde os votos
      } else {
        remove(ref(db, `concluidas/${idMissao}`));
      }
    },
  };
}

/* ------------------------------------------------------------ */

let usuarioAtual = null;
let armazenamento = null;
let ultimasMarcacoes = {};
let ultimasConcluidas = {};
const cartoes = []; // { id, indice, el, btn, btnConcluir, marcadoresEl }

function criarCartaz(m, indice) {
  const nivel = Math.min(5, Math.max(1, parseInt(m.perigo, 10) || 1));
  const info = PERIGO_INFO[nivel];
  const id = idDaMissao(m.titulo);

  const el = document.createElement("article");
  el.className = "cartaz";
  el.style.setProperty("--delay", `${indice * 90}ms`);
  el.dataset.id = id;

  el.innerHTML = `
    <div class="furo furo-esq"></div>
    <div class="furo furo-dir"></div>

    <div class="cartaz-topo">
      <span class="bracket">❧</span>
      <h2 class="cartaz-titulo">${escapeHTML(m.titulo)}</h2>
      <span class="bracket flip">❧</span>
    </div>

    <div class="selo ${info.classe}" title="Nível de Perigo ${nivel} — ${info.nome}">
      <span class="selo-num">${nivel}</span>
    </div>

    <dl class="cartaz-meta">
      <div class="meta-linha">
        <dt>Solicitante:</dt>
        <dd>${escapeHTML(m.solicitante)}</dd>
      </div>
      <div class="meta-linha">
        <dt>Local:</dt>
        <dd>${escapeHTML(m.local)}</dd>
      </div>
    </dl>

    <p class="cartaz-descricao">${escapeHTML(m.descricao)}</p>

    <div class="cartaz-rodape">
      <div class="perigo">
        <span class="perigo-rotulo">Perigo</span>
        <span class="pips">${pips(nivel)}</span>
        <span class="perigo-nome">${info.nome}</span>
      </div>
      <div class="recompensa">
        <span class="recompensa-rotulo">Recompensa</span>
        <span class="recompensa-valor">${escapeHTML(m.recompensa)}</span>
      </div>
    </div>

    <div class="cartaz-grupo">
      <button type="button" class="btn-marcar" aria-pressed="false">
        <span class="btn-marcar-icone">⛏</span>
        <span class="btn-marcar-txt">Quero fazer</span>
      </button>
      <div class="marcadores" aria-live="polite"></div>
    </div>

    <div class="cartaz-mestre">
      <button type="button" class="btn-concluir">
        <span class="btn-concluir-txt">Marcar como cumprida</span>
      </button>
    </div>

    <div class="carimbo-cumprido" aria-hidden="true">
      <span class="carimbo-titulo">Cumprido</span>
      <span class="carimbo-sub">Pelos Viajantes Eternos</span>
    </div>
  `;

  const btn = el.querySelector(".btn-marcar");
  const marcadoresEl = el.querySelector(".marcadores");
  const btnConcluir = el.querySelector(".btn-concluir");

  btn.addEventListener("click", () => {
    if (!usuarioAtual || !armazenamento) return;
    const marcados = ultimasMarcacoes[id] || {};
    const jaMarcado = !!marcados[usuarioAtual];
    armazenamento.alternarMarcacao(id, usuarioAtual, !jaMarcado);
  });

  btnConcluir.addEventListener("click", () => {
    if (!ehMestre() || !armazenamento) return;
    const estaConcluida = !!ultimasConcluidas[id];
    armazenamento.concluir(id, !estaConcluida);
  });

  cartoes.push({ id, indice, el, btn, btnConcluir, marcadoresEl });
  return el;
}

/* Atualiza toda a UI a partir do estado atual (votos + cumpridas) e
   reordena. A reordenação usa a propriedade CSS "order" do grid, então
   não recria os cartazes nem reinicia as animações.
   Ordem: missões cumpridas no topo (ordem original); depois as abertas,
   das mais votadas para as menos votadas. */
function reaplicar() {
  const lista = cartoes.map((c) => {
    const concluida = !!ultimasConcluidas[c.id];
    const marcados = concluida
      ? []
      : Object.keys(ultimasMarcacoes[c.id] || {});
    return { c, concluida, marcados, n: marcados.length };
  });

  lista.sort((a, b) => {
    if (a.concluida !== b.concluida) return a.concluida ? -1 : 1;
    if (!a.concluida && b.n !== a.n) return b.n - a.n;
    return a.c.indice - b.c.indice;
  });

  // missão aberta mais votada (para o destaque dourado)
  const topAberta = lista.find((x) => !x.concluida && x.n > 0);

  lista.forEach((item, posicao) => {
    const { c, concluida, marcados } = item;
    c.el.style.order = String(posicao);
    c.el.classList.toggle("concluida", concluida);
    c.el.classList.toggle("destaque", item === topAberta);

    // botão votar
    const euMarquei = usuarioAtual && marcados.includes(usuarioAtual);
    c.btn.classList.toggle("ativo", !!euMarquei);
    c.btn.setAttribute("aria-pressed", euMarquei ? "true" : "false");
    c.btn.querySelector(".btn-marcar-txt").textContent = euMarquei
      ? "Vou nessa!"
      : "Quero fazer";
    c.btn.disabled = !usuarioAtual;

    // crachás de quem marcou
    if (marcados.length === 0) {
      c.marcadoresEl.innerHTML =
        '<span class="marcadores-vazio">Ninguém marcou ainda</span>';
    } else {
      const chips = marcados
        .slice()
        .sort()
        .map(
          (nome) =>
            `<span class="chip ${
              nome === usuarioAtual ? "eu" : ""
            }" data-nome="${escapeHTML(nome)}" aria-label="${escapeHTML(
              nome
            )}">${iconeDe(nome)}</span>`
        )
        .join("");
      const rotulo =
        marcados.length === 1
          ? "1 interessado"
          : `${marcados.length} interessados`;
      c.marcadoresEl.innerHTML =
        `<span class="marcadores-contagem">${rotulo}</span>` +
        `<span class="marcadores-chips">${chips}</span>`;
    }

    // botão do Mestre (concluir / reabrir)
    c.btnConcluir.classList.toggle("reabrir", concluida);
    c.btnConcluir.querySelector(".btn-concluir-txt").textContent = concluida
      ? "Reabrir missão"
      : "Marcar como cumprida";
  });

  // contador de missões ainda abertas
  const contador = document.getElementById("contador");
  if (contador) {
    const abertas = lista.filter((x) => !x.concluida).length;
    contador.textContent =
      abertas === 1 ? "1 missão disponível" : `${abertas} missões disponíveis`;
  }
}

/* ------------------------------------------------------------
   LOGIN (escolha do aventureiro), lembrado no localStorage.
   ------------------------------------------------------------ */

function montarLogin() {
  const lista = document.getElementById("loginLista");
  if (!lista) return;
  lista.innerHTML = "";
  AVENTUREIROS.forEach((nome) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "login-nome";
    btn.innerHTML = `<span class="login-iniciais">${iconeDe(
      nome
    )}</span><span>${escapeHTML(nome)}</span>`;
    btn.addEventListener("click", () => entrar(nome));
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

function entrar(nome) {
  usuarioAtual = nome;
  try {
    localStorage.setItem(CHAVE_USUARIO, nome);
  } catch {}
  document.body.classList.toggle("modo-mestre", ehMestre());
  atualizarBadgeUsuario();
  document.getElementById("loginOverlay").hidden = true;
  reaplicar(); // reflete "minhas" marcações e os poderes do novo usuário
}

function mostrarLogin() {
  document.getElementById("loginOverlay").hidden = false;
}

function atualizarBadgeUsuario() {
  const badge = document.getElementById("usuarioAtual");
  const nomeEl = document.getElementById("usuarioNome");
  if (usuarioAtual) {
    nomeEl.innerHTML = ehMestre()
      ? `<span class="badge-coroa">${iconeDe(MESTRE)}</span>${escapeHTML(
          usuarioAtual
        )}`
      : escapeHTML(usuarioAtual);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function trocarUsuario() {
  usuarioAtual = null;
  try {
    localStorage.removeItem(CHAVE_USUARIO);
  } catch {}
  document.body.classList.remove("modo-mestre");
  atualizarBadgeUsuario();
  reaplicar();
  mostrarLogin();
}

/* ------------------------------------------------------------ */

function inicializar() {
  const quadro = document.getElementById("quadro");
  if (!quadro) return;

  // renderiza os cartazes uma única vez
  quadro.innerHTML = "";
  MISSOES.forEach((m, i) => quadro.appendChild(criarCartaz(m, i)));

  // login lembrado?
  montarLogin();
  let salvo = null;
  try {
    salvo = localStorage.getItem(CHAVE_USUARIO);
  } catch {}
  if (salvo && AVENTUREIROS.includes(salvo)) {
    usuarioAtual = salvo;
    document.body.classList.toggle("modo-mestre", ehMestre());
    atualizarBadgeUsuario();
  } else {
    mostrarLogin();
  }
  document
    .getElementById("trocarUsuario")
    .addEventListener("click", trocarUsuario);

  // primeira pintura (contador/estado) antes de chegar dado remoto
  reaplicar();

  // armazenamento (Firebase ou local) + aviso de modo
  if (configValida()) {
    try {
      armazenamento = criarArmazenamentoFirebase();
    } catch (e) {
      console.error("Falha ao iniciar o Firebase, usando modo local:", e);
      armazenamento = criarArmazenamentoLocal();
    }
  } else {
    armazenamento = criarArmazenamentoLocal();
  }
  if (!armazenamento.compartilhado) {
    document.getElementById("avisoOffline").hidden = false;
  }

  armazenamento.assinar((dados) => {
    ultimasMarcacoes = dados.marcacoes || {};
    ultimasConcluidas = dados.concluidas || {};
    reaplicar();
  });
}

/* scripts type="module" já rodam com o DOM pronto */
inicializar();
