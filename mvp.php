<?php
// mvp.php — votação "MVP do jogo"
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const SAL        = 'MUDA-ISTO-PARA-UMA-FRASE-ALEATORIA-TUA'; // protege o hash do IP
const MAX_POR_IP = 3;                                         // famílias/wifi partilhado
const DIAS_MAX   = 4;                                         // o servidor recusa votos mais antigos
const PASTA      = __DIR__ . '/votos';

function sair($d, $c = 200) { http_response_code($c); echo json_encode($d); exit; }

$jogo = $_REQUEST['jogo'] ?? '';
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $jogo)) sair(['ok' => false, 'mensagem' => 'Jogo inválido.'], 400);

if (!is_dir(PASTA)) {
  mkdir(PASTA, 0755, true);
  file_put_contents(PASTA . '/.htaccess',
    "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
}
$ficheiro = PASTA . "/$jogo.json";

// ---- Ler resultados ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  $d = is_file($ficheiro) ? json_decode(file_get_contents($ficheiro), true) : null;
  $votos = $d['votos'] ?? [];
  sair(['ok' => true, 'votos' => $votos, 'total' => array_sum($votos)]);
}

// ---- Votar ----
$t = strtotime($jogo);
if ($t > time() || $t < time() - DIAS_MAX * 86400)
  sair(['ok' => false, 'mensagem' => 'A votação deste jogo está fechada.'], 403);

// só aceita números que existam no plantel do dados.js
preg_match_all('/numero:\s*"(\d+)"/', @file_get_contents(__DIR__ . '/js/dados.js') ?: '', $m);
$jogador = $_POST['jogador'] ?? '';
if (!in_array($jogador, $m[1], true)) sair(['ok' => false, 'mensagem' => 'Jogador inválido.'], 400);

$cookie = 'mvp_' . $jogo;
$ip = hash('sha256', SAL . ($_SERVER['REMOTE_ADDR'] ?? ''));

$fp = fopen($ficheiro, 'c+');
flock($fp, LOCK_EX);
$d = json_decode(stream_get_contents($fp), true) ?: ['votos' => [], 'ips' => []];

if (isset($_COOKIE[$cookie]) || ($d['ips'][$ip] ?? 0) >= MAX_POR_IP) {
  flock($fp, LOCK_UN); fclose($fp);
  sair(['ok' => false, 'mensagem' => 'Já votaste neste jogo.', 'votos' => $d['votos'], 'total' => array_sum($d['votos'])], 409);
}

$d['votos'][$jogador] = ($d['votos'][$jogador] ?? 0) + 1;
$d['ips'][$ip]        = ($d['ips'][$ip] ?? 0) + 1;
rewind($fp); ftruncate($fp, 0); fwrite($fp, json_encode($d));
flock($fp, LOCK_UN); fclose($fp);

setcookie($cookie, '1', ['expires' => time() + 30 * 86400, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
sair(['ok' => true, 'votos' => $d['votos'], 'total' => array_sum($d['votos'])]);