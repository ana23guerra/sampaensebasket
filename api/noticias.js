
const FONTES = [
  {
    nome: 'Diário de Coimbra',
    categoria: 'Diário de Coimbra',
    query: 'site:diariocoimbra.pt "Sampaense" OR "Sampaense Basket"'
  },
  {
    nome: 'Rádio Boa Nova',
    categoria: 'Rádio Boa Nova',
    query: 'site:radioboanova.pt "Sampaense" OR "Sampaense Basket"'
  },
  {
    nome: 'FPB',
    categoria: 'FPB',
    query: 'site:fpb.pt "Sampaense" "Basket"'
  },
  {
    nome: 'Diário As Beiras',
    categoria: 'Diário As Beiras',
    query: 'site:asbeiras.pt "Sampaense" OR "Sampaense Basket"'
  },
  {
    nome: 'A Bola',
    categoria: 'A Bola',
    query: 'site:abola.pt "Sampaense Basket"'
  },
  {
    nome: 'Record',
    categoria: 'Record',
    query: 'site:record.pt "Sampaense Basket"'
  },
  {
    nome: 'Correio da Beira Serra',
    categoria: 'Correio da Beira Serra',
    query: 'site:correiodabeiraserra.pt "Sampaense" OR "Sampaense Basket"'
  }
];

function descodificarHTML(texto = '') {
  const entidades = {
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
    nbsp: ' ',
    rsquo: '’',
    lsquo: '‘',
    rdquo: '”',
    ldquo: '“',
    hellip: '…',
    ndash: '–',
    mdash: '—'
  };

  return texto
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (original, nome) =>
      entidades[nome.toLowerCase()] ?? original);
}

function limparTexto(texto = '') {
  return descodificarHTML(texto)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extrairTag(xml, nome) {
  const tag = nome.replace(':', '\\:');
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}\\s*>`,
    'i'
  );
  return xml.match(regex)?.[1]?.trim() || '';
}

function criarResumo(texto, limite = 220) {
  const limpo = limparTexto(texto);
  const caracteres = Array.from(limpo);

  return caracteres.length > limite
    ? caracteres.slice(0, limite).join('') + '...'
    : limpo;
}

function lerFeed(xml, fonte) {
  if (!xml) return [];

  const itens = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || [];
  const noticias = [];

  for (const item of itens) {
    const titulo = limparTexto(extrairTag(item, 'title'));
    const url = descodificarHTML(extrairTag(item, 'link')).trim();
    const descricaoOriginal = extrairTag(item, 'description');
    const descricao = criarResumo(descricaoOriginal);
    const dataOriginal = limparTexto(extrairTag(item, 'pubDate'));
    const timestamp = Date.parse(dataOriginal);

    if (!titulo || !url || !Number.isFinite(timestamp)) continue;

    if (!/^https?:\/\//i.test(url)) continue;

    const textoPesquisa = `${titulo} ${descricao}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (!textoPesquisa.includes('sampaense')) continue;

    noticias.push({
      id: url,
      data: new Date(timestamp).toISOString().slice(0, 10),
      categoria: fonte.categoria,
      fonte: fonte.nome,
      titulo,
      resumo: descricao || 'Notícia sobre o Sampaense Basket.',
      url,
      texto: descricao
    });
  }

  return noticias;
}

async function obterNoticias(fonte) {
  const feedUrl = new URL('https://news.google.com/rss/search');

  feedUrl.searchParams.set('q', fonte.query);
  feedUrl.searchParams.set('hl', 'pt-PT');
  feedUrl.searchParams.set('gl', 'PT');
  feedUrl.searchParams.set('ceid', 'PT:pt-150');

  const resposta = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 Sampaense Basket Noticias',
      'Accept': 'application/rss+xml, application/xml, text/xml'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!resposta.ok) {
    throw new Error(`${fonte.nome}: HTTP ${resposta.status}`);
  }

  const xml = await resposta.text();
  return lerFeed(xml, fonte);
}

module.exports = async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
  );

  try {
    const resultados = await Promise.allSettled(
      FONTES.map(obterNoticias)
    );

    const noticias = [];
    let fontesComSucesso = 0;

    for (const resultado of resultados) {
      if (resultado.status === 'fulfilled') {
        fontesComSucesso++;
        noticias.push(...resultado.value);
      } else {
        console.error('Erro ao obter feed:', resultado.reason);
      }
    }

    if (fontesComSucesso === 0) {
      throw new Error('Não foi possível consultar nenhuma fonte de notícias.');
    }

    const unicas = new Map();

    for (const noticia of noticias) {
      const chave = noticia.url;

      if (!unicas.has(chave)) {
        unicas.set(chave, noticia);
      }
    }

    const lista = [...unicas.values()].sort((a, b) =>
      b.data.localeCompare(a.data)
    );

    return res.status(200).json({
      sucesso: true,
      atualizado: new Date().toISOString(),
      noticias: lista
    });
  } catch (erro) {
    console.error('Erro na API de notícias:', erro);

    return res.status(502).json({
      sucesso: false,
      erro: 'Não foi possível obter notícias neste momento.',
      noticias: []
    });
  }
};