/* mvp.js — cartão "MVP do jogo" (sempre visível). Carrega DEPOIS do site.js e ANTES do i18n.js */
(function () {
  const HORAS_ABERTA = 72; // quanto tempo a votação fica aberta depois do jogo
  const el = (id) => document.getElementById(id);

  const TROFEU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>';

  // ---- Estrutura (cartão + janela de votação) ----
  const sec = document.createElement('section');
  sec.id = 'mvp';
  sec.innerHTML = `<div class="wrap"><div id="mvp-caixa" class="mvp-caixa"></div><p id="mvp-msg" class="mvp-msg"></p></div>`;
  el('jogos').after(sec);

  const modal = document.createElement('div');
  modal.id = 'modal-mvp';
  modal.innerHTML = `
    <div class="painel">
      <button type="button" class="fechar" id="mvp-fechar">Fechar ✕</button>
      <h3 id="mvp-modal-titulo"></h3>
      <p class="mvp-modal-sub">Um voto por pessoa.</p>
      <div id="mvp-modal-lista" class="grelha-plantel"></div>
      <div class="mvp-modal-rodape">
        <button type="button" class="btn btn-amarelo" id="mvp-confirmar" disabled>Confirmar voto</button>
        <span id="mvp-modal-msg"></span>
      </div>
    </div>`;
  document.body.appendChild(modal);

  // ---- Estado / ajudantes ----
  const chave = (id) => 'mvp-' + id;
  const memoria = {}; // reserva, se o browser não deixar usar localStorage
  const lerVoto = (id) => { try { return localStorage.getItem(chave(id)) || memoria[id] || null; } catch (e) { return memoria[id] || null; } };
  const guardarVoto = (id, num) => { memoria[id] = num; try { localStorage.setItem(chave(id), num); } catch (e) {} };

  let atual = null; // { jogo, id, aberto, fim }

  function jogoMaisRecente() {
    return jogosAtuais
      .filter(j => j.status === 'terminado' && j.data && new Date(j.data).getTime() <= Date.now())
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0];
  }
  function proximoJogo() {
    return jogosAtuais
      .filter(j => j.status === 'agendado')
      .sort((a, b) => new Date(a.data) - new Date(b.data))[0];
  }
  function tempoRestante(fim) {
    const ms = Math.max(0, fim - Date.now());
    const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60;
    return d ? `${d}d ${h}h` : (h ? `${h}h ${m}min` : `${m}min`);
  }
  async function pedir(id, jogador) {
    if (jogador) {
      const r = await fetch('mvp.php', { method: 'POST', body: new URLSearchParams({ jogo: id, jogador }) });
      return r.json();
    }
    const r = await fetch('mvp.php?jogo=' + id + '&t=' + Date.now());
    return r.json();
  }
  const textoVotos = (n) => (n === 1 ? '1 voto' : n + ' votos');

  // ---- Peças do cartão ----
  function linhaJogo(j) {
    const eu = 'Sampaense Basket';
    const casa = j.casa;
    return `${casa ? eu : j.adversario} ${j.pontosCasa} – ${j.pontosFora} ${casa ? j.adversario : eu}`;
  }

  function podioHtml(res, fechado) {
    const votos = (res && res.votos) || {};
    const total = (res && res.total) || 0;
    const top = DADOS.plantel
      .map(p => ({ p, n: votos[p.numero] || 0 }))
      .filter(x => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 3);
    if (!top.length) return '';
    const ordem = top.length === 3 ? [1, 0, 2] : top.map((_, i) => i); // 2º · 1º · 3º
    return ordem.map(i => {
      const { p, n } = top[i];
      const pct = total ? Math.round(100 * n / total) : 0;
      return `
        <div class="mvp-pod p${i + 1}">
          ${i === 0 && fechado ? '<span class="mvp-tag">MVP</span>' : '<span class="mvp-lugar">' + (i + 1) + 'º</span>'}
          ${criarAvatarJogador(p)}
          <b title="${escaparHTML(p.nome)}">${escaparHTML(p.nome)}</b>
          <span class="mvp-pct">${pct}%</span>
        </div>`;
    }).join('');
  }

  function podioOculto() {
    return `<div class="mvp-oculto">
      <div class="mvp-pod oculto"><div class="avatar">?</div></div>
      <div class="mvp-pod oculto p1"><div class="avatar">?</div></div>
      <div class="mvp-pod oculto"><div class="avatar">?</div></div>
    </div>
    <p class="mvp-dica">Os resultados ficam visíveis depois de votares.</p>`;
  }

  // ---- Desenhar o cartão ----
  async function desenhar() {
    const caixa = el('mvp-caixa');
    const jogo = jogoMaisRecente();
    const inicio = jogo ? new Date(jogo.data).getTime() : 0;
    const fim = inicio + HORAS_ABERTA * 3600000;
    const aberto = !!jogo && Date.now() < fim;
    const id = jogo ? jogo.data.slice(0, 10) : null;
    const votou = id ? lerVoto(id) : null;
    atual = { jogo, id, aberto, fim };

    let res = null;
    if (jogo && (votou || !aberto)) { try { res = await pedir(id); } catch (e) {} }
    const haVotos = !!(res && res.total);

    // 1) Sem votação para mostrar: "em breve"
    if (!jogo || (!aberto && !haVotos)) {
      const prox = proximoJogo();
      caixa.className = 'mvp-caixa sem-podio';
      caixa.innerHTML = `
        <div class="mvp-info">
          <div class="mvp-titulo">${TROFEU}<span>MVP DO JOGO</span></div>
          <div class="mvp-estado"><span class="mvp-pill breve"><i></i>Em breve</span></div>
          <p class="mvp-texto">A votação abre quando terminar o próximo jogo.</p>
          ${prox ? `<p class="mvp-sub">Próximo jogo: ${escaparHTML(prox.adversario)} · ${fmtData(prox.data)}</p>` : ''}
        </div>`;
      return;
    }

    // 2) Votação aberta ou encerrada com resultados
    const estado = aberto
      ? `<span class="mvp-pill aberta"><i></i>Votação aberta</span><span class="mvp-fecha" id="mvp-fecha">Fecha em ${tempoRestante(fim)}</span>`
      : `<span class="mvp-pill fechada"><i></i>Votação encerrada</span>`;

    let meio, acao;
    if (aberto && !votou) {
      meio = podioOculto();
      acao = `<button type="button" class="btn btn-amarelo" id="mvp-abrir">Votar agora</button>`;
    } else {
      meio = `<div class="mvp-podio">${podioHtml(res, !aberto)}</div>`;
      acao = aberto
        ? `<span class="mvp-obrigado">Já votaste. Obrigado!</span><span class="mvp-total">${textoVotos(res.total)}</span>`
        : `<span class="mvp-total">${textoVotos(res.total)}</span>`;
    }

    caixa.className = 'mvp-caixa';
    caixa.innerHTML = `
      <div class="mvp-info">
        <div class="mvp-titulo">${TROFEU}<span>MVP DO JOGO</span></div>
        <div class="mvp-jogo"><b>${escaparHTML(linhaJogo(jogo))}</b><span>${fmtData(jogo.data)} · ${escaparHTML(jogo.competicao || '')}</span></div>
        <div class="mvp-estado">${estado}</div>
      </div>
      <div class="mvp-meio">${meio}</div>
      <div class="mvp-acao">${acao}</div>`;

    const abrir = el('mvp-abrir');
    if (abrir) abrir.onclick = abrirModal;
  }

  // ---- Janela de votação ----
  let escolhido = null;

  function abrirModal() {
    if (!atual || !atual.aberto) return;
    escolhido = null;
    el('mvp-modal-titulo').textContent = `Quem foi o MVP contra ${atual.jogo.adversario}?`;
    el('mvp-modal-msg').textContent = '';
    el('mvp-confirmar').disabled = true;
    el('mvp-modal-lista').innerHTML = DADOS.plantel.map(p => `
      <div class="jogador mvp-opcao" data-num="${p.numero}" tabindex="0" role="button">
        <div class="numero">${p.numero}</div>
        ${criarAvatarJogador(p)}
        <h3>${escaparHTML(p.nome)}</h3>
      </div>`).join('');
    modal.classList.add('aberto');
  }
  function fecharModal() { modal.classList.remove('aberto'); }

  function escolher(card) {
    if (!card) return;
    modal.querySelectorAll('.mvp-opcao').forEach(c => c.classList.remove('escolhido'));
    card.classList.add('escolhido');
    escolhido = card.dataset.num;
    el('mvp-confirmar').disabled = false;
  }
  el('mvp-modal-lista').addEventListener('click', (ev) => escolher(ev.target.closest('.mvp-opcao')));
  el('mvp-modal-lista').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') escolher(ev.target.closest('.mvp-opcao')); });
  el('mvp-fechar').addEventListener('click', fecharModal);
  modal.addEventListener('click', (ev) => { if (ev.target === modal) fecharModal(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') fecharModal(); });

  el('mvp-confirmar').addEventListener('click', async () => {
    if (!escolhido || !atual) return;
    const botao = el('mvp-confirmar'), msg = el('mvp-modal-msg');
    botao.disabled = true;
    msg.textContent = 'A enviar...';
    try {
      const res = await pedir(atual.id, escolhido);
      if (res.ok || res.votos) {            // voto registado, ou já tinha votado
        guardarVoto(atual.id, res.ok ? escolhido : (lerVoto(atual.id) || escolhido));
        fecharModal();
        await desenhar();
        el('mvp-msg').textContent = res.ok ? 'Voto registado! Obrigado.' : (res.mensagem || '');
      } else {
        msg.textContent = res.mensagem || 'Não foi possível votar. Tenta novamente.';
        botao.disabled = false;
      }
    } catch (e) {
      msg.textContent = 'Não foi possível votar. Tenta novamente.';
      botao.disabled = false;
    }
  });

  // ---- Manter atualizado ----
  setInterval(() => {
    const f = el('mvp-fecha');
    if (!f || !atual) return;
    if (Date.now() >= atual.fim) { desenhar(); return; }
    f.textContent = 'Fecha em ' + tempoRestante(atual.fim);
  }, 60000);

  // volta a desenhar sempre que os jogos forem atualizados (FPB, mudança de língua)
  const original = window.renderizarJogos;
  window.renderizarJogos = function () { original.apply(this, arguments); desenhar(); };
  desenhar();
})();