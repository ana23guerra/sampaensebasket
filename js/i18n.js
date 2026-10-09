/* i18n.js — carrega DEPOIS do site.js */
(function () {
  'use strict';

  // Chaves SEMPRE em minúsculas. MAIÚSCULAS no original => MAIÚSCULAS na tradução.
  const EN = {
    // menu / hero
    "início": "Home", "jogos": "Games", "plantel": "Roster", "formação": "Youth",
    "galeria": "Gallery", "arquivo": "Archive", "notícias": "News", "sócio": "Membership",
    "parceiros": "Partners", "contactos": "Contact", "história": "History",
    "clube de basquetebol": "Basketball club",
    "notícias, calendário de jogos, plantel e a galeria do sampaense basket — tudo num só sítio, atualizado a cada jornada.":
      "News, game schedule, roster and gallery of Sampaense Basket — all in one place, updated every matchday.",
    "ver calendário": "View schedule", "conhecer o plantel": "Meet the roster",
    "próximo jogo": "Next game", "data": "Date", "hora": "Time", "local": "Location", "pavilhão": "Arena",
    "dias": "Days", "horas": "Hours", "seg": "Sec", "forma recente": "Recent form",

    // jogos
    "calendário e resultados da proliga 2026/2027.": "Schedule and results for the 2026/2027 Proliga.",
    "próximos": "Upcoming", "resultados": "Results", "sem jogos para mostrar.": "No games to show.",
    "casa": "Home", "em casa": "Home", "fora": "Away",
    "jogos anteriores": "Previous games", "jogos seguintes": "Next games",
    "v torneio ab coimbra": "5th AB Coimbra Tournament",
    "pavilhão fidelidade, lisboa": "Pavilhão Fidelidade, Lisbon",

    // plantel
    "equipa sénior masculina 2026/2027, orientada pelo treinador cláudio figueiredo e alexandre fernandes.":
      "Senior men's team 2026/2027, coached by Cláudio Figueiredo and Alexandre Fernandes.",
    "todos": "All", "base": "Point guard", "extremo": "Wing", "poste": "Big",
    "ver ficha →": "View profile →", "por confirmar": "To be confirmed",
    "sem jogadores para mostrar.": "No players to show.",
    "nacionalidade": "Nationality", "naturalidade": "Hometown", "último clube": "Last club", "altura": "Height",
    "americana": "American", "portuguesa": "Portuguese", "congolês": "Congolese", "senegalês": "Senegalese",
    "geórgia": "Georgia", "nova york": "New York", "lisboa": "Lisbon",
    "fechar": "Close", "fechar ✕": "Close ✕",

    // formação
    "horários da formação": "Youth training schedule",
    "horários de treino de todos os escalões de formação do sampaense basket.":
      "Training schedules for all Sampaense Basket youth age groups.",
    "escalão": "Age group", "masculino": "Boys", "feminino": "Girls",

    // galeria / arquivo
    "momentos de jogo, treinos e bastidores.": "Game moments, training sessions and behind the scenes.",
    "ver mais": "See more", "ver mais fotos": "See more photos",
    "fotos antigas do clube — a memória do sampaense ao longo dos anos.":
      "Old photos of the club — Sampaense's memories through the years.",
    "ainda não há fotos no arquivo.": "There are no photos in the archive yet.",
    "foto do arquivo": "Archive photo", "fotos anteriores": "Previous photos", "fotos seguintes": "Next photos",
    "imagem indisponível": "Image unavailable", "emblema sampaense basket": "Sampaense Basket crest",

    // notícias
    "o que se passa dentro e fora do pavilhão.": "What's happening inside and outside the arena.",
    "atualização automática": "Automatic updates", "a procurar notícias...": "Looking for news...",
    "atualizado agora": "updated just now", "últimas notícias disponíveis": "Latest available news",
    "ver mais notícias ↓": "See more news ↓", "ler notícia ↗": "Read article ↗", "ler mais →": "Read more →",
    "não existem notícias disponíveis neste momento.": "No news available at the moment.",
    "clube": "Club",

    // sócio
    "torna-te sócio": "Become a member",
    "torna-te sócio do sampaense basket e ajuda a fazer crescer o basquetebol em oliveira do hospital.":
      "Become a member of Sampaense Basket and help grow basketball in Oliveira do Hospital.",
    "pagamento presencial": "In-person payment",
    "preenche o formulário para pré-inscrição. a inscrição só fica oficial após o pagamento da quota, feito em mão, presencialmente no clube.":
      "Fill in the form to pre-register. Registration is only official once the membership fee has been paid in person at the club.",
    "entrada gratuita em jogos de casa da proliga": "Free entry to Proliga home games",
    "nome completo": "Full name", "telefone": "Phone", "escalão pretendido": "Membership type",
    "aceito que o sampaense basket guarde os meus dados (nome, email e telefone) apenas para tratar da minha inscrição como sócio.":
      "I agree that Sampaense Basket stores my data (name, email and phone) solely to process my membership registration.",
    "enviar pré-inscrição": "Submit pre-registration", "a enviar...": "Sending...",
    "pré-inscrição registada! para oficializar, paga a quota em mão, presencialmente no clube.":
      "Pre-registration received! To make it official, pay the membership fee in person at the club.",
    "não foi possível enviar diretamente. a abrir o teu email com o pedido preenchido — falta só enviar.":
      "Couldn't send directly. Opening your email app with the request filled in — you just need to hit send.",
    "não foi possível enviar. tenta novamente mais tarde.": "Couldn't send. Please try again later.",
    "não foi possível enviar. tenta novamente.": "Couldn't send. Please try again.",
    // mvp
    "mvp do jogo": "Game MVP", "votação aberta": "Voting open", "votação encerrada": "Voting closed",
    "em breve": "Coming soon", "votar agora": "Vote now", "confirmar voto": "Confirm vote",
    "um voto por pessoa.": "One vote per person.",
    "os resultados ficam visíveis depois de votares.": "Results are shown once you've voted.",
    "já votaste. obrigado!": "You've voted. Thank you!",
    "a votação abre quando terminar o próximo jogo.": "Voting opens when the next game ends.",
    "voto registado! obrigado.": "Vote registered! Thank you.",
    "já votaste neste jogo.": "You've already voted in this game.",
    "a votação deste jogo está fechada.": "Voting for this game is closed.",
    "jogo inválido.": "Invalid game.", "jogador inválido.": "Invalid player.",
    "não foi possível votar. tenta novamente.": "Couldn't register your vote. Please try again.",
    // parceiros / contactos / rodapé
    "parceiros & patrocinadores": "Partners & sponsors",
    "vem ver um jogo ao vivo ou fala connosco.": "Come and watch a live game or get in touch.",
    "a nossa casa": "Our home", "onde jogamos": "Where we play",
    "é aqui que o sampaense recebe os seus adversários.": "This is where Sampaense hosts its opponents.",
    "abrir localização no google maps": "Open location in Google Maps",
    "© desenvolvido por ana guerra almeida": "© Developed by Ana Guerra Almeida",

    // história
    "palmarés e marcos do sampaense basket.": "Honours and milestones of Sampaense Basket.",
    "títulos e conquistas": "Titles and honours", "outros resultados de destaque": "Other notable results",
    "marcos": "Milestones", "figuras do clube": "Club figures",
    "campeão nacional da 2.ª divisão": "National Second Division Champions",
    "campeão da proliga": "Proliga Champions",
    "subida à 1.ª divisão nacional.": "Promotion to the National First Division.",
    "três títulos consecutivos da proliga": "Three consecutive Proliga titles",
    "campeão da proliga em 2003/04, 2004/05 e 2005/06.": "Proliga champions in 2003/04, 2004/05 and 2005/06.",
    "quatro finais consecutivas da proliga": "Four consecutive Proliga finals",
    "final disputada em quatro épocas seguidas; em 2006/07 ficou o vice-campeonato.":
      "Reached the final four seasons in a row; runners-up in 2006/07.",
    "finalista da proliga e subida à liga": "Proliga finalists and promotion to the Liga",
    "vice-campeão da proliga e subida à liga portuguesa de basquetebol.":
      "Proliga runners-up and promotion to the Liga Portuguesa de Basquetebol.",
    "duas meias-finais da taça de portugal": "Two Taça de Portugal semi-finals",
    "presença na final 8 da taça de portugal em 2011/12 e 2012/13, chegando às meias-finais em ambas.":
      "Appeared in the Taça de Portugal Final 8 in 2011/12 and 2012/13, reaching the semi-finals both times.",
    "3.º lugar na liga e final do troféu antónio pratas": "3rd place in the Liga and António Pratas Trophy final",
    "meias-finais dos playoffs da liga, terminando em 3.º lugar. no troféu antónio pratas, eliminou o benfica nas meias-finais e perdeu a final com a ovarense por 62–65, a primeira final oficial de uma competição da liga.":
      "Reached the Liga playoff semi-finals, finishing 3rd. In the António Pratas Trophy, beat Benfica in the semi-finals and lost the final to Ovarense 62–65, the first official final of a Liga competition.",
    "vice-campeão": "Runners-up", "vice-campeão (subida à liga)": "Runners-up (promoted to the Liga)",
    "meias-finais": "Semi-finals", "3.º lugar": "3rd place", "finalista": "Finalist",
    "troféu antónio pratas": "António Pratas Trophy"
  };

  // Frases com partes variáveis
  const REGRAS = [
    [/^Local: /, 'Venue: '],
    [/^Onde pagar: /, 'Where to pay: '],
    [/^(\d+) notícias encontradas$/, '$1 news items found'],
    [/Jornada (\d+)/, 'Round $1'],
    [/^Quem foi o MVP contra (.+)\?$/, 'Who was the MVP against $1?'],
    [/^Próximo jogo: (.+)$/, 'Next game: $1'],
    [/^Fecha em (.+)$/, 'Closes in $1'],
    [/^1 voto$/, '1 vote'],
    [/^(\d+) votos$/, '$1 votes'],
    [/^1º$/, '1st'], [/^2º$/, '2nd'], [/^3º$/, '3rd'],
    [/\(Capitão\)/, '(Captain)'],
    [/(\d+(?:[.,]\d+)?)\s*€\s*\/\s*ano/, '€$1/year'],
    [/^(\d{1,2}:\d{2})h$/, '$1']
  ];

  // Palavras iguais com significados diferentes consoante o sítio
  const CONTEXTOS = [
    ['.pilula', { V: 'W', D: 'L' }],
    ['.tabela-formacao thead th', { SEG: 'MON', TER: 'TUE', QUA: 'WED', QUI: 'THU', SEX: 'FRI', 'SÁB': 'SAT' }]
  ];

  const ATRIBUTOS = ['alt', 'aria-label', 'title', 'placeholder'];
  const SEL_ATTR = ATRIBUTOS.map(a => `[${a}]`).join(',');
  const tem = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  let lang = 'pt';
  try { lang = localStorage.getItem('lang') === 'en' ? 'en' : 'pt'; } catch (e) {}

  // Datas e horas passam a formato inglês (03 Oct, 18:30)
  ['toLocaleDateString', 'toLocaleTimeString'].forEach(fn => {
    const original = Date.prototype[fn];
    Date.prototype[fn] = function (loc, ...resto) {
      return original.call(this, lang === 'en' && loc === 'pt-PT' ? 'en-GB' : loc, ...resto);
    };
  });

  function ajustarCaso(orig, t) {
    const letras = orig.replace(/[^A-Za-zÀ-ÿ]/g, '');
    return letras.length > 1 && letras === letras.toUpperCase() ? t.toUpperCase() : t;
  }

  function traduzirPeca(s) {
    const k = s.toLowerCase();
    if (tem(EN, k)) return ajustarCaso(s, EN[k]);
    return REGRAS.reduce((r, [re, rep]) => r.replace(re, rep), s);
  }

  function traduzir(v) {
    const m = v.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const core = m[2].replace(/\s+/g, ' ');
    if (!core) return v;
    const k = core.toLowerCase();
    const t = tem(EN, k)
      ? ajustarCaso(core, EN[k])
      : core.split(/( · | — )/).map((p, i) => (i % 2 ? p : traduzirPeca(p))).join('');
    return t === core ? v : m[1] + t + m[3];
  }

  function traduzNo(n) {
    const v = n.nodeValue, p = n.parentElement, c = v.trim();
    if (p) for (const [sel, mapa] of CONTEXTOS) {
      if (tem(mapa, c) && p.closest(sel)) return v.replace(c, mapa[c]);
    }
    return traduzir(v);
  }

  function aplicarNo(n) {
    const v = n.nodeValue;
    if (n._en !== undefined && v === n._en) return; // já traduzido por nós
    if (lang !== 'en') return;
    const t = traduzNo(n);
    if (t !== v) { n._pt = v; n._en = t; n.nodeValue = t; } else { n._en = undefined; }
  }

  function aplicarAttr(el) {
    if (el.id === 'btn-lingua') return;
    ATRIBUTOS.forEach(a => {
      if (!el.hasAttribute(a)) return;
      const v = el.getAttribute(a);
      if (el._attr && el._attr[a] && el._attr[a].en === v) return;
      const t = traduzir(v);
      if (t !== v) { (el._attr = el._attr || {})[a] = { pt: v, en: t }; el.setAttribute(a, t); }
    });
  }

  function percorrer(raiz) {
    if (raiz.nodeType === 3) return aplicarNo(raiz);
    if (raiz.nodeType !== 1) return;
    const tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nos = [];
    while (tw.nextNode()) nos.push(tw.currentNode);
    nos.forEach(aplicarNo);
    [raiz, ...raiz.querySelectorAll(SEL_ATTR)].forEach(aplicarAttr);
  }

  function restaurar() {
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      const n = tw.currentNode;
      if (n._en !== undefined && n.nodeValue === n._en) { n.nodeValue = n._pt; n._en = undefined; }
    }
    document.querySelectorAll(SEL_ATTR).forEach(el => {
      if (!el._attr) return;
      for (const a in el._attr) if (el.getAttribute(a) === el._attr[a].en) el.setAttribute(a, el._attr[a].pt);
      el._attr = null;
    });
  }

  // Tudo o que o site.js desenhar depois também é traduzido
  new MutationObserver(muts => {
    if (lang !== 'en') return;
    muts.forEach(m => {
      if (m.type === 'characterData') aplicarNo(m.target);
      else m.addedNodes.forEach(percorrer);
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });

  // ---- Botão com a bandeira (criado aqui, não precisas de mexer no HTML) ----
  const BANDEIRA_EN = '<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0 0l60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0l60 40M60 0L0 40" stroke="#C8102E" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="12"/><path d="M30 0v40M0 20h60" stroke="#C8102E" stroke-width="7"/></svg>';
  const BANDEIRA_PT = '<svg viewBox="0 0 30 20"><rect width="12" height="20" fill="#006600"/><rect x="12" width="18" height="20" fill="#FF0000"/><circle cx="12" cy="10" r="4" fill="#FFCC00"/></svg>';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'btn-lingua';
  btn.addEventListener('click', () => definirLingua(lang === 'en' ? 'pt' : 'en'));
  const menu = document.getElementById('menu');
  const barra = document.querySelector('.nav-inner');
  if (barra) barra.insertBefore(btn, document.getElementById('burger'));

  function atualizarBotao() {
    const emIngles = lang === 'en';
    btn.innerHTML = (emIngles ? BANDEIRA_EN : BANDEIRA_PT) + '<span>' + (emIngles ? 'EN' : 'PT') + '</span>';
    const txt = emIngles ? 'Switch to Portuguese' : 'Mudar para inglês';
    btn.setAttribute('aria-label', txt);
    btn.title = txt;
  }

  function definirLingua(nova) {
    lang = nova;
    try { localStorage.setItem('lang', nova); } catch (e) {}
    document.documentElement.lang = nova === 'en' ? 'en' : 'pt-PT';
    if (nova === 'pt') restaurar();
    // volta a desenhar o que tem datas/horas para apanhar o formato certo
    if (typeof renderizarJogos === 'function') renderizarJogos();
    if (typeof mostrarNoticias === 'function') mostrarNoticias();
    if (nova === 'en') percorrer(document.body);
    atualizarBotao();
  }

  // Para descobrires o que falta traduzir: escreve i18nPorTraduzir() na consola
  window.i18nPorTraduzir = function () {
    const vistos = new Set();
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      const n = tw.currentNode, v = n.nodeValue.trim();
      if (v && n._en === undefined && /[a-zà-ÿ]{3}/i.test(v)) vistos.add(v);
    }
    console.log([...vistos]);
  };

  atualizarBotao();
  if (lang === 'en') definirLingua('en');
})();