# Sampaense Basket — site do clube

Site oficial do Sampaense Basket (Proliga), publicado em
**https://www.sampaensebasketclub.pt**.

É um site estático (HTML, CSS e JavaScript) alojado na
Vercel, com algumas funções serverless em `api/` que vão buscar dados e estatísticas dos jogadores em
tempo real à FPB e a sites de notícias.

## O que o site faz

| Página | O que mostra | De onde vêm os dados |
|---|---|---|
| Início | Apresentação do clube e próximo jogo | `js/dados.js` + `/api/jogos` |
| Jogos | Calendário e resultados da época | `/api/jogos`, que lê a página da equipa na FPB |
| MVP do jogo | Votação no melhor jogador do último jogo | `/api/mvp` (Redis) |
| Plantel | Jogadores, ficha individual e médias por jogo | `js/dados.js` + `estatisticas.json` |
| História | Títulos, marcos e figuras do clube | `js/dados.js` |
| Formação | Escalões de formação | `js/dados.js` |
| Galeria / Arquivo | Fotos atuais e históricas do clube | `assets/galeria`, `assets/arquivo` |
| Notícias | Notícias recentes sobre o clube | `/api/noticias` (Google News RSS) |
| Sócio | Formulário de pré-inscrição de sócio | Web3Forms (envio por email) |
| Parceiros / Contactos | Patrocinadores e contactos do clube | `js/dados.js` |

O site está em português e tem um botão para mudar para inglês.

### Jogos
`api/jogos.js` lê a página da equipa na FPB
(`fpb.pt/equipa/equipa_63077`) e devolve o calendário completo, com os
resultados assim que os jogos terminam. A resposta fica em cache na Vercel
durante 15 minutos.

### Notícias
`api/noticias.js` pesquisa no `Google News RSS` notícias sobre o Sampaense em
várias fontes (Diário de Coimbra, Rádio Boa Nova, FPB, Diário As Beiras,
A Bola, Record e Correio da Beira Serra). O site mostra só o título, a data,
a fonte, um resumo e a ligação para o artigo original. A resposta fica em
cache durante 1 hora.

### MVP do jogo
Depois de cada jogo, a votação fica aberta durante 72 horas. Cada pessoa
tem direito a um voto por jogo: o servidor guarda um hash do IP e do browser,
e nunca o IP em si. Os votos ficam numa base de dados Redis ligada ao
projeto na Vercel.

### Estatísticas dos jogadores
As médias por jogo de cada jogador (pontos, ressaltos, assistências,
percentagens, valorização…) estão em `estatisticas.json`. Este ficheiro é
gerado por `api/player_scraping.py`, que faz login na tugabasket e
descarrega a tabela de estatísticas da equipa na competição.

Um GitHub Action (`.github/workflows/atualizar-estatisticas.yml`) atualiza o
ficheiro automaticamente:

- **Ao fim de semana, de hora a hora**, verifica na FPB se terminou um jogo
  novo. Se sim, corre o scraper até as estatísticas aparecerem (no máximo
  3 dias).
- **Todos os dias às 06:45 UTC**, durante os 7 dias seguintes a cada jogo,
  volta a correr o scraper para apanhar eventuais correções feitas às fichas de jogo.
- Só faz commit quando os números mudam. Cada push para `main` faz a Vercel
  publicar o site de novo.

Para forçar uma atualização: separador **Actions** → *Atualizar
estatisticas* → **Run workflow**, com a opção **forcar** ativada.

## Estrutura do projeto

```
├── index.html               estrutura da página
├── css/estilo.css           todo o visual
├── js/
│   ├── dados.js             conteúdo editável (clube, plantel, formação, parceiros…)
│   ├── site.js              constrói as secções a partir dos dados
│   ├── mvp.js               cartão e votação do MVP
│   ├── i18n.js              tradução PT/EN
│   └── paginas.js           navegação entre páginas
├── api/                     funções serverless da Vercel
│   ├── jogos.js             calendário e resultados (FPB)
│   ├── noticias.js          notícias (Google News RSS)
│   ├── mvp.js               votação MVP (Redis)
│   └── player_scraping.py   scraper das estatísticas (corre no GitHub Actions)
├── estatisticas.json        médias por jogo dos jogadores (gerado automaticamente)
├── assets/                  logo, fotos dos jogadores, galeria, arquivo, parceiros
├── .github/                 workflow e script de atualização das estatísticas
└── *.php                    versão antiga das APIs, para alojamento PHP/Apache
```

Os ficheiros `.php` (`jogos.php`, `noticias.php`, `mvp.php`, `socios.php`)
fazem o mesmo que as funções de `api/`, mas para um alojamento tradicional
com PHP. O site na Vercel não os usa.

## Como atualizar o conteúdo

Quase todo o conteúdo fixo está em **`js/dados.js`**:

- `clube`: nome, morada, contactos, redes sociais e chave do Web3Forms
- `plantel`: um objeto por jogador (`numero`, `nome`, `posicao`, `foto`,
  `nacionalidade`, `altura`…). Se o nome na tugabasket for diferente,
  indica-o em `nomeStats` para as estatísticas aparecerem.
- `historia`, `formacao`, `galeria`, `arquivo`, `parceiros`, `socio`:
  textos e imagens das respetivas secções
- `jogos`, `noticias`: dados de reserva, mostrados enquanto as APIs não
  respondem ou se falharem

Fotos de jogadores vão para `assets/jogadores/`. Enquanto um jogador não
tiver `foto`, o cartão mostra um avatar com as iniciais.

Os jogos, as notícias e as estatísticas são atualizados automaticamente e
não precisam de ser editados à mão.

## Configuração

**Vercel** (variáveis de ambiente do projeto):

- `REDIS_URL`: criada automaticamente quando a base de dados Redis é ligada
  ao projeto. É necessária para a votação MVP.

**GitHub** (Settings → Secrets and variables → Actions):

- `BASKETAPI_USER` e `BASKETAPI_PASS`: credenciais da tugabasket usadas
  pelo scraper das estatísticas.

## Desenvolvimento local

Para ver o site com as funções de `api/` a funcionar:

```bash
npm install
npx vercel dev
```

Abrir o `index.html` diretamente também funciona, mas sem jogos, notícias,
MVP nem estatísticas.

Para atualizar as estatísticas manualmente:

```bash
pip install requests pandas beautifulsoup4 lxml python-dotenv
python api/player_scraping.py
```

As credenciais são lidas de `basketapi_user` e `basketapi_pass` num ficheiro
`.env` (na raiz ou em `api/`). Se não existirem, o script pede-as no
terminal. O `.env` está no `.gitignore` e nunca deve ir para o repositório.
