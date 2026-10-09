/* ======================================================================
   Código de apresentação — normalmente não precisas de editar este
   ficheiro. Para atualizar conteúdo, edita js/dados.js.
   ====================================================================== */

const $ = (id) => document.getElementById(id);
const fmtData = (iso) => new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }).replace('.', '');
const fmtDataLonga = (iso) => new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
const iniciais = (nome) => nome.split(' ').map(p => p[0]).slice(0, 2).join('');

// ---- Cabeçalho / rodapé ----
$('rodape-nome').textContent = DADOS.clube.nome + ' · ' + DADOS.clube.localidade;
$('rodape-ano').textContent = '© ' + new Date().getFullYear();
$('contacto-morada').textContent = DADOS.clube.morada;
if (DADOS.clube.telefone) {
  $('contacto-telefone').textContent = DADOS.clube.telefone;
  $('contacto-telefone').href = 'tel:' + DADOS.clube.telefone.replace(/\s/g, '');
  $('linha-telefone').style.display = 'flex';
}
if (DADOS.clube.email) {
  $('contacto-email').textContent = DADOS.clube.email;
  $('contacto-email').href = 'mailto:' + DADOS.clube.email;
  $('linha-email').style.display = 'flex';
}
let redesHtml = '';
if (DADOS.clube.instagram) {
  redesHtml += `<a href="${DADOS.clube.instagram}" target="_blank" rel="noopener" aria-label="Instagram">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>`;
}
if (DADOS.clube.facebook) {
  redesHtml += `<a href="${DADOS.clube.facebook}" target="_blank" rel="noopener" aria-label="Facebook">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/></svg></a>`;
}
$('redes-sociais').innerHTML = redesHtml;

// ---- Jogos (agora com dados combinados: dados.js + FPB) ----

let jogosAtuais = Array.isArray(DADOS.jogos) ? [...DADOS.jogos] : [];
let abaJogosAtiva = 'proximos';
const LIMITE_JOGOS_VISIVEIS = 4;
let intervaloContagem;

function jogosOrdenados() {
  return {
    proximos: jogosAtuais
      .filter(j => j.status === 'agendado')
      .sort((a, b) => new Date(a.data) - new Date(b.data)),
    terminados: jogosAtuais
      .filter(j => j.status === 'terminado')
      .sort((a, b) => new Date(b.data) - new Date(a.data))
  };
}

function renderizarProximoJogo() {
  const { proximos } = jogosOrdenados();
  const proximoJogo = proximos[0];

  if (intervaloContagem) clearInterval(intervaloContagem);

  if (!proximoJogo) {
    const placar = $('placar');
    if (placar) placar.style.display = 'none';
    return;
  }

  const placar = $('placar');
  if (placar) placar.style.display = '';

  $('escudo-sampaense').innerHTML = `<img src="assets/logo.png" alt="">`;
  $('placar-competicao').textContent = proximoJogo.competicao;
  $('nome-adversario').textContent = proximoJogo.adversario;
  $('escudo-adversario').textContent = iniciais(proximoJogo.adversario);
  $('info-data').textContent = fmtDataLonga(proximoJogo.data);
  $('info-hora').textContent = fmtHora(proximoJogo.data) + 'h';
  $('info-local').textContent = proximoJogo.casa ? 'Casa' : 'Fora';
  $('info-pavilhao').textContent = proximoJogo.casa ? 'Serafim Marques' : (proximoJogo.local || 'Por confirmar');

  const alvo = new Date(proximoJogo.data).getTime();
  const atualizarContagem = () => {
    const diff = Math.max(0, alvo - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;
    $('contagem').innerHTML = [[d, 'DIAS'], [h, 'HORAS'], [m, 'MIN'], [s, 'SEG']]
      .map(([v, l]) => `<div class="bloco"><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
    if (diff <= 0) clearInterval(intervaloContagem);
  };
  atualizarContagem();
  intervaloContagem = setInterval(atualizarContagem, 1000);
}

function renderizarForma() {
  const { terminados } = jogosOrdenados();
  const ultimos = terminados.slice(0, 5);

  $('forma-pilulas').innerHTML = ultimos.reverse().map(j => {
    const pontosSamp = j.casa ? j.pontosCasa : j.pontosFora;
    const pontosAdv = j.casa ? j.pontosFora : j.pontosCasa;
    const venceu = pontosSamp > pontosAdv;
    return `<div class="pilula ${venceu ? 'V' : 'D'}" title="${j.adversario}: ${j.pontosCasa}-${j.pontosFora}">${venceu ? 'V' : 'D'}</div>`;
  }).join('');
}

function criarLinhaJogo(j) {
  const pontosSamp = j.status === 'terminado' ? (j.casa ? j.pontosCasa : j.pontosFora) : null;
  const pontosAdv = j.status === 'terminado' ? (j.casa ? j.pontosFora : j.pontosCasa) : null;
  const venceu = pontosSamp !== null && pontosSamp > pontosAdv;
  const resultadoHtml = j.status === 'terminado'
    ? `<span class="jogo-resultado ${venceu ? 'vitoria' : ''}">${j.pontosCasa} – ${j.pontosFora}</span>`
    : `<span class="jogo-resultado" style="color:var(--texto-suave); font-size:15px;">${fmtHora(j.data)}h</span>`;
  return `
    <div class="jogo-linha">
      <div class="jogo-data"><b>${fmtData(j.data)}</b><span>${new Date(j.data).getFullYear()}</span></div>
      <div>
        <div class="jogo-equipas">
          <span>${j.casa ? 'Sampaense Basket' : j.adversario}</span>
          <span style="color:var(--texto-suave); font-weight:500;">vs</span>
          <span>${j.casa ? j.adversario : 'Sampaense Basket'}</span>
          <span class="tag">${j.competicao}</span>
        </div>
      </div>
      <div style="text-align:right;">
        ${resultadoHtml}
        <div class="jogo-local">${j.casa ? 'Em casa' : 'Fora'}</div>
      </div>
    </div>`;
}

function renderizarListaJogos() {
  const { proximos, terminados } = jogosOrdenados();
  const jogosFiltrados = abaJogosAtiva === 'proximos' ? proximos : terminados;
  const pista = $('lista-jogos');

  // Prepara o carrossel (só uma vez): pista + controlos por baixo
  if (!pista.parentElement.classList.contains('carrossel-jogos-caixa')) montarCarrosselJogos(pista);
  pista.className = 'carrossel-pista carrossel-jogos';

  if (!jogosFiltrados.length) {
    pista.innerHTML = '<p style="color:var(--texto-suave);">Sem jogos para mostrar.</p>';
  } else {
    // Cada "página" tem 4 jogos; arrasta para o lado para ver as seguintes
    let html = '';
    for (let i = 0; i < jogosFiltrados.length; i += LIMITE_JOGOS_VISIVEIS) {
      html += `<div class="jogos-pagina">${jogosFiltrados.slice(i, i + LIMITE_JOGOS_VISIVEIS).map(criarLinhaJogo).join('')}</div>`;
    }
    pista.innerHTML = html;
  }
  pista.scrollLeft = 0;
  if (pista._atualizarControlos) pista._atualizarControlos();
}

function montarCarrosselJogos(pista) {
  const caixa = document.createElement('div');
  caixa.className = 'carrossel-jogos-caixa';
  pista.parentElement.insertBefore(caixa, pista);

  const controlos = document.createElement('div');
  controlos.className = 'jogos-nav';
  const anterior = document.createElement('button');
  anterior.type = 'button';
  anterior.className = 'jogos-seta';
  anterior.setAttribute('aria-label', 'Jogos anteriores');
  anterior.innerHTML = '&#10094;';
  const contador = document.createElement('span');
  contador.className = 'jogos-contador';
  const seguinte = document.createElement('button');
  seguinte.type = 'button';
  seguinte.className = 'jogos-seta';
  seguinte.setAttribute('aria-label', 'Jogos seguintes');
  seguinte.innerHTML = '&#10095;';
  controlos.append(anterior, contador, seguinte);
  caixa.append(pista, controlos);

  const passo = () => pista.clientWidth;
  anterior.addEventListener('click', () => pista.scrollBy({ left: -passo(), behavior: 'smooth' }));
  seguinte.addEventListener('click', () => pista.scrollBy({ left: passo(), behavior: 'smooth' }));

  const atualizar = () => {
    const paginas = pista.querySelectorAll('.jogos-pagina').length;
    const atual = Math.min(paginas, Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth)) + 1);
    const max = pista.scrollWidth - pista.clientWidth - 2;
    controlos.style.display = paginas > 1 ? '' : 'none';
    contador.textContent = atual + ' / ' + paginas;
    anterior.disabled = pista.scrollLeft <= 2;
    seguinte.disabled = pista.scrollLeft >= max;
  };
  pista._atualizarControlos = atualizar;
  pista.addEventListener('scroll', atualizar, { passive: true });
  window.addEventListener('resize', atualizar);

  // Arrastar com o rato (no telemóvel o arrastar já funciona sozinho)
  let aArrastar = false, inicioX = 0, inicioScroll = 0;
  pista.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    aArrastar = true;
    inicioX = e.clientX; inicioScroll = pista.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!aArrastar) return;
    const dx = e.clientX - inicioX;
    if (Math.abs(dx) > 5) pista.classList.add('a-arrastar');
    pista.scrollLeft = inicioScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!aArrastar) return;
    aArrastar = false;
    pista.classList.remove('a-arrastar');
  });
  pista.addEventListener('dragstart', (e) => e.preventDefault());
}

function renderizarJogos() {
  renderizarProximoJogo();
  renderizarForma();
  renderizarListaJogos();
}

function mudarAba(qual, botao) {
  document.querySelectorAll('.abas button').forEach(b => b.classList.remove('ativa'));
  botao.classList.add('ativa');
  abaJogosAtiva = qual;
  renderizarListaJogos();
}

// Primeira apresentação, já com o que está no dados.js
renderizarJogos();

// ------------------------------------------------------------
// Buscar jogos/resultados à FPB e juntar aos do dados.js
// ------------------------------------------------------------

async function atualizarJogosFPB() {
  try {
    const resposta = await fetch('/api/jogos', {
      cache: 'no-store'
    });

    if (!resposta.ok) {
      throw new Error('Erro HTTP ' + resposta.status);
    }

    const dados = await resposta.json();

    if (!dados.sucesso || !Array.isArray(dados.jogos)) {
      throw new Error(dados.erro || 'Sem jogos da FPB');
    }

    // Identifica cada jogo pela data, adversário e condição
    // de jogar em casa ou fora, em vez de usar apenas a data.
    function chaveJogo(j) {
      const dia = (j.data || '').slice(0, 10);
      const adversario = (j.adversario || '')
        .trim()
        .toLowerCase();

      return `${dia}|${adversario}|${Boolean(j.casa)}`;
    }

    const porJogo = new Map();

    // Começa com os jogos existentes no site.
    jogosAtuais.forEach(j => {
      porJogo.set(chaveJogo(j), j);
    });

    // Atualiza com os dados da FPB.
    dados.jogos.forEach(j => {
      if (!j.data || !j.adversario) return;

      const chave = chaveJogo(j);
      const existente = porJogo.get(chave);

      // Se a FPB ainda não tem resultado, preserva um resultado
      // final introduzido manualmente.
      if (
        existente &&
        existente.status === 'terminado' &&
        j.status !== 'terminado'
      ) {
        return;
      }

      // A FPB passa a ter prioridade quando disponibiliza
      // o resultado final do jogo.
      porJogo.set(chave, {
        ...existente,
        ...j
      });
    });

    jogosAtuais = Array.from(porJogo.values());

    renderizarJogos();

    console.info(
      'Jogos atualizados com sucesso:',
      dados.jogos.length,
      'jogos recebidos da FPB.'
    );

  } catch (erro) {
    console.error('Erro ao atualizar jogos da FPB:', erro);
  }
}

atualizarJogosFPB();

// Atualizar automaticamente a cada 20 minutos
setInterval(atualizarJogosFPB, 20 * 60 * 1000);

// ---- Plantel ----
const DADO_VAZIO = '<span class="vazio">Por confirmar</span>';

function criarAvatarJogador(j, classeExtra = '') {
  if (j.foto) {
    return `<img class="avatar ${classeExtra} avatar-foto" src="${j.foto}" alt="${escaparHTML(j.nome)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;avatar ${classeExtra}&quot;>${iniciais(j.nome)}</div>'">`;
  }
  return `<div class="avatar ${classeExtra}">${iniciais(j.nome)}</div>`;
}

function criarCartaoJogador(j, i) {
  return `
    <div class="jogador" tabindex="0" role="button" onclick="abrirJogador(${i})" onkeydown="if(event.key==='Enter')abrirJogador(${i})">
      <div class="numero">${j.numero || '-'}</div>
      ${criarAvatarJogador(j)}
      <h3>${escaparHTML(j.nome)}${j.capitao ? ' (C)' : ''}</h3>
      <div class="posicao">${escaparHTML(j.posicao || '')}</div>
      <div class="ver-ficha">Ver ficha →</div>
    </div>`;
}

function renderizarPlantel(posicaoAtual = 'Todos') {
  const jogadores = posicaoAtual === 'Todos'
    ? DADOS.plantel
    : DADOS.plantel.filter(j => j.posicao === posicaoAtual);
  $('lista-plantel').innerHTML = jogadores.length
    ? jogadores.map((j) => criarCartaoJogador(j, DADOS.plantel.indexOf(j))).join('')
    : '<p style="color:var(--texto-suave);">Sem jogadores para mostrar.</p>';
}

function montarFiltroPosicoes() {
  const posicoes = ['Todos', ...new Set(DADOS.plantel.map(j => j.posicao).filter(Boolean))];
  $('filtro-posicao').innerHTML = posicoes.map((p, i) =>
    `<button class="${i === 0 ? 'ativa' : ''}" onclick="filtrarPlantel('${p}', this)">${p}</button>`
  ).join('');
}

function filtrarPlantel(posicao, botao) {
  document.querySelectorAll('#filtro-posicao button').forEach(b => b.classList.remove('ativa'));
  botao.classList.add('ativa');
  renderizarPlantel(posicao);
}

if (DADOS.plantel && DADOS.plantel.length) {
  montarFiltroPosicoes();
  renderizarPlantel();
}

function abrirJogador(i) {
  const j = DADOS.plantel[i];
  if (!j) return;

  $('modal-jogador-avatar').innerHTML = criarAvatarJogador(j, 'avatar-grande');
  $('modal-jogador-numero').textContent = j.numero || '-';
  $('modal-jogador-nome').textContent = j.nome + (j.capitao ? ' (Capitão)' : '');
  $('modal-jogador-posicao').textContent = j.posicao || '';

  const campos = [
    ['Nacionalidade', j.nacionalidade],
    ['Naturalidade', j.origem],
    ['Último clube', j.ultimoClube],
    ['Altura', j.altura]
  ];
  $('modal-jogador-dados').innerHTML = campos.map(([rotulo, valor]) => `
    <div><b>${rotulo}</b>${valor ? `<span>${escaparHTML(valor)}</span>` : DADO_VAZIO}</div>
  `).join('');

  $('modal-jogador').classList.add('aberto');
}

function fecharJogador() {
  $('modal-jogador').classList.remove('aberto');
}

// ---- Galeria / Arquivo ----
function criarFoto(f, i, lista = 'galeria') {
  const imagem = f.foto
    ? `<img src="${f.foto}" alt="${lista === 'arquivo' ? 'Foto do arquivo' : f.legenda}" loading="lazy"
         onerror="this.outerHTML='<div class=&quot;marcador&quot;>Imagem indisponível</div>'">`
    : `
      <div class="marcador">
        <svg viewBox="0 0 100 100" fill="none" stroke="#FFC222" stroke-width="3">
          <circle cx="50" cy="50" r="42"/>
          <path d="M8 50h84M50 8v84M20 20c15 15 15 45 0 60M80 20c-15 15-15 45 0 60"
                stroke-linecap="round"/>
        </svg>
      </div>
    `;

  return `
    <figure class="foto" onclick="abrirLightbox(${i}, '${lista}')">
      ${imagem}
      ${lista === 'arquivo' ? '' : `<figcaption>${f.legenda}</figcaption>`}
    </figure>`;
}
// ---- Galeria ----

const FOTOS_INICIAIS = 8;
const FOTOS_POR_CARREGAMENTO = 8;

let fotosVisiveis = FOTOS_INICIAIS;

function renderizarGaleria() {
  const fotos = DADOS.galeria.slice(0, fotosVisiveis);

  $('lista-galeria').innerHTML = fotos
    .map((f, i) => criarFoto(f, i, 'galeria'))
    .join('');

  const botao = $('btn-ver-mais');

  if (fotosVisiveis >= DADOS.galeria.length) {
    botao.style.display = 'none';
  } else {
    botao.style.display = 'inline-flex';
    botao.textContent = 'VER MAIS';
  }
}

$('btn-ver-mais').addEventListener('click', () => {
  fotosVisiveis += FOTOS_POR_CARREGAMENTO;
  renderizarGaleria();
});

renderizarGaleria();

// ---- Arquivo (fotos antigas) — carrossel ----

function renderizarArquivo() {
  const pista = $('lista-arquivo');
  const botao = $('btn-ver-mais-arquivo');
  if (!pista || !Array.isArray(DADOS.arquivo)) return;

  // O botão "Ver mais fotos" já não faz falta
  if (botao && botao.parentElement) botao.parentElement.style.display = 'none';

  if (!DADOS.arquivo.length) {
    pista.innerHTML = '<p style="color:var(--texto-suave);">Ainda não há fotos no arquivo.</p>';
    return;
  }

  pista.className = 'carrossel-pista';
  pista.innerHTML = DADOS.arquivo.map((f, i) => criarFoto(f, i, 'arquivo')).join('');

  // Montar setas à volta da pista (só uma vez)
  if (!pista.parentElement.classList.contains('carrossel')) {
    const caixa = document.createElement('div');
    caixa.className = 'carrossel';
    pista.parentElement.insertBefore(caixa, pista);

    const anterior = document.createElement('button');
    anterior.type = 'button';
    anterior.className = 'carrossel-seta anterior';
    anterior.setAttribute('aria-label', 'Fotos anteriores');
    anterior.innerHTML = '&#10094;';

    const seguinte = document.createElement('button');
    seguinte.type = 'button';
    seguinte.className = 'carrossel-seta seguinte';
    seguinte.setAttribute('aria-label', 'Fotos seguintes');
    seguinte.innerHTML = '&#10095;';

    caixa.append(anterior, pista, seguinte);

    const passo = () => pista.clientWidth * 0.9;
    anterior.addEventListener('click', () => pista.scrollBy({ left: -passo(), behavior: 'smooth' }));
    seguinte.addEventListener('click', () => pista.scrollBy({ left: passo(), behavior: 'smooth' }));

    const atualizarSetas = () => {
      const max = pista.scrollWidth - pista.clientWidth - 2;
      anterior.disabled = pista.scrollLeft <= 2;
      seguinte.disabled = pista.scrollLeft >= max;
    };
    pista.addEventListener('scroll', atualizarSetas, { passive: true });
    window.addEventListener('resize', atualizarSetas);
    setTimeout(atualizarSetas, 100);

    // Arrastar com o rato (no telemóvel o arrastar já funciona sozinho)
    let aArrastar = false, moveu = false, inicioX = 0, inicioScroll = 0;
    pista.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      aArrastar = true; moveu = false;
      inicioX = e.clientX; inicioScroll = pista.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!aArrastar) return;
      const dx = e.clientX - inicioX;
      if (Math.abs(dx) > 5) {
        moveu = true;
        pista.classList.add('a-arrastar');
      }
      pista.scrollLeft = inicioScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!aArrastar) return;
      aArrastar = false;
      pista.classList.remove('a-arrastar');
    });
    // Se arrastou, não abrir a foto por engano
    pista.addEventListener('click', (e) => {
      if (moveu) { e.stopPropagation(); e.preventDefault(); moveu = false; }
    }, true);
    pista.addEventListener('dragstart', (e) => e.preventDefault());
  }
}

renderizarArquivo();

function abrirLightbox(i, lista = 'galeria') {
  const foto = (DADOS[lista] || [])[i];

  if (!foto) return;

  $('lightbox-legenda').textContent = lista === 'arquivo' ? '' : foto.legenda;

  const imagem = $('lightbox-imagem');

  if (foto.foto) {
    imagem.src = foto.foto;
    imagem.alt = foto.legenda;
    imagem.style.display = 'block';
    $('lightbox-icone').style.display = 'none';
  } else {
    imagem.style.display = 'none';
    $('lightbox-icone').style.display = 'block';
  }

  $('lightbox').classList.add('aberto');
}

function fecharLightbox() {
  $('lightbox').classList.remove('aberto');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fecharLightbox();
    fecharNoticia();
    fecharJogador();
  }
});
// ============================================================
// NOTÍCIAS
// ============================================================

function escaparHTML(texto) {
  if (texto === null || texto === undefined) return '';

  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ------------------------------------------------------------
// Criar cartão de notícia
// ------------------------------------------------------------

function criarNoticia(n, i) {

  const titulo = escaparHTML(n.titulo);
  const resumo = escaparHTML(n.resumo);
  const categoria = escaparHTML(n.categoria || 'Notícias');
  const fonte = escaparHTML(n.fonte || 'Sampaense Basket');

  const data = n.data
    ? fmtDataLonga(n.data)
    : '';

  // Notícias externas
  if (n.url) {

    const urlNoticia = escaparHTML(n.url);

    return `
      <article class="noticia noticia-externa">

        <div class="corpo">

          <span class="data-cat">
            ${data} · ${categoria}
          </span>

          <span class="fonte-noticia">
            ${fonte}
          </span>

          <h3>
            <a
              href="${urlNoticia}"
              target="_blank"
              rel="noopener noreferrer"
              style="color:inherit; text-decoration:none;"
            >${titulo}</a>
          </h3>

          <p>${resumo}</p>

          <a
            class="ler-mais"
            href="${urlNoticia}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ler notícia ↗
          </a>

        </div>

      </article>
    `;
  }


  // Notícias antigas / internas
  return `
    <article class="noticia">

      <div class="corpo">

        <span class="data-cat">
          ${data} · ${categoria}
        </span>

        <span class="fonte-noticia">
          ${fonte}
        </span>

        <h3>${titulo}</h3>

        <p>${resumo}</p>

        <button
          class="ler-mais"
          type="button"
          onclick="abrirNoticia(${i})"
        >
          Ler mais →
        </button>

      </div>

    </article>
  `;
}


// ------------------------------------------------------------
// Mostrar notícias
// ------------------------------------------------------------

function mostrarNoticias() {

  const lista = document.getElementById('lista-noticias');

  if (!lista) return;

  if (!DADOS.noticias || !DADOS.noticias.length) {

    lista.innerHTML = `
      <p class="sem-noticias">
        Não existem notícias disponíveis neste momento.
      </p>
    `;

    return;
  }

  const maisRecentes = [...DADOS.noticias]
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 3);

  lista.innerHTML = maisRecentes
    .map(n => criarNoticia(n, DADOS.noticias.indexOf(n)))
    .join('');

  // Só mostramos as 3 mais recentes — não há "ver mais".
  const botaoMais = document.getElementById('btn-ver-mais-noticias');
  if (botaoMais) botaoMais.closest('.mais-noticias').style.display = 'none';
}


// ------------------------------------------------------------
// Modal das notícias antigas
// ------------------------------------------------------------

function abrirNoticia(i) {

  const n = DADOS.noticias[i];

  if (!n) return;

  // Se for uma notícia externa,
  // abrimos o artigo original.
  if (n.url) {

    window.open(
      n.url,
      '_blank',
      'noopener,noreferrer'
    );

    return;
  }

  $('modal-data-cat').textContent =
    fmtDataLonga(n.data) +
    ' · ' +
    (n.categoria || 'Clube');

  $('modal-titulo').textContent =
    n.titulo || '';

  $('modal-texto').textContent =
    n.texto || n.resumo || '';

  $('modal-noticia').classList.add('aberto');
}


function fecharNoticia() {

  $('modal-noticia')
    .classList
    .remove('aberto');
}


// ------------------------------------------------------------
// Estado visual
// ------------------------------------------------------------

function atualizarEstadoNoticias(texto, online = true) {

  const estado =
    document.getElementById('estado-noticias');

  if (!estado) return;

  estado.innerHTML = `
    <span
      class="ponto-online ${online ? '' : 'offline'}">
    </span>

    ${texto}
  `;
}


// ------------------------------------------------------------
// Buscar notícias no servidor
// ------------------------------------------------------------

async function atualizarNoticias() {

  atualizarEstadoNoticias(
    'A procurar notícias...',
    true
  );

  try {
    const resposta = await fetch(
      '/api/noticias',
      {
        cache: 'no-store'
      }
    );


    if (!resposta.ok) {
      throw new Error(
        'Erro HTTP ' + resposta.status
      );
    }

    const dados = await resposta.json();

    if (!dados.sucesso) {
      throw new Error(
        dados.erro || 'Erro ao obter notícias'
      );
    }


    // As notícias antigas que já estão no site
    // ficam sempre preservadas.
    const antigas = Array.isArray(DADOS.noticias)
      ? DADOS.noticias
      : [];


    // Notícias encontradas online
    const novas = Array.isArray(dados.noticias)
      ? dados.noticias
      : [];


    // Juntar tudo
    const todas = [
      ...novas,
      ...antigas
    ];


    // Remover duplicados
    const mapa = new Map();


    todas.forEach(noticia => {

      const chave =
        noticia.id ||
        noticia.url ||
        (
          String(noticia.titulo || '')
            .toLowerCase()
            .trim()
        );

      if (!chave) return;

      if (!mapa.has(chave)) {
        mapa.set(chave, noticia);
      }

    });


    // Ordenar por data
    DADOS.noticias =
      Array.from(mapa.values())
        .sort((a, b) => {

          const dataA =
            new Date(a.data || 0).getTime();

          const dataB =
            new Date(b.data || 0).getTime();

          return dataB - dataA;

        });


    mostrarNoticias();


    atualizarEstadoNoticias(
      `${novas.length} notícias encontradas · atualizado agora`,
      true
    );


  } catch (erro) {

    console.error(
      'Erro ao atualizar notícias:',
      erro
    );


    // Mesmo que o servidor esteja indisponível,
    // as notícias antigas continuam a aparecer.
    mostrarNoticias();


    atualizarEstadoNoticias(
      'Últimas notícias disponíveis',
      false
    );

  }

}


// ------------------------------------------------------------
// Primeira carga
// ------------------------------------------------------------

mostrarNoticias();

atualizarNoticias();


// ------------------------------------------------------------
// Atualizar automaticamente a cada 30 minutos
// ------------------------------------------------------------

setInterval(
  atualizarNoticias,
  30 * 60 * 1000
);


// ------------------------------------------------------------
// Botão manual
// ------------------------------------------------------------

const btnAtualizarNoticias =
  document.getElementById(
    'btn-atualizar-noticias'
  );

if (btnAtualizarNoticias) {

  btnAtualizarNoticias.addEventListener(
    'click',
    atualizarNoticias
  );

}
// ---- Sócio ----
async function submeterSocio(ev) {
  ev.preventDefault();
  const form = $('form-socio');
  const feedback = $('socio-feedback');
  const botao = form.querySelector('button[type="submit"]');

  const nome = $('socio-nome').value.trim();
  const email = $('socio-email').value.trim();
  const telefone = $('socio-telefone').value.trim();
  const escalao = $('socio-escalao').value;

  botao.disabled = true;
  feedback.textContent = 'A enviar...';
  feedback.style.color = 'var(--texto-suave)';

  try {
    const resposta = await fetch('socios.php', {
      method: 'POST',
      body: new FormData(form)
    });
    const dados = await resposta.json();

    if (dados.ok) {
      form.reset();
      feedback.textContent = 'Pré-inscrição registada! Para oficializar, paga a quota em mão, presencialmente no clube.';
      feedback.style.color = 'var(--verde)';
    } else {
      feedback.textContent = dados.mensagem || 'Não foi possível enviar. Tenta novamente.';
      feedback.style.color = 'var(--vermelho, #c0392b)';
    }
  } catch (erro) {
    // Sem servidor/PHP disponível: recorre ao email como alternativa
    const destino = DADOS.clube.emailSocios || DADOS.clube.email;
    if (destino) {
      const assunto = encodeURIComponent('Pré-inscrição de sócio — ' + nome);
      const corpo = encodeURIComponent(
        `Nome: ${nome}\nEmail: ${email}\nTelefone: ${telefone}\nEscalão pretendido: ${escalao}\n\nA inscrição só fica oficial após o pagamento da quota, em mão, presencialmente no clube.\n\nEnviado a partir do site do ${DADOS.clube.nome}.`
      );
      window.location.href = `mailto:${destino}?subject=${assunto}&body=${corpo}`;
      feedback.textContent = 'Não foi possível enviar diretamente. A abrir o teu email com o pedido preenchido — falta só enviar.';
      feedback.style.color = 'var(--amarelo)';
    } else {
      feedback.textContent = 'Não foi possível enviar. Tenta novamente mais tarde.';
      feedback.style.color = 'var(--vermelho, #c0392b)';
    }
  } finally {
    botao.disabled = false;
  }
}
if (DADOS.socio) {
  $('socio-intro').textContent = DADOS.socio.intro;
  $('socio-nota-precos').textContent = DADOS.socio.notaPrecos || '';
  const pg = DADOS.socio.pagamento;
  if (pg) {
    $('socio-pagamento-titulo').textContent = pg.titulo || 'Pagamento presencial';
    $('socio-pagamento-texto').textContent = pg.texto || '';
    $('socio-pagamento-local').textContent = pg.local ? 'Onde pagar: ' + pg.local : '';
  } else {
    $('socio-pagamento').style.display = 'none';
  }
  $('lista-escaloes').innerHTML = DADOS.socio.escaloes.map(e => `
    <div class="escalao">
      <h3>${e.nome}</h3>
      <div class="escalao-preco">${e.preco}</div>
      <p>${e.beneficios}</p>
    </div>`).join('');
  $('socio-escalao').innerHTML = DADOS.socio.escaloes.map(e => `<option value="${e.nome}">${e.nome} — ${e.preco}</option>`).join('');
}
const listaParceiros = $('lista-parceiros');

if (DADOS.parceiros && listaParceiros) {
  listaParceiros.innerHTML = DADOS.parceiros.map(parceiro => `
    <a
      class="cartao-parceiro"
      href="${parceiro.url || '#'}"
      ${parceiro.url ? 'target="_blank" rel="noopener noreferrer"' : ''}
      title="${parceiro.nome}"
    >
      <img
        src="${parceiro.logo}"
        alt="${parceiro.nome}"
        loading="lazy"
      >
    </a>
  `).join('');
}

// ---- Formação (aba escondida, aberta pelo botão do menu) ----
function abrirFormacao(ev) {
  if (ev) ev.preventDefault();
  $('formacao').classList.add('aberta');
  $('menu').classList.remove('aberto');
  $('formacao').scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', '#formacao');
}
function fecharFormacao() {
  $('formacao').classList.remove('aberta');
  history.replaceState(null, '', '#plantel');
  $('plantel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
if (DADOS.formacao) {
  const F = DADOS.formacao;
  $('formacao-intro').textContent = F.intro || '';
  $('formacao-local').textContent = F.local ? 'Local: ' + F.local : '';
  $('tabela-formacao').innerHTML =
    `<thead><tr><th>Escalão</th>${F.dias.map(dia => `<th>${dia}</th>`).join('')}</tr></thead>
     <tbody>${F.escaloes.map(e => `
       <tr>
         <th scope="row">${e.nome}${e.genero ? `<small>${e.genero}</small>` : ''}</th>
         ${F.dias.map(dia => `<td>${e.horarios[dia] ? e.horarios[dia].replace('–', '<br>') : ''}</td>`).join('')}
       </tr>`).join('')}
     </tbody>`;
}
if (location.hash === '#formacao') abrirFormacao();

/* ======================================================================
   ABA "HISTÓRIA" — cola este código no FIM do site.js.
   Cria sozinho o botão no menu e a secção (não precisas de mexer no HTML).
   ====================================================================== */
(function () {
  const H = DADOS.historia || {};
  const C = DADOS.clube;
  const F = DADOS.formacao;

  const lista = (x) => (Array.isArray(x) ? x : []);
  let html = '';

  // Cabeçalho
  html += `
    <div class="wrap">
      <div class="cabecalho-seccao">
        <div>
          <h2 class="display">HISTÓRIA</h2>
          <p>${H.intro || ''}</p>
        </div>
        <button type="button" class="btn-jogos-toggle" onclick="fecharHistoria()">Fechar </button>
      </div>`;

  // Texto
  if (lista(H.texto).length) {
    html += `<div class="historia-texto">${H.texto.map(p => `<p>${p}</p>`).join('')}</div>`;
  }
  // Títulos
  if (lista(H.titulos).length) {
    html += `<h3 class="historia-titulo">Títulos e conquistas</h3>
      <div class="historia-titulos">${H.titulos.map(t => `
        <div class="historia-titulo-cartao">
          <span class="historia-trofeu">${t.icone || '🏆'}</span>
          <b>${t.competicao}</b>
          <span>${[t.escalao, t.epoca].filter(Boolean).join(' · ')}</span>
        </div>`).join('')}</div>`;
  }

  // Outros resultados
  if (lista(H.destaques).length) {
    html += `<h3 class="historia-titulo">Outros resultados de destaque</h3>
      <div class="historia-titulos">${H.destaques.map(t => `
        <div class="historia-titulo-cartao historia-secundario">
          <span class="historia-trofeu">${t.icone || '🏀'}</span>
          <b>${t.competicao}</b>
          <span>${[t.escalao, t.epoca].filter(Boolean).join(' · ')}</span>
        </div>`).join('')}</div>`;
  }

  // Cronologia
  if (lista(H.cronologia).length) {
    html += `<h3 class="historia-titulo">Marcos</h3>
      <ol class="historia-linha">${H.cronologia.map(m => `
        <li><span class="historia-ano display">${m.ano}</span>
          <div><h4>${m.titulo}</h4>${m.texto ? `<p>${m.texto}</p>` : ''}</div></li>`).join('')}
      </ol>`;
  }

  // Figuras
  if (lista(H.figuras).length) {
    html += `<h3 class="historia-titulo">Figuras do clube</h3>
      <div class="jogador-dados historia-hoje">${H.figuras.map(f =>
        `<div><b>${f.papel}</b><span>${f.nome}</span></div>`).join('')}</div>`;
  }

  html += `</div>`;

  // Criar a secção (junto à da Formação, que também é uma aba escondida)
  const sec = document.createElement('section');
  sec.id = 'historia';
  sec.style.display = 'none'; // escondida até clicarem em "História" (não depende do CSS)
  sec.innerHTML = html;
  const ref = $('formacao') || $('plantel');
  if (ref) ref.before(sec); else document.body.appendChild(sec);

  // Abrir / fechar
  window.abrirHistoria = function (ev) {
    if (ev) ev.preventDefault();
    $('formacao') && $('formacao').classList.remove('aberta');
    sec.classList.add('aberta');
    sec.style.display = 'block';
    $('menu').classList.remove('aberto');
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#historia');
  };
  window.fecharHistoria = function () {
    sec.classList.remove('aberta');
    sec.style.display = 'none';
    history.replaceState(null, '', '#plantel');
    $('plantel') && $('plantel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Criar o botão no menu (antes de "Formação" se existir)
  const menu = $('menu');
  if (menu) {
    const a = document.createElement('a');
    a.href = '#historia';
    a.textContent = 'História';
    a.addEventListener('click', window.abrirHistoria);
    const linkFormacao = menu.querySelector('a[href="#formacao"]');
    if (linkFormacao) linkFormacao.before(a); else menu.appendChild(a);
  }

  // Abrir Formação fecha História
  if (typeof abrirFormacao === 'function') {
    const original = abrirFormacao;
    window.abrirFormacao = function (ev) {
      sec.classList.remove('aberta');
      sec.style.display = 'none';
      original(ev);
    };
  }

  if (location.hash === '#historia') abrirHistoria();
})();