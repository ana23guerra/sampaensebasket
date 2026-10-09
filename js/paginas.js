/* paginas.js — navegação por páginas. Carrega DEPOIS do i18n.js.
   À entrada só aparece a página inicial; as outras abrem ao clicar no menu. */
(function () {
  const $ = (id) => document.getElementById(id);

  // nome da página -> secções que mostra
  const PAGINAS = {
    home:      ['hero', 'mvp'],
    jogos:     ['jogos', 'mvp'],
    plantel:   ['plantel'],
    historia:  ['historia'],
    formacao:  ['formacao'],
    galeria:   ['galeria', 'arquivo'],
    noticias:  ['noticias'],
    socio:     ['socio'],
    parceiros: ['parceiros'],
    contactos: ['contactos']
  };
  const ALIAS = { hero: 'home', topo: 'home', mvp: 'jogos', arquivo: 'galeria' };

  const todas = [...new Set(Object.values(PAGINAS).flat())];
  todas.forEach((id) => { const s = $(id); if (s) s.classList.add('pagina'); });
  document.body.classList.add('paginas');

  // O rodapé estava dentro dos Contactos: passa para fora, para aparecer sempre
  const rodape = document.querySelector('.rodape-fim');
  if (rodape) {
    const f = document.createElement('footer');
    f.className = 'rodape-global';
    const w = document.createElement('div');
    w.className = 'wrap';
    w.appendChild(rodape);
    f.appendChild(w);
    document.body.appendChild(f);
  }

  const menu = $('menu');
  const burger = $('burger');
  if (menu && burger) {
    new MutationObserver(() =>
      burger.setAttribute('aria-expanded', menu.classList.contains('aberto'))
    ).observe(menu, { attributes: true, attributeFilter: ['class'] });
  }

  const idDoHash = (h) => (h || '').replace(/^#/, '');
  const conhecida = (id) => !!(PAGINAS[id] || ALIAS[id]);
  const nomeDaPagina = (hash) => {
    const id = idDoHash(hash);
    const nome = ALIAS[id] || id;
    return PAGINAS[nome] ? nome : 'home';
  };

  let atual = null;

  function mostrar(nome, semScroll) {
    atual = nome;
    const ativas = PAGINAS[nome];
    todas.forEach((id) => {
      const s = $(id);
      if (s) s.classList.toggle('pagina-ativa', ativas.includes(id));
    });
    if (menu) {
      window.dispatchEvent(new Event('resize'));
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      menu.querySelectorAll('a').forEach((a) => {
        const alvo = nomeDaPagina(a.getAttribute('href'));
        a.classList.toggle('ativo', nome !== 'home' && alvo === nome);
      });
      menu.classList.remove('aberto');
    }
    if (!semScroll) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function ir(nome) {
    if (nome !== atual) {
      const url = nome === 'home' ? location.pathname + location.search : '#' + nome;
      history.pushState(null, '', url);
    }
    mostrar(nome);
  }

  // Qualquer link interno (menu, logótipo, botões do início) abre a página certa
  document.addEventListener('click', (ev) => {
    if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button) return;
    const a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a) return;
    const id = idDoHash(a.getAttribute('href'));
    if (!id || !conhecida(id)) return;
    ev.preventDefault();
    ev.stopPropagation();
    ir(nomeDaPagina('#' + id));
  }, true);

  // Botões "Fechar": voltam sempre ao início
  window.fecharFormacao = () => ir('home');
  window.fecharHistoria = () => ir('home');

  // Botões "atrás/à frente" do telemóvel
  window.addEventListener('popstate', () => mostrar(nomeDaPagina(location.hash)));
  window.addEventListener('hashchange', () => mostrar(nomeDaPagina(location.hash)));

  mostrar(nomeDaPagina(location.hash), true);
})();