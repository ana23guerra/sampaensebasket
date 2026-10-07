<?php

header('Content-Type: application/json; charset=utf-8');


// ============================================================
// CONFIGURAÇÃO
// ============================================================

$csvFile = __DIR__ . '/socios-dados.csv';

$camposCSV = ['data_hora', 'nome', 'email', 'telefone', 'escalao'];


// ============================================================
// SÓ ACEITA POST
// ============================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}


// ============================================================
// LER E LIMPAR OS DADOS DO FORMULÁRIO
// ============================================================

function limpar($valor) {
    $valor = trim((string) $valor);
    $valor = str_replace(["\r", "\n"], ' ', $valor); // nunca deixar quebras de linha partirem o CSV
    return $valor;
}

$nome     = limpar($_POST['nome'] ?? '');
$email    = limpar($_POST['email'] ?? '');
$telefone = limpar($_POST['telefone'] ?? '');
$escalao  = limpar($_POST['escalao'] ?? '');
$website  = limpar($_POST['website'] ?? ''); // campo-armadilha anti-spam
$rgpd     = $_POST['rgpd'] ?? '';


// ============================================================
// ANTI-SPAM: o campo "website" é invisível para pessoas —
// só um robot o preenche. Se vier preenchido, finge que correu
// bem (para o robot não perceber que foi apanhado) mas não
// grava nada.
// ============================================================

if ($website !== '') {
    echo json_encode(['ok' => true]);
    exit;
}


// ============================================================
// VALIDAÇÃO
// ============================================================

$erros = [];

if ($nome === '' || mb_strlen($nome) > 120) {
    $erros[] = 'nome';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 160) {
    $erros[] = 'email';
}

if ($telefone !== '' && mb_strlen($telefone) > 30) {
    $erros[] = 'telefone';
}

if ($rgpd !== '1') {
    $erros[] = 'rgpd';
}

if (!empty($erros)) {
    echo json_encode([
        'ok' => false,
        'mensagem' => 'Preenche corretamente todos os campos obrigatórios e aceita o tratamento de dados.',
        'campos' => $erros
    ]);
    exit;
}


// ============================================================
// GUARDAR NO CSV (cria o ficheiro e o cabeçalho se ainda não existirem)
// ============================================================

$ficheiroNovo = !file_exists($csvFile);

$fp = fopen($csvFile, 'a');

if (!$fp) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensagem' => 'Não foi possível guardar. Tenta novamente.']);
    exit;
}

if (flock($fp, LOCK_EX)) {

    if ($ficheiroNovo) {
        fputcsv($fp, $camposCSV, ',', '"', '\\');
    }

    fputcsv($fp, [
        date('Y-m-d H:i:s'),
        $nome,
        $email,
        $telefone,
        $escalao
    ], ',', '"', '\\');

    flock($fp, LOCK_UN);

}

fclose($fp);


// ============================================================
// RESPOSTA
// ============================================================

echo json_encode(['ok' => true]);

?>