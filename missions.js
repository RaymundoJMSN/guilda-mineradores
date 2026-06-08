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

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pips(nivel) {
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<span class="pip ${i <= nivel ? "pip-on" : "pip-off"}"></span>`;
  }
  return out;
}

function criarCartaz(m, indice) {
  const nivel = Math.min(5, Math.max(1, parseInt(m.perigo, 10) || 1));
  const info = PERIGO_INFO[nivel];
  const concluida = (m.status || "aberta") === "concluida";

  const el = document.createElement("article");
  el.className = `cartaz ${concluida ? "concluida" : ""}`;
  el.style.setProperty("--delay", `${indice * 90}ms`);

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

    ${concluida ? '<div class="carimbo-concluida">CONCLUÍDA</div>' : ""}
  `;
  return el;
}

function renderizar() {
  const quadro = document.getElementById("quadro");
  const contador = document.getElementById("contador");
  if (!quadro) return;

  quadro.innerHTML = "";
  const abertas = MISSOES.filter((m) => (m.status || "aberta") !== "concluida");

  MISSOES.forEach((m, i) => quadro.appendChild(criarCartaz(m, i)));

  if (contador) {
    const n = abertas.length;
    contador.textContent =
      n === 1 ? "1 missão disponível" : `${n} missões disponíveis`;
  }
}

document.addEventListener("DOMContentLoaded", renderizar);
