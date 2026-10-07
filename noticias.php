<?php

header('Content-Type: application/json; charset=utf-8');


// ============================================================
// CONFIGURAÇÃO
// ============================================================

$cacheFile = __DIR__ . '/noticias-cache.json';

$tempoCache = 3 * 24 * 60 * 60; // 3 dias


// ============================================================
// FONTES
// ============================================================
//
// Usamos pesquisas do Google News RSS limitadas aos sites
// pretendidos. Assim não precisamos de copiar o conteúdo
// integral dos artigos.
//
// O site mostra apenas:
// - título
// - data
// - fonte
// - pequeno resumo
// - ligação para o artigo original
//
// O leitor lê o artigo no site original.
// ============================================================

$fontes = [

    [
        'nome' => 'Diário de Coimbra',

        'query' =>
            'site:diariocoimbra.pt "Sampaense" OR "Sampaense Basket"',

        'categoria' => 'Diário de Coimbra'
    ],

    [
        'nome' => 'Rádio Boa Nova',

        'query' =>
            'site:radioboanova.pt "Sampaense" OR "Sampaense Basket"',

        'categoria' => 'Rádio Boa Nova'
    ],

    [
        'nome' => 'FPB',

        'query' =>
            'site:fpb.pt "Sampaense" "Basket"',

        'categoria' => 'FPB'
    ],

    [
        'nome' => 'Diário As Beiras',

        'query' =>
            'site:asbeiras.pt "Sampaense" OR "Sampaense Basket"',

        'categoria' => 'Diário As Beiras'
    ],

    [
        'nome' => 'A Bola',

        'query' =>
            'site:abola.pt "Sampaense Basket"',

        'categoria' => 'A Bola'
    ],

    [
        'nome' => 'Record',

        'query' =>
            'site:record.pt "Sampaense Basket"',

        'categoria' => 'Record'
    ]

];


// ============================================================
// FUNÇÃO: gerar URL do Google News RSS
// ============================================================

function criarFeedUrl($query) {

    return
        'https://news.google.com/rss/search?q=' .
        urlencode($query) .
        '&hl=pt-PT' .
        '&gl=PT' .
        '&ceid=PT:pt-150';

}


// ============================================================
// FUNÇÃO: obter vários URLs ao mesmo tempo (em paralelo)
// ============================================================
//
// Antes, cada fonte (Diário de Coimbra, FPB, etc.) era pedida uma
// a seguir à outra — se tivéssemos 6 fontes e cada uma demorasse
// até ao tempo-limite, podíamos estar à espera minutos. Com
// curl_multi, pedimos a todas ao mesmo tempo: o tempo total passa
// a ser (no pior caso) o da fonte mais lenta, não a soma de todas.
// ============================================================

function obterUrlsEmParalelo($urls) {

    $multi = curl_multi_init();
    $handles = [];

    foreach ($urls as $chave => $url) {

        $curl = curl_init($url);

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_CONNECTTIMEOUT => 6,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT =>
                'Mozilla/5.0 Sampaense Basket Noticias',
            CURLOPT_HTTPHEADER => [
                'Accept: application/rss+xml, application/xml, text/xml'
            ]
        ]);

        curl_multi_add_handle($multi, $curl);
        $handles[$chave] = $curl;
    }

    $ativos = null;
    do {
        $estado = curl_multi_exec($multi, $ativos);
        if ($ativos) {
            curl_multi_select($multi, 1);
        }
    } while ($ativos && $estado === CURLM_OK);

    $resultados = [];

    foreach ($handles as $chave => $curl) {

        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $corpo = curl_multi_getcontent($curl);

        $resultados[$chave] =
            ($corpo !== false && $httpCode >= 200 && $httpCode < 400)
                ? $corpo
                : false;

        curl_multi_remove_handle($multi, $curl);
        curl_close($curl);
    }

    curl_multi_close($multi);

    return $resultados;
}


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

            CURLOPT_CONNECTTIMEOUT => 10,

            CURLOPT_TIMEOUT => 20,

            CURLOPT_USERAGENT =>
                'Mozilla/5.0 Sampaense Basket Noticias',

            CURLOPT_HTTPHEADER => [
                'Accept: application/rss+xml, application/xml, text/xml'
            ]

        ]);

        $resultado = curl_exec($curl);

        $httpCode =
            curl_getinfo(
                $curl,
                CURLINFO_HTTP_CODE
            );

        curl_close($curl);


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
                "User-Agent: Mozilla/5.0 Sampaense Basket Noticias\r\n" .
                "Accept: application/rss+xml, application/xml, text/xml\r\n"

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
// FUNÇÃO: criar resumo
// ============================================================

function criarResumo($texto, $limite = 220) {

    $texto = limparTexto($texto);

    if (
        function_exists('mb_strlen') &&
        mb_strlen($texto, 'UTF-8') > $limite
    ) {

        return
            mb_substr(
                $texto,
                0,
                $limite,
                'UTF-8'
            ) . '...';

    }


    if (strlen($texto) > $limite) {

        return
            substr(
                $texto,
                0,
                $limite
            ) . '...';

    }


    return $texto;

}


// ============================================================
// FUNÇÃO: ler feed
// ============================================================

function lerFeed(
    $xmlTexto,
    $fonte,
    $categoria
) {

    if (!$xmlTexto) {
        return [];
    }


    libxml_use_internal_errors(true);


    $xml = simplexml_load_string(
        $xmlTexto
    );


    if (!$xml) {
        return [];
    }


    $resultado = [];


    // --------------------------------------------------------
    // RSS normal
    // --------------------------------------------------------

    if (isset($xml->channel->item)) {

        foreach (
            $xml->channel->item as $item
        ) {

            $titulo =
                limparTexto(
                    (string)$item->title
                );


            $link =
                trim(
                    (string)$item->link
                );


            $descricao =
                criarResumo(
                    (string)$item->description
                );


            $dataOriginal =
                trim(
                    (string)$item->pubDate
                );


            $timestamp =
                strtotime($dataOriginal);


            if (!$timestamp) {
                continue;
            }


            $data =
                date(
                    'Y-m-d',
                    $timestamp
                );


            if (!$titulo || !$link) {
                continue;
            }


            // Evitar notícias que não sejam realmente
            // relevantes para o Sampaense.
            $textoPesquisa =
                strtolower(
                    $titulo . ' ' . $descricao
                );


            if (
                strpos(
                    $textoPesquisa,
                    'sampaense'
                ) === false
            ) {
                continue;
            }


            $id =
                sha1(
                    $link
                );


            $resultado[] = [

                'id' => $id,

                'data' => $data,

                'categoria' => $categoria,

                'fonte' => $fonte,

                'titulo' => $titulo,

                'resumo' =>
                    $descricao
                    ?: 'Notícia sobre o Sampaense Basket.',

                'url' => $link,

                'texto' =>
                    $descricao

            ];

        }

    }


    return $resultado;

}


// ============================================================
// LER CACHE EXISTENTE
// ============================================================

$cache = [];


if (file_exists($cacheFile)) {

    $conteudo =
        @file_get_contents(
            $cacheFile
        );


    if ($conteudo) {

        $dadosCache =
            json_decode(
                $conteudo,
                true
            );


        if (
            is_array($dadosCache)
        ) {

            $cache =
                $dadosCache;

        }

    }

}


// ============================================================
// VERIFICAR SE PRECISAMOS DE ATUALIZAR
// ============================================================

$ultimaAtualizacao = 0;


if (file_exists($cacheFile)) {

    $ultimaAtualizacao =
        filemtime($cacheFile);

}


$precisaAtualizar =
    !$ultimaAtualizacao ||
    (
        time() - $ultimaAtualizacao
        > $tempoCache
    );


// ============================================================
// PESQUISAR FONTES
// ============================================================

if ($precisaAtualizar) {

    // Construir o URL do feed de cada fonte.
    $feedUrls = [];

    foreach ($fontes as $indice => $fonte) {
        $feedUrls[$indice] = criarFeedUrl($fonte['query']);
    }

    // Pedir a TODAS as fontes ao mesmo tempo (ver
    // obterUrlsEmParalelo acima) em vez de uma a uma.
    $respostas = obterUrlsEmParalelo($feedUrls);

    foreach (
        $fontes as $indice => $fonte
    ) {

        $noticiasFonte =
            lerFeed(
                $respostas[$indice] ?? false,
                $fonte['nome'],
                $fonte['categoria']
            );


        if (
            !empty($noticiasFonte)
        ) {

            $cache =
                array_merge(
                    $cache,
                    $noticiasFonte
                );

        }

    }


    // --------------------------------------------------------
    // Remover duplicados
    // --------------------------------------------------------

    $unicas = [];


    foreach (
        $cache as $noticia
    ) {

        $id =
            $noticia['id']
            ?? sha1(
                $noticia['url']
                ?? $noticia['titulo']
                ?? uniqid()
            );


        $noticia['id'] = $id;


        $unicas[$id] =
            $noticia;

    }


    $cache =
        array_values(
            $unicas
        );


    // --------------------------------------------------------
    // Ordenar
    // --------------------------------------------------------

    usort(
        $cache,
        function ($a, $b) {

            return strcmp(
                $b['data'] ?? '',
                $a['data'] ?? ''
            );

        }
    );


    // --------------------------------------------------------
    // Guardar permanentemente
    // --------------------------------------------------------

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

}


// ============================================================
// DEVOLVER JSON
// ============================================================

echo json_encode(

    [
        'sucesso' => true,

        'atualizado' =>
            date(
                'Y-m-d H:i:s'
            ),

        'noticias' =>
            $cache

    ],

    JSON_UNESCAPED_UNICODE |
    JSON_UNESCAPED_SLASHES

);

?>