
const PAGINA_FPB = 'https://www.fpb.pt/equipa/equipa_63077/';
const NOME_CLUBE = 'Sampaense';

function limparTexto(html) {
  return decodeHTML(
    html.replace(/<[^>]*>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

function decodeHTML(texto) {
  return texto
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCodePoint(Number(n))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16))
    );
}

function converterData(texto) {
  const meses = {
    JAN: '01', FEV: '02', MAR: '03', ABR: '04',
    MAI: '05', JUN: '06', JUL: '07', AGO: '08',
    SET: '09', OUT: '10', NOV: '11', DEZ: '12'
  };

  const m = texto.toUpperCase().match(
    /(\d{1,2})\s+([A-ZÇ]{3})\s+(\d{4})/i
  );

  if (!m || !meses[m[2]]) return null;

  return `${m[3]}-${meses[m[2]]}-${m[1].padStart(2, '0')}`;
}

function processarJogos(html) {
  const cabecalhos = [
    ...html.matchAll(
      /<h[23][^>]*>\s*(\d{1,2}\s+[A-ZÇ]{3}\s+\d{4})\s*<\/h[23]>/giu
    )
  ];

  const jogos = new Map();

  for (let i = 0; i < cabecalhos.length; i++) {
    const cabecalho = cabecalhos[i];
    const dataISO = converterData(cabecalho[1]);

    if (!dataISO) continue;

    const inicio = cabecalho.index + cabecalho[0].length;
    const fim = i + 1 < cabecalhos.length
      ? cabecalhos[i + 1].index
      : html.length;

    const trecho = html.slice(inicio, fim);

    const links = [
      ...trecho.matchAll(
        /<a\b[^>]*href=["']([^"']*ficha-de-jogo\?internalID=(\d+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/giu
      )
    ];

    for (const link of links) {
      const [, href, id, bloco] = link;

      if (jogos.has(id)) continue;

      const nomes = [
        ...bloco.matchAll(/alt=["']Logo\s+([^"']+)["']/giu)
      ].map(m => limparTexto(m[1]));

      const equipas = [...new Set(nomes)];

      if (equipas.length < 2) continue;

      const equipaCasa = equipas[0];
      const equipaFora = equipas[1];

      const casa = equipaCasa.toLowerCase()
        .includes(NOME_CLUBE.toLowerCase());

      // A página consultada é a página oficial do Sampaense.
      // Ignorar blocos que não incluam o clube.
      if (
        !casa &&
        !equipaFora.toLowerCase().includes(NOME_CLUBE.toLowerCase())
      ) continue;

      const adversario = casa ? equipaFora : equipaCasa;
      const texto = limparTexto(bloco);

      let status = 'agendado';
      let hora = '00:00';
      let pontosCasa = null;
      let pontosFora = null;

      const horaMatch = texto.match(/\b(\d{1,2})H(\d{2})\b/i);
      const resultadoMatch = texto.match(
        /\b(\d{1,3})\s*[-–]\s*(\d{1,3})\b/
      );

      if (resultadoMatch) {
        status = 'terminado';
        pontosCasa = Number(resultadoMatch[1]);
        pontosFora = Number(resultadoMatch[2]);
      } else if (horaMatch) {
        hora = `${horaMatch[1].padStart(2, '0')}:${horaMatch[2]}`;
      }

      const localMatch = bloco.match(
        /<strong[^>]*>([\s\S]*?)<\/strong>/i
      );

      const competicaoMatch = texto.match(/\|\s*([^|]+)$/u);

      jogos.set(id, {
        status,
        data: `${dataISO}T${hora}`,
        adversario,
        casa,
        competicao: competicaoMatch
          ? competicaoMatch[1].trim()
          : 'FPB',
        local: localMatch
          ? limparTexto(localMatch[1])
          : null,
        pontosCasa,
        pontosFora,
        url: new URL(decodeHTML(href), PAGINA_FPB).href
      });
    }
  }

  return [...jogos.values()];
}

module.exports = async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=900, stale-while-revalidate=3600'
  );

  try {
    const resposta = await fetch(PAGINA_FPB, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Sampaense Basket Jogos'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!resposta.ok) {
      throw new Error(`A FPB respondeu com HTTP ${resposta.status}`);
    }

    const html = await resposta.text();
    const jogos = processarJogos(html);

    if (!jogos.length) {
      throw new Error(
        'Não foram encontrados jogos. A estrutura HTML da FPB pode ter mudado.'
      );
    }

    return res.status(200).json({
      sucesso: true,
      atualizado: new Date().toISOString(),
      erro: null,
      jogos
    });
  } catch (erro) {
    console.error('Erro ao consultar FPB:', erro);

    return res.status(502).json({
      sucesso: false,
      erro: 'Não foi possível obter os resultados da FPB.',
      jogos: []
    });
  }
};