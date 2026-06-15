# Guilda de Mineradores — Quadro de Missões

Site estático, estilizado em pergaminho medieval sobre madeira de taverna,
para o grupo ver as missões da guilda, **votar nas que querem fazer** e o
**Mestre** marcar as que já foram cumpridas. Funciona em computador e celular.

**Domínio:** `guilda.raynathus.com.br`

---

## ✨ O que o site faz

- **Quadro de missões** em cartazes de pergaminho, com selo de cera por nível
  de perigo (1 a 5), recompensa, solicitante e local.
- **Login simples**: ao abrir, você escolhe quem é. A escolha fica salva no
  navegador (localStorage) — recarregou, ele lembra quem você era. Dá pra
  trocar de personagem pelo selo no topo.
- **Votação compartilhada**: cada pessoa marca as missões que quer fazer
  ("Quero fazer"). Todos veem os interessados de cada missão (crachás com o
  ícone de cada um) **em tempo real**, no PC e no celular.
- **Ordenação por interesse**: missões mais votadas sobem na lista; a mais
  votada ganha uma moldura dourada.
- **Mestre (coroa)**: além de votar, pode **marcar uma missão como cumprida**
  ou **reabrir** uma cumprida. Uma missão cumprida **perde todos os votos**,
  vai para o **topo** e ganha o selo **"Cumprido — Pelos Viajantes Eternos"**.
- **Ícones por personagem** + legenda (nome) ao passar o mouse.
- **Favicon** com o brasão da guilda (escudo + picaretas cruzadas).

### Personagens e ícones

| Personagem | Ícone | Poderes |
|---|---|---|
| Behrtio | caveira | votar |
| Lydia Alnari | alaúde | votar |
| Mist Yavallan | livro | votar |
| Valka Calen | escudo | votar |
| **Mestre** | **coroa** | votar **+ concluir/reabrir missões** |

---

## 📜 Adicionar / editar missões

Abra **`missions.js`** e edite a lista `MISSOES` no topo. Cada missão é:

```js
{
  titulo: "Reforço nas Muralhas",
  solicitante: "Sargento Elias Fletcher",
  local: "Distrito do Carvão, Portão Sul",
  descricao: "Texto da missão aqui...",
  perigo: 2,                 // 1 a 5 — muda a cor do selo
  recompensa: "T$ 50 / pessoa",
},
```

- **Criar**: copie um bloco inteiro (de `{` até `},`) e cole.
- **Remover**: apague o bloco.

> Marcar como **cumprida** é feito **dentro do site, pelo Mestre** — não se
> edita mais aqui. (Cada missão é identificada pelo título; se renomear, os
> votos/conclusão dela recomeçam.)

**Cores do selo por nível de perigo:**

| Nível | Nome | Cor |
|------|----------|----------|
| 1 | Trivial | verde |
| 2 | Moderado | amarelo |
| 3 | Perigoso | laranja |
| 4 | Mortal | vermelho |
| 5 | Lendário | negro |

### Adicionar / remover personagens

Edite a lista `AVENTUREIROS` em `missions.js`. Para dar um ícone novo a
alguém, adicione um SVG no objeto `ICONES` com a mesma chave do nome.

---

## 🔥 Marcação compartilhada (Firebase)

A votação e as conclusões são guardadas no **Firebase Realtime Database**,
para todos verem o mesmo estado. A configuração fica **só** em
**`firebase-config.js`** (já preenchido com o projeto `guilda-de-mineradores`).

- Se `firebase-config.js` não tiver uma config válida, o site cai em
  **modo local** (marcações só no seu aparelho) e mostra um aviso.
- **Regras do banco** (Console do Firebase → Realtime Database → Regras):

  ```json
  {
    "rules": {
      "marcacoes":  { ".read": true, ".write": true },
      "concluidas": { ".read": true, ".write": true }
    }
  }
  ```

  `marcacoes` guarda os votos; `concluidas` guarda as missões cumpridas.
  As chaves de app web do Firebase são públicas por natureza — a segurança
  vem dessas regras.

---

## 🛠️ Testar localmente

> ⚠️ **Não funciona mais com clique duplo (`file://`)**: o site usa módulos
> ES (`<script type="module">`) e importa o Firebase por CDN, o que exige
> `http://`. Use um servidor local:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

---

## 🚀 Publicar no GitHub Pages

1. Suba os arquivos para o repositório (branch `main`).
2. **Settings → Pages** → Source: branch `main`, pasta `/ (root)`.
3. **Custom domain**: `guilda.raynathus.com.br` (o `CNAME` já preenche).
   Marque **Enforce HTTPS** quando ficar verde.

O deploy é automático a cada push na `main`.

### 🌐 DNS no Registro.br

```
Tipo:  CNAME
Nome:  guilda
Valor: SEU-USUARIO.github.io
```

> Propagação do DNS pode levar de minutos a algumas horas.

---

## 📁 Arquivos

| Arquivo | O que é |
|--------------------|------------------------------------------------|
| `index.html` | Estrutura da página (login, cabeçalho, quadro) |
| `styles.css` | Todo o visual (tema pergaminho) e responsivo |
| `missions.js` | Missões, personagens, login e motor (módulo ES) |
| `firebase-config.js` | Configuração do Firebase (compartilhamento) |
| `favicon.svg` | Ícone da aba (brasão da guilda) |
| `CNAME` | Domínio personalizado do GitHub Pages |
| `CLAUDE.md` | Notas técnicas para o assistente / manutenção |
