# Guilda de Mineradores — Quadro de Missões

Site estático, estilizado em pergaminho medieval, para seus jogadores verem
as missões disponíveis da guilda. Funciona em computador e celular.

**Domínio:** `guilda.raynathus.com.br`

---

## 📜 Como adicionar / editar missões

Abra o arquivo **`missions.js`** e edite a lista `MISSOES` no topo.
Cada missão é um bloco assim:

```js
{
  titulo: "Reforço nas Muralhas",
  solicitante: "Sargento Elias Fletcher",
  local: "Distrito do Carvão, Portão Sul",
  descricao: "Texto da missão aqui...",
  perigo: 2,                 // 1 a 5 — muda a cor do selo
  recompensa: "T$ 50 / pessoa",
  status: "aberta",          // "aberta" ou "concluida"
},
```

Para **criar** uma missão: copie um bloco inteiro (de `{` até `},`) e cole.
Para **remover**: apague o bloco. Salve, faça commit e o site atualiza sozinho.

**Cores do selo por nível de perigo:**
| Nível | Nome | Cor |
|------|----------|----------|
| 1 | Trivial | verde |
| 2 | Moderado | amarelo |
| 3 | Perigoso | laranja |
| 4 | Mortal | vermelho |
| 5 | Lendário | negro |

Missão com `status: "concluida"` ganha um carimbo "CONCLUÍDA" e sai da contagem.

---

## 🚀 Publicar no GitHub Pages

1. Crie um repositório no GitHub e suba estes arquivos
   (`index.html`, `styles.css`, `missions.js`, `CNAME`).
2. No repositório: **Settings → Pages**.
3. Em **Source**, escolha branch `main` e pasta `/ (root)`. Salve.
4. Em **Custom domain**, confirme `guilda.raynathus.com.br` (o arquivo `CNAME`
   já preenche isso). Marque **Enforce HTTPS** depois que ficar verde.

### 🌐 Apontar o DNS no Registro.br

No painel do `raynathus.com.br`, crie um registro:

```
Tipo:  CNAME
Nome:  guilda
Valor: SEU-USUARIO.github.io
```

> Troque `SEU-USUARIO` pelo seu usuário do GitHub.
> Propagação do DNS pode levar de minutos a algumas horas.

Pronto. Acesse `https://guilda.raynathus.com.br`.

---

## 🛠️ Testar localmente

Abra `index.html` direto no navegador (clique duplo) — já funciona.
Ou rode um servidor simples:

```powershell
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

---

## 📁 Arquivos

| Arquivo | O que é |
|--------------|-----------------------------------------|
| `index.html` | Estrutura da página |
| `styles.css` | Todo o visual (tema pergaminho) |
| `missions.js`| **As missões** — é aqui que você edita |
| `CNAME` | Domínio personalizado do GitHub Pages |
