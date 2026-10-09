<?php

header('Content-Type: application/json; charset=utf-8');


// ============================================================
// CONFIGURAÇÃO
// ============================================================

// Email do clube que recebe as pré-inscrições
$emailClube = 'sampaensebasket@gmail.com';

// Remetente do email. Muitos servidores só aceitam enviar a partir de um
// endereço do próprio domínio do site. Se o email não chegar, mete aqui um
// endereço real do teu domínio (ex.: 'geral@teudominio.pt').
// Deixado vazio, usa 'no-reply@<domínio do site>'.
$remetente = '';

// Cópia de segurança de todas as pré-inscrições
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
    $valor = str_replace(["\r", "\n"], ' ', $valor); // nunca deixar quebras de linha partirem o CSV ou o email
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
// grava nem envia nada.
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

if (mb_strlen($escalao) > 120) {
    $erros[] = 'escalao';
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
// GUARDAR CÓPIA NO CSV (cria o ficheiro e o cabeçalho se não existirem)
// ============================================================

$guardou = false;
$ficheiroNovo = !file_exists($csvFile);

$fp = @fopen($csvFile, 'a');

if ($fp) {
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
        $guardou = true;
    }
    fclose($fp);
}


// ============================================================
// ENVIAR EMAIL PARA O CLUBE
// ============================================================

if ($remetente === '') {
    $host = strtolower($_SERVER['HTTP_HOST'] ?? 'localhost');
    $host = preg_replace('/:\d+$/', '', $host);          // tira a porta
    $host = preg_replace('/^www\./', '', $host);         // tira o www.
    $host = preg_replace('/[^a-z0-9.\-]/', '', $host);   // só carateres válidos
    if ($host === '') {
        $host = 'localhost';
    }
    $remetente = 'no-reply@' . $host;
}

$assunto = mb_encode_mimeheader('Pré-inscrição de sócio — ' . $nome, 'UTF-8', 'B', "\r\n");

$corpo  = "Nova pré-inscrição de sócio recebida pelo site.\r\n\r\n";
$corpo .= "Nome: " . $nome . "\r\n";
$corpo .= "Email: " . $email . "\r\n";
$corpo .= "Telefone: " . ($telefone !== '' ? $telefone : '(não indicado)') . "\r\n";
$corpo .= "Escalão pretendido: " . ($escalao !== '' ? $escalao : '(não indicado)') . "\r\n";
$corpo .= "Data: " . date('d/m/Y H:i') . "\r\n\r\n";
$corpo .= "A inscrição só fica oficial após o pagamento da quota, em mão, presencialmente no clube.\r\n";

$cabecalhos  = "From: Sampaense Basket <" . $remetente . ">\r\n";
$cabecalhos .= "Reply-To: " . $email . "\r\n";   // responder ao email vai direto para a pessoa
$cabecalhos .= "MIME-Version: 1.0\r\n";
$cabecalhos .= "Content-Type: text/plain; charset=UTF-8\r\n";
$cabecalhos .= "Content-Transfer-Encoding: 8bit\r\n";

$enviou = @mail($emailClube, $assunto, $corpo, $cabecalhos, '-f' . $remetente);


// ============================================================
// RESPOSTA
// ============================================================

if ($enviou) {
    echo json_encode(['ok' => true]);
} else {
    // O pedido fica guardado no CSV, mas o clube não foi avisado por email
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensagem' => 'Não foi possível enviar a pré-inscrição. Tenta novamente mais tarde ou contacta o clube.'
    ]);
}

?>