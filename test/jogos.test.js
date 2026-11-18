// Testa o parser de api/jogos.js com uma cópia guardada da página da FPB
// (test/fixtures/fpb-equipa.html). Para atualizar a cópia:
//   curl -A "Mozilla/5.0" https://www.fpb.pt/equipa/equipa_63077/ -o test/fixtures/fpb-equipa.html
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { processarJogos } = require('../api/jogos.js');

const html = fs.readFileSync(path.join(__dirname, 'fixtures', 'fpb-equipa.html'), 'utf8');
const jogos = processarJogos(html);

test('lê o calendário da época', () => {
  assert.ok(jogos.length > 0, 'nenhum jogo encontrado');
});

test('cada jogo tem os campos que o site usa', () => {
  for (const j of jogos) {
    assert.match(j.data, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, `data inválida: ${j.data}`);
    assert.ok(['terminado', 'agendado'].includes(j.status), `status inválido: ${j.status}`);
    assert.ok(j.adversario, 'jogo sem adversário');
    assert.ok(!/sampaense/i.test(j.adversario), 'o adversário não pode ser o próprio clube');
    assert.strictEqual(typeof j.casa, 'boolean');
    assert.match(j.url, /ficha-de-jogo\?internalID=\d+/);
  }
});

test('jogos terminados têm resultado, agendados não', () => {
  for (const j of jogos) {
    if (j.status === 'terminado') {
      assert.ok(Number.isInteger(j.pontosCasa) && Number.isInteger(j.pontosFora));
    } else {
      assert.strictEqual(j.pontosCasa, null);
      assert.strictEqual(j.pontosFora, null);
    }
  }
  assert.ok(jogos.some(j => j.status === 'terminado'), 'nenhum jogo terminado');
});

test('não há jogos repetidos', () => {
  const urls = jogos.map(j => j.url);
  assert.strictEqual(new Set(urls).size, urls.length);
});

test('HTML vazio não rebenta', () => {
  assert.deepStrictEqual(processarJogos(''), []);
});
