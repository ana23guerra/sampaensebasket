// Verifica na página da FPB se há um jogo terminado cujas estatísticas
// ainda não foram recolhidas. Usado pelo workflow atualizar-estatisticas.
//
// Escreve em $GITHUB_OUTPUT:
//   correr   - "true" se o scraper deve correr
//   jogo     - URL da ficha do último jogo terminado
//   expirado - "true" se esse jogo já tem mais de DIAS_LIMITE dias
const fs = require('fs');
const path = require('path');
const { PAGINA_FPB, processarJogos } = require('../../api/jogos.js');

const ESTADO = path.join(__dirname, '..', 'estado-estatisticas.json');
const DIAS_LIMITE = 3;

function lerEstado() {
  try {
    return JSON.parse(fs.readFileSync(ESTADO, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saida(chave, valor) {
  console.log(`${chave}=${valor}`);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${chave}=${valor}\n`);
  }
}

async function main() {
  const forcar = process.env.FORCAR === 'true';
  let jogos = [];

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

    jogos = processarJogos(await resposta.text());
  } catch (erro) {
    // Não falhar o workflow: tenta-se outra vez na próxima hora.
    console.log(`::warning::Não foi possível consultar a FPB: ${erro.message}`);
  }

  // Os jogos terminados só têm o dia (a hora fica "00:00"),
  // por isso o último é o de data mais recente.
  const ultimo = jogos
    .filter(j => j.status === 'terminado')
    .sort((a, b) => a.data.localeCompare(b.data))
    .at(-1);

  if (!ultimo) {
    saida('correr', String(forcar));
    return;
  }

  const novo = ultimo.url !== lerEstado().ultimoJogo;
  const dias = (Date.now() - Date.parse(ultimo.data.slice(0, 10))) / 86400000;

  console.log(`Último jogo terminado: ${ultimo.data.slice(0, 10)} vs ${ultimo.adversario}`);
  saida('correr', String(novo || forcar));
  saida('jogo', ultimo.url);
  saida('expirado', String(dias > DIAS_LIMITE));
}

main();
