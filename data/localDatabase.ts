/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapPlace, PregnancyWeek, Recipe, SoundTrack } from '../types';

// --- AUDIO DATABASE ---
export const COMFORT_PHRASES_DB = [
  "Calma pais, respirem fundo. O bebê sente a segurança de vocês.",
  "Vocês estão fazendo um ótimo trabalho. Já estamos chegando.",
  "Mantenha a atenção no trânsito, eu estou monitorando o trajeto.",
  "Vai ficar tudo bem. A equipe médica já está preparada para receber vocês.",
  "Seu amor é o melhor remédio agora. Continue transmitindo calma.",
  "Estamos na rota mais rápida e segura. Confie no processo."
];

// --- RECIPE DATABASE (OFFLINE) ---
export const RECIPES_DB: Record<string, Recipe> = {
  "colica": {
    title: "Chazinho Anti-Cólica Natural",
    description: "Uma infusão suave para acalmar a barriguinha do bebê.",
    ingredients: ["1 colher de chá de funcho", "1 xícara de água fervente", "Muito amor"],
    instructions: ["Ferva a água", "Adicione o funcho", "Aguarde 5 min", "Coe e espere amornar bem"],
    benefits: "O funcho ajuda a relaxar o intestino e eliminar gases."
  },
  "dormir": {
    title: "Ritual do Soninho (Chá de Camomila)",
    description: "Bebida relaxante para mãe e bebê (se já introduzido).",
    ingredients: ["Flores de camomila secas", "Água filtrada"],
    instructions: ["Faça a infusão por 10 min", "Deixe esfriar", "Ofereça em temperatura ambiente"],
    benefits: "Propriedades calmantes naturais que induzem o sono."
  },
  "leite": {
    title: "Suco Turbinador de Leite",
    description: "Hidratação potente para mamães que amamentam.",
    ingredients: ["Água de coco", "Uva verde", "Hortelã"],
    instructions: ["Bata tudo no liquidificador", "Beba sem coar para aproveitar as fibras"],
    benefits: "Aumenta a hidratação e fornece energia rápida."
  }
};

// --- LOCATIONS DATABASE (OFFLINE FALLBACK) ---
export const PLACES_DB: MapPlace[] = [
  {
    id: "hosp_1",
    name: "Hospital Maternidade Modelo",
    address: "Av. Principal, 1000 - Centro",
    rating: 4.9,
    isOpen: true,
    distance: "1.2 km",
    lat: -23.5505, 
    lng: -46.6333,
    type: "hospital"
  },
  {
    id: "hosp_2",
    name: "Pronto Socorro Infantil 24h",
    address: "Rua da Saúde, 500",
    rating: 4.8,
    isOpen: true,
    distance: "2.5 km",
    lat: -23.5605, 
    lng: -46.6433,
    type: "hospital"
  },
  {
    id: "pharm_1",
    name: "Farmácia Plantão 24h",
    address: "Rua dos Remédios, 123",
    rating: 4.5,
    isOpen: true,
    distance: "0.5 km",
    lat: -23.5555, 
    lng: -46.6355,
    type: "pharmacy"
  }
];

// --- SOUND TRACKS DATABASE ---
export const SOUND_TRACKS_DB: SoundTrack[] = [
  { 
    id: '1', 
    title: 'Som do Útero (2 Horas)', 
    category: 'womb', 
    youtubeId: '0e9QuV6yXk', // Popular Womb Sound
    duration: '2:00:00', 
    color: 'bg-red-100'
  },
  { 
    id: '2', 
    title: 'Ruído Branco Puro (Tela Preta)', 
    category: 'baby', 
    youtubeId: 'nMfPqeZjc2c', // 10 hours black screen white noise
    duration: '2:00:00', 
    color: 'bg-gray-100'
  },
  { 
    id: '3', 
    title: 'Chuva e Trovões Suaves', 
    category: 'nature', 
    youtubeId: 'mPZkdNFkNps', // Rain & Thunder
    duration: '2:00:00', 
    color: 'bg-blue-200'
  },
  { 
    id: '4', 
    title: 'Caixinha de Música (Brahms)', 
    category: 'baby', 
    youtubeId: 'k6rQhD5211Y', // Corrected Lullaby Music Box ID (e.g., from a search)
    duration: '1:00:00', 
    color: 'bg-yellow-100'
  },
  { 
    id: '5', 
    title: 'Piano Romântico Internacional', 
    category: 'mom', 
    youtubeId: 't5Jc15e8Q5c', // Romantic Piano Compilation
    duration: '1:30:00', 
    color: 'bg-purple-100'
  },
  { 
    id: '6', 
    title: 'Floresta Mágica', 
    category: 'nature', 
    youtubeId: 'xNN7iTA57jM', // Forest Sounds
    duration: '2:00:00', 
    color: 'bg-green-100'
  }
];

// --- PREGNANCY DATABASE ---
export const PREGNANCY_WEEKS_DB: Record<number, PregnancyWeek> = {
  4: { 
    week: 4, 
    sizeComparison: "Semente de Papoula", 
    fruit: "🌰", 
    weight: "< 1g", 
    length: "1mm", 
    description: "Apenas uma bolinha de células implantando no útero.", 
    development: "O tubo neural (futuro cérebro e medula) começa a se formar.",
    nutrition: "Ácido Fólico é crucial agora. Coma vegetais verdes escuros, feijão e lentilha.",
    avoid: "Álcool e tabaco devem ser eliminados completamente.",
    healthTip: "Inicie o pré-natal imediatamente para confirmar a gravidez e iniciar suplementação."
  },
  8: { 
    week: 8, 
    sizeComparison: "Framboesa", 
    fruit: "🍇", 
    weight: "1g", 
    length: "1.6cm", 
    description: "Pequenos dedos das mãos e pés começam a se formar.", 
    development: "O coração já bate cerca de 150 vezes por minuto.",
    nutrition: "Vitamina B6 pode ajudar com os enjoos. Tente gengibre e pequenas refeições.",
    avoid: "Carnes cruas ou mal passadas (risco de toxoplasmose).",
    healthTip: "Beba muita água, a hidratação ajuda a aumentar o volume sanguíneo necessário."
  },
  12: { 
    week: 12, 
    sizeComparison: "Limão", 
    fruit: "🍋", 
    weight: "14g", 
    length: "5.4cm", 
    description: "O rosto começa a parecer humano e os reflexos funcionam.", 
    development: "Os rins começam a produzir urina.",
    nutrition: "Proteínas magras (frango, peixe) são essenciais para o crescimento dos tecidos.",
    avoid: "Queijos não pasteurizados e embutidos crus.",
    healthTip: "Ótimo momento para o ultrassom morfológico do primeiro trimestre."
  },
  16: { 
    week: 16, 
    sizeComparison: "Abacate", 
    fruit: "🥑", 
    weight: "100g", 
    length: "11.6cm", 
    description: "A pele ainda é transparente e o esqueleto endurece.", 
    development: "Talvez você comece a sentir pequenos 'borbulhos' (movimentos).",
    nutrition: "Cálcio é vital. Leite, iogurte, ou brócolis e couve para os ossos do bebê.",
    avoid: "Excesso de cafeína. Limite a uma xícara pequena por dia.",
    healthTip: "Sua barriga começa a aparecer. Use hidratantes para prevenir estrias."
  },
  20: { 
    week: 20, 
    sizeComparison: "Banana", 
    fruit: "🍌", 
    weight: "300g", 
    length: "25cm", 
    description: "Metade do caminho! O bebê já engole líquido amniótico.", 
    development: "Desenvolve impressões digitais únicas.",
    nutrition: "Ferro é essencial. Carne vermelha magra, espinafre e feijão previnem anemia.",
    avoid: "Peixes com alto teor de mercúrio (cação, peixe-espada).",
    healthTip: "Ultrassom morfológico detalhado geralmente ocorre nesta semana."
  },
  21: { 
    week: 21, 
    sizeComparison: "Cenoura", 
    fruit: "🥕", 
    weight: "360g", 
    length: "26.7cm", 
    description: "Seu bebê já tem ciclos de sono e vigília definidos.", 
    development: "O sistema digestivo está amadurecendo rapidamente.",
    nutrition: "Vitamina C (laranja, acerola) ajuda a absorver o ferro dos alimentos.",
    avoid: "Medicamentos sem prescrição médica (Aspirina e anti-inflamatórios).",
    healthTip: "Descanse as pernas para evitar inchaço e varizes."
  },
  24: { 
    week: 24, 
    sizeComparison: "Milho", 
    fruit: "🌽", 
    weight: "600g", 
    length: "30cm", 
    description: "O bebê começa a acumular gordura e o rosto está formado.", 
    development: "Os pulmões começam a produzir surfactante.",
    nutrition: "Fibras e água para evitar constipação, comum nesta fase.",
    avoid: "Alimentos muito salgados ou industrializados (aumentam retenção de líquidos).",
    healthTip: "Fique atenta aos movimentos fetais. Eles devem ser frequentes."
  },
  28: { 
    week: 28, 
    sizeComparison: "Berinjela", 
    fruit: "🍆", 
    weight: "1kg", 
    length: "37cm", 
    description: "Ele já abre e fecha os olhos e percebe luz.", 
    development: "O cérebro desenvolve bilhões de neurônios.",
    nutrition: "Omega-3 (peixes seguros, chia, nozes) é fundamental para o cérebro do bebê.",
    avoid: "Dormir de barriga para cima (pode comprimir a veia cava). Durma de lado.",
    healthTip: "Comece a contar os chutes do bebê diariamente."
  },
  32: { 
    week: 32, 
    sizeComparison: "Repolho", 
    fruit: "🥬", 
    weight: "1.7kg", 
    length: "42cm", 
    description: "O bebê ocupa quase todo o espaço e chuta forte.", 
    development: "As unhas já chegam à ponta dos dedos.",
    nutrition: "Refeições pequenas e frequentes ajudam com a azia e falta de espaço.",
    avoid: "Viagens longas de avião sem autorização médica.",
    healthTip: "Prepare a mala da maternidade. O bebê pode querer chegar antes."
  },
  36: { 
    week: 36, 
    sizeComparison: "Mamão", 
    fruit: "🥣", 
    weight: "2.6kg", 
    length: "47cm", 
    description: "A maioria dos bebês já está de cabeça para baixo.", 
    development: "Os pulmões estão quase maduros.",
    nutrition: "Carboidratos complexos para energia extra no final da gestação.",
    avoid: "Atividades físicas de alto impacto ou risco de queda.",
    healthTip: "Consulte o médico semanalmente a partir de agora."
  },
  38: { 
    week: 38, 
    sizeComparison: "Abóbora", 
    fruit: "🎃", 
    weight: "3.1kg", 
    length: "49cm", 
    description: "O lanugo (pelos finos) está desaparecendo.", 
    development: "Pronto para nascer a qualquer momento.",
    nutrition: "Mantenha-se muito bem hidratada para o trabalho de parto.",
    avoid: "Estresse excessivo. Tente relaxar e focar na respiração.",
    healthTip: "Fique atenta aos sinais de trabalho de parto (contrações rítmicas)."
  },
  40: { 
    week: 40, 
    sizeComparison: "Melancia", 
    fruit: "🍉", 
    weight: "3.4kg", 
    length: "51cm", 
    description: "Pronto para nascer a qualquer momento!", 
    development: "Todos os sistemas estão prontos para o mundo exterior.",
    nutrition: "Coma alimentos leves de fácil digestão.",
    avoid: "Ficar longe do hospital ou de seu suporte de parto.",
    healthTip: "Parabéns! Seu bebê está pronto. Confie no seu corpo."
  }
};