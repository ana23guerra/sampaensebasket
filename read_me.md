# Sampaense Basket — site do clube

## Arquitetura do projeto

```
sampaense-basket/
├── index.html          → estrutura da página (não precisas de editar)
├── css/
│   └── estilo.css       → todo o visual (cores, tipografia, layout)
├── js/
│   ├── dados.js         → TODO O CONTEÚDO do site (é aqui que editas)
│   └── site.js          → lógica que constrói a página a partir dos dados
└── assets/
    ├── logo.jpeg         → o emblema do clube que enviaste
    └── jogadores/         → coloca aqui as fotos reais dos jogadores
```

Separar em ficheiros assim (em vez de um único HTML gigante) tem duas
vantagens: consegues atualizar jogos/plantel/notícias mexendo **só** em
`js/dados.js`, sem tocar em código; e podes alojar isto em qualquer
serviço de hospedagem estática (Netlify, Vercel, GitHub Pages, ou o
alojamento normal do clube) sem qualquer alteração.

## Como publicar

Basta carregar a pasta `sampaense-basket/` inteira para o teu servidor
ou serviço de hospedagem, mantendo a estrutura de subpastas. Não há
nenhum passo de build — é HTML/CSS/JS simples.

## Como atualizar o conteúdo

Abre `js/dados.js` num editor de texto. Cada bloco corresponde a uma
secção do site:

- `clube` → nome, morada, contactos, redes sociais
- `jogos` → adiciona uma linha por jogo (`status: "agendado"` ou
  `"terminado"`)
- `plantel` → um objeto por jogador (`numero`, `nome`, `posicao`, `foto`)
- `galeria` → legendas das fotos (por agora são placeholders visuais)
- `noticias` → título, resumo e texto completo de cada notícia
- `videoDestaque` → o `videoId` do YouTube para o vídeo em destaque
- `socio` → texto de introdução, escalões/preços e email de destino

## Fotos dos jogadores

Não incluí fotografias reais dos jogadores — não tinha acesso a
fotos oficiais e não é apropriado usar fotos de pessoas reais e
identificáveis obtidas sem autorização. O site já está preparado
para as receberes:

1. Coloca cada foto em `assets/jogadores/` (ver `LEIA-ME.txt` nessa pasta).
2. Em `js/dados.js`, escreve o caminho no campo `foto` do jogador
   correspondente, por exemplo `foto: "assets/jogadores/miguel-bastos.jpg"`.
3. Enquanto o campo estiver vazio (`foto: ""`), o cartão do jogador
   mostra um avatar circular com as iniciais, em vez da fotografia.

## Vídeo em destaque

Adicionei uma secção "Vídeo" para um momento divertido/caricato de
um jogo. Para ativá-la, edita `videoDestaque.videoId` em
`js/dados.js` com o ID do vídeo do YouTube (a parte depois de
`v=` no link do vídeo). Enquanto estiver vazio, aparece apenas um
espaço reservado.

## Sócio

A secção "Sócio" tem um formulário simples (nome, email, telefone,
escalão). Como o site não tem servidor próprio, o botão de envio
abre o cliente de email da pessoa com o pedido já preenchido,
destinado ao email que definires em `clube.emailSocios`
(`js/dados.js`). Se preferires um formulário que grave os pedidos
automaticamente numa base de dados, é preciso ligar isto a um
serviço externo (ex.: Google Forms, Formspree, ou um backend
próprio) — diz-me se quiseres ajuda com isso.
Os valores de quotas em `socio.escaloes` são exemplos — substitui
pelos valores reais definidos pela direção.

Depois de editares e guardares, basta recarregar a página no browser.

## O que ainda precisas de confirmar/preencher

Reuni os dados de jogos e do plantel a partir de fontes públicas
(Sofascore, Flashscore, imprensa local) em setembro de 2026, porque os
que estavam no ficheiro original eram inventados. Ainda assim, alguns
pontos não foram possíveis confirmar com 100% de certeza e estão
marcados no próprio site com uma nota:

- **Contactos** (telefone, email, redes sociais) — não encontrei
  fontes públicas fiáveis; os campos ficaram vazios em `dados.js` para
  preencheres com os dados reais do clube.
- **Data do último jogo (particular de pré-época)** — só a data dos jogos
  oficiais da Proliga (jornadas 1 a 4, confirmadas na FPB) é certa; a data
  deste jogo particular foi estimada.
- **Calendário incompleto a partir da jornada 5** — a página de calendário
  da FPB (https://www.fpb.pt/calendario/11441/) carrega os jogos por
  scroll infinito em JavaScript, por isso só consegui obter automaticamente
  as jornadas 1 a 4 (até 24 de outubro de 2026). Para completares o
  calendário: visita o link, rola até ao fim da página para carregares
  mais jornadas, e cola-me o texto que aparecer — ou adiciona tu mesmo
  novas entradas ao array `jogos` em `js/dados.js`, seguindo o mesmo
  formato das que já lá estão.
- **Alguns números de camisola e posições no plantel** — aparecem como
  `"-"` quando não consegui confirmar o valor exato.
- **Fotografias da galeria** — continuam a ser placeholders visuais;
  substitui o bloco `marcador` em `criarFoto()` (js/site.js) por uma
  tag `<img>` quando tiveres fotos reais.

Recomendo validar estes pontos junto do clube antes de publicar
oficialmente.
