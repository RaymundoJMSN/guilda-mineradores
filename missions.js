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
     status      -> "aberta" ou "concluida" (opcional, padrão "aberta")

   Dica: o nível de perigo controla a cor do selo de cera:
     1 = verde   2 = amarelo   3 = laranja   4 = vermelho   5 = negro

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
   ============================================================ */
const AVENTUREIROS = [
  "Behrtio",
  "Lydia Alnari",
  "Mist Yavallan",
  "Valka Calen",
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
const CHAVE_MARCACOES_LOCAL = "guilda_marcacoes";

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

/* Iniciais do aventureiro, para o "crachá" de quem marcou. */
function iniciais(nome) {
  const partes = String(nome).trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

function pips(nivel) {
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<span class="pip ${i <= nivel ? "pip-on" : "pip-off"}"></span>`;
  }
  return out;
}

/* ------------------------------------------------------------
   ARMAZENAMENTO DAS MARCAÇÕES
   Duas implementações com a mesma interface:
     - assinar(callback): recebe o objeto { idMissao: { nome: true } }
     - alternar(idMissao, nome, ligar): marca/desmarca
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
      return JSON.parse(localStorage.getItem(CHAVE_MARCACOES_LOCAL)) || {};
    } catch {
      return {};
    }
  }
  function salvar(dados) {
    localStorage.setItem(CHAVE_MARCACOES_LOCAL, JSON.stringify(dados));
  }
  let ouvinte = null;
  return {
    compartilhado: false,
    assinar(callback) {
      ouvinte = callback;
      callback(ler());
      // sincroniza entre abas do mesmo navegador
      window.addEventListener("storage", (e) => {
        if (e.key === CHAVE_MARCACOES_LOCAL) callback(ler());
      });
    },
    alternar(idMissao, nome, ligar) {
      const dados = ler();
      dados[idMissao] = dados[idMissao] || {};
      if (ligar) dados[idMissao][nome] = true;
      else delete dados[idMissao][nome];
      if (Object.keys(dados[idMissao]).length === 0) delete dados[idMissao];
      salvar(dados);
      if (ouvinte) ouvinte(dados);
    },
  };
}

function criarArmazenamentoFirebase() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  return {
    compartilhado: true,
    assinar(callback) {
      onValue(ref(db, "marcacoes"), (snap) => callback(snap.val() || {}));
    },
    alternar(idMissao, nome, ligar) {
      const alvo = ref(db, `marcacoes/${idMissao}/${nome}`);
      if (ligar) set(alvo, true);
      else remove(alvo);
    },
  };
}

/* ------------------------------------------------------------ */

let usuarioAtual = null;
let armazenamento = null;
let ultimasMarcacoes = {};
const cartoes = []; // { id, indice, el, btn, marcadoresEl }

function criarCartaz(m, indice) {
  const nivel = Math.min(5, Math.max(1, parseInt(m.perigo, 10) || 1));
  const info = PERIGO_INFO[nivel];
  const concluida = (m.status || "aberta") === "concluida";
  const id = idDaMissao(m.titulo);

  const el = document.createElement("article");
  el.className = `cartaz ${concluida ? "concluida" : ""}`;
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

    ${concluida ? '<div class="carimbo-concluida">CONCLUÍDA</div>' : ""}
  `;

  const btn = el.querySelector(".btn-marcar");
  const marcadoresEl = el.querySelector(".marcadores");

  btn.addEventListener("click", () => {
    if (!usuarioAtual || !armazenamento) return;
    const marcados = ultimasMarcacoes[id] || {};
    const jaMarcado = !!marcados[usuarioAtual];
    armazenamento.alternar(id, usuarioAtual, !jaMarcado);
  });

  cartoes.push({ id, indice, el, btn, marcadoresEl });
  return el;
}

/* Atualiza a UI de marcações de cada cartaz e reordena (mais marcados em
   cima). A reordenação usa a propriedade CSS "order" do grid, então não
   recria os cartazes nem reinicia as animações. */
function aplicarMarcacoes(dados) {
  ultimasMarcacoes = dados || {};

  // ordena: mais marcações primeiro; empate mantém a ordem original
  const ranking = cartoes
    .map((c) => ({
      c,
      n: Object.keys(ultimasMarcacoes[c.id] || {}).length,
    }))
    .sort((a, b) => b.n - a.n || a.c.indice - b.c.indice);

  ranking.forEach(({ c, n }, posicao) => {
    c.el.style.order = String(posicao);

    const marcados = Object.keys(ultimasMarcacoes[c.id] || {});
    const euMarquei = usuarioAtual && marcados.includes(usuarioAtual);

    // botão
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
            }" title="${escapeHTML(nome)}">${escapeHTML(
              iniciais(nome)
            )}</span>`
        )
        .join("");
      const rotulo =
        marcados.length === 1 ? "1 interessado" : `${marcados.length} interessados`;
      c.marcadoresEl.innerHTML =
        `<span class="marcadores-contagem">${rotulo}</span>` +
        `<span class="marcadores-chips">${chips}</span>`;
    }

    // destaque para a missão mais marcada (com pelo menos 1)
    c.el.classList.toggle("destaque", n > 0 && posicao === 0);
  });
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
    btn.innerHTML = `<span class="login-iniciais">${escapeHTML(
      iniciais(nome)
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
  atualizarBadgeUsuario();
  document.getElementById("loginOverlay").hidden = true;
  // reaplica para refletir "minhas" marcações no novo usuário
  aplicarMarcacoes(ultimasMarcacoes);
}

function mostrarLogin() {
  document.getElementById("loginOverlay").hidden = false;
}

function atualizarBadgeUsuario() {
  const badge = document.getElementById("usuarioAtual");
  const nomeEl = document.getElementById("usuarioNome");
  if (usuarioAtual) {
    nomeEl.textContent = usuarioAtual;
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
  atualizarBadgeUsuario();
  aplicarMarcacoes(ultimasMarcacoes);
  mostrarLogin();
}

/* ------------------------------------------------------------ */

function inicializar() {
  const quadro = document.getElementById("quadro");
  const contador = document.getElementById("contador");
  if (!quadro) return;

  // renderiza os cartazes uma única vez
  quadro.innerHTML = "";
  MISSOES.forEach((m, i) => quadro.appendChild(criarCartaz(m, i)));

  const abertas = MISSOES.filter(
    (m) => (m.status || "aberta") !== "concluida"
  );
  if (contador) {
    const n = abertas.length;
    contador.textContent =
      n === 1 ? "1 missão disponível" : `${n} missões disponíveis`;
  }

  // login lembrado?
  montarLogin();
  let salvo = null;
  try {
    salvo = localStorage.getItem(CHAVE_USUARIO);
  } catch {}
  if (salvo && AVENTUREIROS.includes(salvo)) {
    usuarioAtual = salvo;
    atualizarBadgeUsuario();
  } else {
    mostrarLogin();
  }
  document
    .getElementById("trocarUsuario")
    .addEventListener("click", trocarUsuario);

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

  armazenamento.assinar(aplicarMarcacoes);
}

/* scripts type="module" já rodam com o DOM pronto */
inicializar();
