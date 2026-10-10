<?php
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED); 

header('Content-Type: application/json; charset=utf-8');


// ============================================================
// CONFIGURAÇÃO
// ============================================================

$cacheFile = __DIR__ . '/jogos-cache.json';

$tempoCache = 15 * 60; // 15 minutos


// Página oficial da equipa na FPB. Tem o calendário completo da época
// (casa e fora) e, assim que cada jogo termina, o resultado aparece
// no mesmo sítio onde antes estava a hora.
$paginaEquipa = 'https://www.fpb.pt/equipa/equipa_63077/';

// Como o nome do clube aparece no site da FPB (com o patrocinador:
// "Sampaense INSPECENTRO"). Usado só para decidir quem é "casa".
$nomeClubeFPB = 'Sampaense';


// ============================================================
// FUNÇÃO: obter conteúdo remoto
// ============================================================

function obterUrl($url) {

    if (function_exists('curl_init')) {

        $curl = curl_init($url);

        curl_setopt_array($curl, [

            CURLOPT_RETURNTRANSFER => true,

            CURLOPT_FOLLOWLOCATION => true,

            CURLOPT_MAXREDIRS => 5,

            CURLOPT_CONNECTTIMEOUT => 6,

            CURLOPT_TIMEOUT => 10,

            CURLOPT_USERAGENT =>
                'Mozilla/5.0 Sampaense Basket Jogos'

        ]);

        $resultado = curl_exec($curl);

        $httpCode =
            curl_getinfo(
                $curl,
                CURLINFO_HTTP_CODE
            );



        if (
            $resultado !== false &&
            $httpCode >= 200 &&
            $httpCode < 400
        ) {

            return $resultado;

        }

    }


    // Fallback
    $context = stream_context_create([

        'http' => [

            'method' => 'GET',

            'timeout' => 20,

            'header' =>
                "User-Agent: Mozilla/5.0 Sampaense Basket Jogos\r\n"

        ]

    ]);


    return @file_get_contents(
        $url,
        false,
        $context
    );

}


// ============================================================
// FUNÇÃO: limpar texto
// ============================================================

function limparTexto($texto) {

    $texto = html_entity_decode(
        strip_tags($texto),
        ENT_QUOTES | ENT_HTML5,
        'UTF-8'
    );

    $texto =
        preg_replace(
            '/\s+/u',
            ' ',
            $texto
        );

    return trim($texto);

}


// ============================================================
// FUNÇÃO: converter "26 SET 2026" em "2026-09-26"
// ============================================================

function converterDataFPB($textoData) {

    $meses = [
        'JAN' => '01', 'FEV' => '02', 'MAR' => '03', 'ABR' => '04',
        'MAI' => '05', 'JUN' => '06', 'JUL' => '07', 'AGO' => '08',
        'SET' => '09', 'OUT' => '10', 'NOV' => '11', 'DEZ' => '12'
    ];

    if (
        !preg_match(
            '/(\d{1,2})\s+([A-ZÇ]{3})\s+(\d{4})/u',
            mb_strtoupper($textoData, 'UTF-8'),
            $m
        )
    ) {
        return null;
    }

    $dia = str_pad($m[1], 2, '0', STR_PAD_LEFT);

    $mes = $meses[$m[2]] ?? null;

    if (!$mes) {
        return null;
    }

    return $m[3] . '-' . $mes . '-' . $dia;
}


// ============================================================
// FUNÇÃO: processar a página da equipa
// ============================================================
//
// A FPB não tem uma API pública, por isso lemos o HTML diretamente.
// Cada jogo é um link para uma "ficha de jogo"
// (ficha-de-jogo?internalID=...), agrupado sob um cabeçalho com a data.
// Dentro de cada link estão os emblemas das duas equipas (o nome de
// cada uma vem do atributo alt="Logo NOME"), a hora — ou já o
// resultado, quando o jogo terminou — e o pavilhão.
//
// Este scraper foi construído a observar a estrutura da página em
// setembro de 2026. Se a FPB alterar o design do site, pode ser
// preciso ajustar as expressões regulares abaixo — mas mesmo que
// isto pare de funcionar, o site continua a mostrar os jogos que
// estão escritos em js/dados.js, nunca fica em branco.
// ============================================================

function processarPaginaEquipa($html, $nomeClube) {

    if (!$html) {
        return [];
    }

    // Chave por internalID — a FPB às vezes mostra o mesmo jogo em mais
    // do que um sítio da página (ex.: um destaque "próximo jogo" e depois
    // outra vez na lista completa do calendário), por isso guardamos
    // aqui por chave única em vez de simplesmente ir acumulando.
    $jogosPorId = [];

    // Cortar o documento em blocos "data + jogos dessa data", usando os
    // cabeçalhos de data (ex.: "26 SET 2026") como pontos de corte.
    if (
        !preg_match_all(
            '/<h[23][^>]*>\s*([0-9]{1,2}\s+[A-ZÇ]{3}\s+[0-9]{4})\s*<\/h[23]>/iu',
            $html,
            $cabecalhos,
            PREG_OFFSET_CAPTURE
        )
    ) {
        return [];
    }

    foreach ($cabecalhos[0] as $indice => $ocorrencia) {

        $dataTexto = $cabecalhos[1][$indice][0];

        $inicio =
            $ocorrencia[1] + strlen($ocorrencia[0]);

        $fim =
            isset($cabecalhos[0][$indice + 1])
                ? $cabecalhos[0][$indice + 1][1]
                : $inicio + 4000; // margem de segurança para o último bloco

        $trecho = substr($html, $inicio, $fim - $inicio);

        $dataISO = converterDataFPB($dataTexto);

        if (!$dataISO) {
            continue;
        }

        // Dentro do trecho, cada jogo é um <a href="...ficha-de-jogo?internalID=...">
        if (
            !preg_match_all(
                '/<a[^>]+href="([^"]*ficha-de-jogo\?internalID=(\d+))"[^>]*>(.*?)<\/a>/is',
                $trecho,
                $blocos
            )
        ) {
            continue;
        }

        foreach ($blocos[3] as $i => $blocoHtml) {

            $internalID = $blocos[2][$i];

            $urlJogo =
                html_entity_decode(
                    $blocos[1][$i],
                    ENT_QUOTES,
                    'UTF-8'
                );

            // Nomes das equipas: vêm do alt="Logo NOME" dos emblemas.
            // A primeira equipa que aparece é sempre a equipa da casa.
            preg_match_all(
                '/alt="Logo\s+([^"]+)"/iu',
                $blocoHtml,
                $equipasM
            );

            $equipas =
                array_values(
                    array_unique(
                        array_map('trim', $equipasM[1] ?? [])
                    )
                );

            if (count($equipas) < 2) {
                continue;
            }

            $equipaCasa = $equipas[0];
            $equipaFora = $equipas[1];

            $casa =
                (mb_stripos($equipaCasa, $nomeClube, 0, 'UTF-8') !== false);

            $adversario =
                $casa ? $equipaFora : $equipaCasa;

            $textoLimpo = limparTexto($blocoHtml);

            $pontosCasa = null;
            $pontosFora = null;
            $status = 'agendado';
            $hora = '00:00';

            if (
                preg_match(
                    '/(\d{1,2})H(\d{2})/i',
                    $textoLimpo,
                    $m
                )
            ) {

                // Ainda não foi jogado: mostra a hora.
                $hora =
                    str_pad($m[1], 2, '0', STR_PAD_LEFT) .
                    ':' .
                    $m[2];

            } elseif (
                preg_match(
                    '/\b(\d{1,3})\s*[-–]\s*(\d{1,3})\b/',
                    $textoLimpo,
                    $m
                )
            ) {

                // Já foi jogado: o site mostra o resultado em vez da hora.
                $status = 'terminado';
                $pontosCasa = (int) $m[1];
                $pontosFora = (int) $m[2];

            }

            // Local: normalmente dentro de <strong>Pavilhão ,Cidade</strong>
            $local = null;

            if (
                preg_match(
                    '/<strong[^>]*>(.*?)<\/strong>/is',
                    $blocoHtml,
                    $m
                )
            ) {
                $local = limparTexto($m[1]);
            }

            // Competição: normalmente a última parte do texto,
            // depois de um "|" (ex.: "Sénior Masculino | Campeonato da Proliga").
            $competicao = 'FPB';

            if (
                preg_match(
                    '/\|\s*([^|]+)$/u',
                    $textoLimpo,
                    $m
                )
            ) {
                $competicao = trim($m[1]);
            }

            $jogo = [
                'status'     => $status,
                'data'       => $dataISO . 'T' . $hora,
                'adversario' => $adversario,
                'casa'       => $casa,
                'competicao' => $competicao,
                'local'      => $local,
                'pontosCasa' => $pontosCasa,
                'pontosFora' => $pontosFora,
                'url'        => $urlJogo
            ];

            // O mesmo jogo aparece em várias secções da página da FPB
            // (Resultados, Calendário, Próximo Jogo...). Se a primeira
            // aparição não tem hora nem resultado, aceita a seguinte que tenha.
            if (isset($jogosPorId[$internalID])) {

                $anterior = $jogosPorId[$internalID];

                $anteriorSemInfo =
                    $anterior['status'] === 'agendado' &&
                    substr($anterior['data'], -5) === '00:00';

                $novoTemInfo =
                    $jogo['status'] === 'terminado' ||
                    substr($jogo['data'], -5) !== '00:00';

                if (!($anteriorSemInfo && $novoTemInfo)) {
                    continue;
                }

            }

            $jogosPorId[$internalID] = $jogo;

        }

    }

    return array_values($jogosPorId);
}


// ============================================================
// LER CACHE EXISTENTE
// ============================================================

$cache = [];
$ultimaAtualizacao = 0;

if (file_exists($cacheFile)) {

    $conteudo = @file_get_contents($cacheFile);

    if ($conteudo) {

        $dadosCache = json_decode($conteudo, true);

        if (is_array($dadosCache)) {
            $cache = $dadosCache;
        }

    }

    $ultimaAtualizacao = filemtime($cacheFile);

}

$precisaAtualizar =
    !$ultimaAtualizacao ||
    (time() - $ultimaAtualizacao > $tempoCache);


// ============================================================
// ATUALIZAR, SE NECESSÁRIO
// ============================================================

$erro = null;

if ($precisaAtualizar) {

    $html = obterUrl($paginaEquipa);

    if ($html) {

        $novosJogos =
            processarPaginaEquipa(
                $html,
                $nomeClubeFPB
            );

        if (!empty($novosJogos)) {

            $cache = $novosJogos;

            @file_put_contents(
                $cacheFile,
                json_encode(
                    $cache,
                    JSON_PRETTY_PRINT |
                    JSON_UNESCAPED_UNICODE |
                    JSON_UNESCAPED_SLASHES
                ),
                LOCK_EX
            );

        } else {

            // A página respondeu mas não reconhecemos nenhum jogo —
            // mantemos o cache anterior (ou o vazio) e avisamos o site.
            $erro = 'A página da FPB não devolveu jogos reconhecíveis.';

        }

    } else {

        $erro = 'Não foi possível contactar o site da FPB.';

    }

}


// ============================================================
// DEVOLVER JSON
// ============================================================

echo json_encode(

    [
        'sucesso'    => true,

        'atualizado' => date('Y-m-d H:i:s'),

        'erro'       => $erro,

        'jogos'      => $cache
    ],

    JSON_UNESCAPED_UNICODE |
    JSON_UNESCAPED_SLASHES

);

?>