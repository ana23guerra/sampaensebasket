// api/mvp.js — votação MVP do jogo (Vercel + Redis)
//
// GET  /api/mvp?jogo=AAAA-MM-DD            -> { ok, votos: { "8": 3, ... }, total }
// POST /api/mvp  (jogo, jogador)            -> regista 1 voto por pessoa e devolve o mesmo
//
// Usa a variável REDIS_URL que a Vercel cria quando a base de dados Redis
// é ligada ao projeto. Precisa do pacote "redis" (ver package.json).

const crypto = require('crypto');
const { createClient } = require('redis');

let ligacao = null; // reutilizada entre pedidos enquanto a função estiver "quente"

async function obterRedis() {
  if (!process.env.REDIS_URL) {
    throw new Error('Variável REDIS_URL em falta (base de dados não ligada ao projeto).');
  }

  if (ligacao && ligacao.cliente.isOpen) {
    return ligacao.cliente;
  }

  const cliente = createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 8000 }
  });

  cliente.on('error', (e) => console.error('Redis:', e.message));

  ligacao = { cliente };
  await cliente.connect();
  return cliente;
}

function lerCorpo(corpo) {
  if (!corpo) return {};
  if (typeof corpo === 'string') return Object.fromEntries(new URLSearchParams(corpo));
  return corpo;
}

async function resultados(redis, chaveVotos) {
  const lista = await redis.hGetAll(chaveVotos);

  const votos = {};
  let total = 0;

  for (const [jogador, n] of Object.entries(lista || {})) {
    votos[jogador] = Number(n) || 0;
    total += votos[jogador];
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
    const redis = await obterRedis();

    // ---- Ler resultados ----
    if (!ePost) {
      return res.status(200).json({ ok: true, ...(await resultados(redis, chaveVotos)) });
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

    const novo = await redis.sAdd(`mvp:${jogo}:eleitores`, eleitor);

    if (!novo) {
      return res.status(200).json({
        ok: false,
        ...(await resultados(redis, chaveVotos)),
        mensagem: 'Já votaste neste jogo.'
      });
    }

    await redis.hIncrBy(chaveVotos, jogador, 1);

    return res.status(200).json({ ok: true, ...(await resultados(redis, chaveVotos)) });

  } catch (erro) {
    console.error('Erro no MVP:', erro);
    ligacao = null; // força nova ligação no próximo pedido
    return res.status(500).json({ ok: false, mensagem: 'Não foi possível votar. Tenta novamente.' });
  }
};