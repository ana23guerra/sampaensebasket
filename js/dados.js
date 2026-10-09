/* ======================================================================
   DADOS DO SITE — edita só este ficheiro para atualizar o conteúdo.


   Datas no formato "AAAA-MM-DDTHH:MM" (ano-mês-dia T hora:minuto).
   ====================================================================== */
const DADOS = {

  clube: {
    nome: "Sampaense Basket",
    nomeCompleto: "Sociedade Recreativa Lealdade Sampaense",
    localidade: "Oliveira do Hospital",
    morada: "Pavilhão Comendador Serafim Marques, São Paio de Gramaços, Oliveira do Hospital",
    treinador: "Cláudio Figueiredo",
    telefone: "912311920",       
    email: "sampaensebasket@gmail.com",        
    emailSocios: "sampaensebasket@gmail.com",     // email para onde os pedidos de sócio devem ser enviados (pode ser igual ao acima)
    instagram: "https://www.instagram.com/sampaensebasket/",       // preenche com o link oficial, se existir
    facebook: "https://www.facebook.com/sampaensebasket/",        // preenche com o link oficial, se existir
    web3formsKey: ""   // chave do Web3Forms (pré-inscrições de sócio por email) — ver instruções
  },

  // status: "agendado" (ainda não jogado) ou "terminado" (já tem resultado)
  // Calendário oficial retirado de https://www.fpb.pt/calendario/11441/
  // (Campeonato da Proliga 2026/2027 - Sénior) em 24/09/2026. A página da
 
  jogos: [
    { status: "terminado", data: "2026-09-27T00:00", adversario: "União de Leiria", casa: false, competicao: "V Torneio AB Coimbra", pontosCasa: 44, pontosFora: 94 },
    { status: "agendado", data: "2026-10-03T18:30", adversario: "SC Vasco da Gama", casa: false, competicao: "Proliga 2026/2027 · Jornada 1", local: "Parque das Camélias, Porto" },
    { status: "agendado", data: "2026-10-10T16:30", adversario: "Sangalhos DC / CRB", casa: true, competicao: "Proliga 2026/2027 · Jornada 2" },
    { status: "agendado", data: "2026-10-18T15:00", adversario: "SL Benfica B", casa: false, competicao: "Proliga 2026/2027 · Jornada 3", local: "Pavilhão Fidelidade, Lisboa" },
    { status: "agendado", data: "2026-10-24T16:30", adversario: "Illiabum Clube Margres", casa: true, competicao: "Proliga 2026/2027 · Jornada 4" }
  ],

  // Plantel sénior masculino 2026/2027. Números e posições confirmados

  // CAMPO "foto": caminho para a fotografia do jogador (ex.: "assets/jogadores/miguel-bastos.webp").

  // dentro de assets/jogadores/ e escrever o caminho aqui.
  // Ficha de cada jogador (abre ao clicar no cartão). Campos opcionais:
  // nacionalidade, origem (de onde vem), ultimoClube, altura (ex.: "1,95 m"),
  // Os que ficarem vazios aparecem como "Por confirmar".
plantel: [

  { numero: "2", nome: "Markus Terry", posicao: "Base", foto: "assets/jogadores/markus.webp", nacionalidade: "Americana", origem: "Geórgia", ultimoClube: "Sampaense Basket", altura: "188cm" },

  { numero: "3", nome: "Tiago Espada", posicao: "Extremo", foto: "assets/jogadores/espada.webp", nacionalidade: "Portuguesa", origem: "Figueira da Foz", ultimoClube: "Ginásio Clube Figueirense", altura: "178cm" },

  { numero: "5", nome: "Tay Hall", posicao: "Poste", foto: "assets/jogadores/tay.webp", nacionalidade: "Americana", origem: "Nova York", ultimoClube: "Sampaense Basket", altura: "195cm" },

  { numero: "6", nome: "Afonso Silva", posicao: "Extremo", foto: "assets/jogadores/silva.webp", nacionalidade: "Portuguesa", origem: "Oliveira do Hospital", ultimoClube: "Sampaense Basket", altura: "180cm" },

  { numero: "7", nome: "Mauro Tavares", posicao: "Extremo", foto: "assets/jogadores/mauro.webp", nacionalidade: "Portuguesa", origem: "Cabo Verde", ultimoClube: "Ginásio Clube Olhanense", altura: "185cm" },

  { numero: "8", nome: "Diogo Gonçalves", posicao: "Extremo", capitao: true, foto: "assets/jogadores/diogo.webp", nacionalidade: "Portuguesa", origem: "Lisboa", ultimoClube: "Sampaense Basket", altura: "200cm" },

  { numero: "9", nome: "Adam Nongo", posicao: "Poste", foto: "assets/jogadores/nongo.webp", nacionalidade: "Congolês", origem: "Congo", ultimoClube: "ABA", altura: "198cm" },

  { numero: "11", nome: "Modou Mbop", posicao: "Poste", foto: "assets/jogadores/modou.webp", nacionalidade: "Senegalês", origem: "Senegal", ultimoClube: "ABA", altura: "204cm" },

  { numero: "12", nome: "Pedro Abrantes", posicao: "Base", foto: "assets/jogadores/pedro.webp", nacionalidade: "Portuguesa", origem: "Oliveira do Hospital", ultimoClube: "Sampaense Basket", altura: "175cm" },

  { numero: "13", nome: "Jahlin Smith", posicao: "Extremo", foto: "assets/jogadores/jay.webp", nacionalidade: "Americana", origem: "Los Angeles", ultimoClube: "Sampaense Basket", altura: "190cm" },

  { numero: "80", nome: "Afonso Pereira", posicao: "Base", foto: "assets/jogadores/pereira.webp", nacionalidade: "Portuguesa", origem: "Oliveira do Hospital", ultimoClube: "Sampaense Basket", altura: "178cm" },

  { numero: "95", nome: "Nuno Barbosa", posicao: "Extremo", foto: "assets/jogadores/barbosa.webp", nacionalidade: "Portuguesa", origem: "Póvoa de Varzim", ultimoClube: "Clube Desportivo da Póvoa", altura: "184cm" },

  { numero: "99", nome: "Denilson Tavares", posicao: "Base", foto: "assets/jogadores/denilson.webp", nacionalidade: "Portuguesa", origem: "Cabo Verde", ultimoClube: "Lusitânia Futebol Clube", altura: "190cm" }

],
  // Para já são placeholders visuais — quando tiveres fotos reais, troca o
  // bloco "marcador" na função criarFoto() de js/site.js por uma tag <img src="...">.
  galeria: [
  {
    legenda: "",
    foto: "assets/galeria/all.webp"
  },
  {
    legenda: "",
    foto: "assets/galeria/grito.webp"
  },
  {
    legenda: "",
    foto: "assets/galeria/equipa.webp"
  },
  {
    legenda: "",
    foto: "assets/galeria/bancada.webp"
  },
  {
    legenda: "",
    foto: "assets/galeria/ultimolancedojogo.webp"
  }
],

  // Fotos antigas do clube — a diferença para a "galeria" é só essa:
  // galeria = recente, arquivo = antigo. Mesmo formato de dados.
  // Troca "foto" pelo caminho real quando tiveres as imagens digitalizadas.
  arquivo: [
    { foto: "assets/arquivo/alext.jpg" },
    { foto: "assets/arquivo/ahahahahha.jpg" },
    { foto: "assets/arquivo/bues.jpg" },
    { foto: "assets/arquivo/figueira.jpg" },
    { foto: "assets/arquivo/alex.jpg" },
    { foto: "assets/arquivo/enesse.jpg" },
    { foto: "assets/arquivo/seco2.jpg" },
    { foto: "assets/arquivo/ahaha.jpg" },
    { foto: "assets/arquivo/20162.jpg" },
    { foto: "assets/arquivo/ubi.jpg" },
    { foto: "assets/arquivo/canta.jpg" },
    { foto: "assets/arquivo/fofo.jpg" },
    { foto: "assets/arquivo/mohvete.jpg" },
    { foto: "assets/arquivo/2016.jpg" },
    { foto: "assets/arquivo/201718.jpg" },
    { foto: "assets/arquivo/2018.jpg" },
    { foto: "assets/arquivo/ui.jpg" },
    { foto: "assets/arquivo/campeoes.jpg" },
    { foto: "assets/arquivo/99.jpg" },
    { foto: "assets/arquivo/2011.jpg" },
    { foto: "assets/arquivo/1999.jpg" },
    { foto: "assets/arquivo/20134.jpg" },
    { foto: "assets/arquivo/2013.jpg" },
    { foto: "assets/arquivo/3campeoes.jpg" },
    { foto: "assets/arquivo/equipa2021.jpg" },
    { foto: "assets/arquivo/minisseniores.jpg" },
    { foto: "assets/arquivo/torneio_18.jpg" },
    { foto: "assets/arquivo/dia da mae.jpg" },
    { foto: "assets/arquivo/minisss.jpg" },
    { foto: "assets/arquivo/2023.jpg" },
    { foto: "assets/arquivo/torneio.jpg" },
    { foto: "assets/arquivo/mancha.jpg" },
    { foto: "assets/arquivo/seco.jpg" },
    { foto: "assets/arquivo/miudos.jpg" },
    { foto: "assets/arquivo/blitz.jpg" },
    { foto: "assets/arquivo/old.jpg" },
    { foto: "assets/arquivo/diadopai.jpg" },
    { foto: "assets/arquivo/bento.jpg" },
    { foto: "assets/arquivo/minis.jpg" },
    { foto: "assets/arquivo/campus2025.jpg" },
    { foto: "assets/arquivo/final4.jpg" },
    { foto: "assets/arquivo/a.jpg" },
    { foto: "assets/arquivo/bueee.jpg" },
    { foto: "assets/arquivo/escola.jpg" },
    { foto: "assets/arquivo/ton.jpg" },
    { foto: "assets/arquivo/oli.jpg" },
    { foto: "assets/arquivo/111111.jpg" },
    { foto: "assets/arquivo/111.jpg" },
    { foto: "assets/arquivo/ll.jpg" },
    { foto: "assets/arquivo/aaa.jpg" },
    { foto: "assets/arquivo/liga.jpg" },
    { foto: "assets/arquivo/lig.jpg" },
    { foto: "assets/arquivo/minini.jpg" },
    { foto: "assets/arquivo/dssds.jpg" },
    { foto: "assets/arquivo/5ideal.jpg" },
    { foto: "assets/arquivo/tabua.jpg" },
    { foto: "assets/arquivo/vaquitas.jpg" },
    { foto: "assets/arquivo/girls.jpg" },
    { foto: "assets/arquivo/all.jpg" },
    { foto: "assets/arquivo/fita.jpg" },
    { foto: "assets/arquivo/linda.jpg" },
    { foto: "assets/arquivo/ahahaha.jpg" },
    { foto: "assets/arquivo/helder.jpg" }
  ],
// As notícias já não são escritas à mão aqui — vêm automaticamente
// do noticias.php (Diário de Coimbra, Rádio Boa Nova, FPB). Este
// array fica vazio de propósito.
noticias: [
],

  parceiros: [
    {
      nome: "Município de Oliveira do Hospital",
      logo: "assets/parceiros/municipio.png",
      url: "https://www.cm-oliveiradohospital.pt/"
    },
    {
      nome: "Inspecentro",
      logo: "assets/parceiros/aaa.png",
      url: "https://www.cima-sa.pt/"
    },
    {
      nome: "Sonae Arauco",
      logo: "assets/parceiros/sonae.png",
      url: "https://www.sonaearauco.com/pt/"
    },
    {
      nome: "Olisei",
      logo: "assets/parceiros/olisei.png",
      url: "https://www.facebook.com/p/Olisei-Ant%C3%B3nio-Maria-Veloso-C%C2%AA-SA-100077600972171/?locale=pt_PT"
    },
    {
      nome: "Construtora Nogueirense",
      logo: "assets/parceiros/construtora.png",
      url: "https://www.facebook.com/p/A-Construtora-Nogueirense-Lda-100065039019530/?locale=pt_PT"
    },
    {
      nome: "Bufalus Bar",
      logo: "assets/parceiros/bufalus.png",
      url: "https://www.instagram.com/bufalusbar/"
    },
    {
      nome: "Era",
      logo: "assets/parceiros/era_ohp.png",
      url: "https://www.era.pt/imoveis/agencia/oliveiradohospital?ord=3&ir=1&nr=0&page=1"
    },
    {
      nome: "Tecidos de Coimbra",
      logo: "assets/parceiros/tecidos.png",
      url: "https://www.facebook.com/TecidosCoimbra/?locale=pt_PT"
    },
    {
      nome: "Sons das Pétalas",
      logo: "assets/parceiros/petalas.png",
      url: "https://www.facebook.com/p/Sons-das-P%C3%A9talas-Unipessoal-LDA-100063855705442/?locale=pt_PT"
    },
    {
      nome: "Restaurante O Dinis",
      logo: "assets/parceiros/dinis.png",
      url: "https://www.facebook.com/restauranteodinis/?locale=pt_PT"
    },
    {
      nome: "Mota Seguros",
      logo: "assets/parceiros/mota.png",
      url: "https://www.facebook.com/motaseguros/locale/pt_PT"
    }
  ],


  // Horários da formação (aba "Formação" no menu). Formato "início–fim"; deixa "" se não há treino nesse dia.
  formacao: {
    intro: "Horários de treino de todos os escalões de formação do Sampaense Basket.",
    local: "Pavilhão Comendador Serafim Marques",
    dias: ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB"],
    escaloes: [
      { nome: "Mini Basket", genero: "",          horarios: { QUA: "18:00–19:30", SÁB: "10:00–11:30" } },
      { nome: "S14",         genero: "Masculino", horarios: { SEG: "18:00–19:15", QUI: "18:00–19:30", SÁB: "11:30–13:00" } },
      { nome: "S16/18",      genero: "Feminino",  horarios: { SEG: "18:00–19:15", TER: "18:00–19:30", QUI: "19:30–21:00", SÁB: "11:30–13:00" } },
      { nome: "S16",         genero: "Masculino", horarios: { TER: "19:30–21:00", QUA: "19:30–21:00", SEX: "18:30–19:45" } },
      { nome: "S18",         genero: "Masculino", horarios: { SEG: "19:15–20:30", QUA: "19:30–21:00", SEX: "19:45–21:00" } }
    ]
  },

  historia: {
    intro: "Palmarés e marcos do Sampaense Basket.",

    // Do mais antigo para o mais recente.
    cronologia: [
      { ano: "2000/01", titulo: "Campeão Nacional da 2.ª Divisão", texto: "Subida à 1.ª Divisão Nacional." },
      { ano: "2003/06", titulo: "Três títulos consecutivos da Proliga", texto: "Campeão da Proliga em 2003/04, 2004/05 e 2005/06." },
      { ano: "2003/07", titulo: "Quatro finais consecutivas da Proliga", texto: "Final disputada em quatro épocas seguidas; em 2006/07 ficou o vice-campeonato." },
      { ano: "2008/09", titulo: "Finalista da Proliga e subida à Liga", texto: "Vice-campeão da Proliga e subida à Liga Portuguesa de Basquetebol." },
      { ano: "2011/13", titulo: "Duas meias-finais da Taça de Portugal", texto: "Presença na Final 8 da Taça de Portugal em 2011/12 e 2012/13, chegando às meias-finais em ambas." },
      { ano: "2013/14", titulo: "3.º lugar na Liga e final do Troféu António Pratas", texto: "Meias-finais dos playoffs da Liga, terminando em 3.º lugar. No Troféu António Pratas, eliminou o Benfica nas meias-finais e perdeu a final com a Ovarense por 62–65, a primeira final oficial de uma competição da Liga." },
    ],

    // Títulos nacionais
    titulos: [
      { competicao: "Campeão Nacional da 2.ª Divisão", epoca: "2000/01" },
      { competicao: "Campeão da Proliga", epoca: "2003/04" },
      { competicao: "Campeão da Proliga", epoca: "2004/05" },
      { competicao: "Campeão da Proliga", epoca: "2005/06" }
    ],

    // Outros resultados de destaque (icone opcional: 🥈 🥉 🏀)
    destaques: [
      { icone: "🥈", competicao: "Proliga — Vice-campeão", epoca: "2006/07" },
      { icone: "🥈", competicao: "Proliga — Vice-campeão (subida à Liga)", epoca: "2008/09" },
      { icone: "🏀", competicao: "Taça de Portugal — Meias-finais", epoca: "2011/12" },
      { icone: "🏀", competicao: "Taça de Portugal — Meias-finais", epoca: "2012/13" },
      { icone: "🥉", competicao: "Liga Portuguesa — 3.º lugar", epoca: "2013/14" },
      { icone: "🥈", competicao: "Troféu António Pratas — Finalista", epoca: "2013/14" }
    ],

    pavilhao: { nome: "Pavilhão Comendador Serafim Marques", texto: "" },
    figuras: []
  },

  // Informação da secção "Sócio". Os valores de quotas são exemplos —
  // substitui pelos valores reais definidos pela direção do clube.
  socio: {
    intro: "Torna-te sócio do Sampaense Basket e ajuda a fazer crescer o basquetebol em Oliveira do Hospital.",
    // Aviso de pagamento (aparece por cima do formulário e no email do pedido).
    pagamento: {
      titulo: "Pagamento presencial",
      texto: "Preenche o formulário para pré-inscrição. A inscrição só fica oficial após o pagamento da quota, feito em mão, presencialmente no clube.",
      local: "Pavilhão Comendador Serafim Marques, São Paio de Gramaços"
    },
    escaloes: [
      { nome: "Sócio", preco: "15 €/ano", beneficios: "Entrada gratuita em jogos de casa da Proliga" }
    ],
  }
};