// api/mvp.js — votação MVP do jogo (Vercel + Upstash Redis)
//
// GET  /api/mvp?jogo=AAAA-MM-DD            -> { ok, votos: { "8": 3, ... }, total }
// POST /api/mvp  (jogo, jogador)            -> regista 1 voto por pessoa e devolve o mesmo
//
// Precisa de uma base de dados Upstash Redis ligada ao projeto na Vercel
// (as variáveis KV_REST_API_URL e KV_REST_API_TOKEN são criadas automaticamente).

const crypto = require('crypto');

function lerCorpo(corpo) {
  if (!corpo) return {};
  if (typeof corpo === 'string') return Object.fromEntries(new URLSearchParams(corpo));
  return corpo;
}

async function redis(comandos) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Base de dados Redis não configurada.');
  }

  const resposta = await fetch(url.replace(/\/$/, '') + '/pipeline', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(comandos),
    signal: AbortSignal.timeout(8000)
  });

  if (!resposta.ok) {
    throw new Error('Redis respondeu com HTTP ' + resposta.status);
  }

  const dados = await resposta.json();

  return dados.map((d) => {
    if (d.error) throw new Error(d.error);
    return d.result;
  });
}

async function resultados(chaveVotos) {
  const [lista] = await redis([['HGETALL', chaveVotos]]);

  const votos = {};
  let total = 0;

  for (let i = 0; i < (lista || []).length; i += 2) {
    const n = Number(lista[i + 1]) || 0;
    votos[lista[i]] = n;
    total += n;
  }

  return { votos, total };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const ePost = req.method === 'POST';
    const pedido = ePost ? lerCorpo(req.body) : (req.query || {});

    const jogo = String(pedido.jogo || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(jogo)) {
      return res.status(400).json({ ok: false, mensagem: 'Jogo inválido.' });
    }

    const chaveVotos = `mvp:${jogo}:votos`;

    // ---- Ler resultados ----
    if (!ePost) {
      return res.status(200).json({ ok: true, ...(await resultados(chaveVotos)) });
    }

    // ---- Votar ----
    const jogador = String(pedido.jogador || '');
    if (!/^\d{1,3}$/.test(jogador)) {
      return res.status(400).json({ ok: false, mensagem: 'Jogador inválido.' });
    }

    // só aceita votos de jogos recentes (a janela exata de 72h é controlada no site)
    const dia = new Date(jogo + 'T00:00:00Z').getTime();
    const agora = Date.now();
    if (dia > agora + 86400000 || agora > dia + 5 * 86400000) {
      return res.status(400).json({ ok: false, mensagem: 'A votação deste jogo não está aberta.' });
    }

    // um voto por pessoa: impressão digital = IP + browser (não guardamos o IP)
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || (req.socket && req.socket.remoteAddress) || '';
    const ua = String(req.headers['user-agent'] || '');
    const eleitor = crypto
      .createHash('sha256')
      .update(`${ip}|${ua}|${jogo}`)
      .digest('hex')
      .slice(0, 32);

    const [novo] = await redis([['SADD', `mvp:${jogo}:eleitores`, eleitor]]);

    if (!novo) {
      return res.status(200).json({
        ok: false,
        ...(await resultados(chaveVotos)),
        mensagem: 'Já votaste neste jogo.'
      });
    }

    await redis([['HINCRBY', chaveVotos, jogador, 1]]);

    return res.status(200).json({ ok: true, ...(await resultados(chaveVotos)) });

  } catch (erro) {
    console.error('Erro no MVP:', erro);
    return res.status(500).json({ ok: false, mensagem: 'Não foi possível votar. Tenta novamente.' });
  }
};
