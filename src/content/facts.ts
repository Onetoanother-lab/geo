import type { ResearchGap, Stat } from './types';
import type { SourceId } from './sources';

type Fact = Stat & { sourceId: SourceId };

/**
 * Every number shown on screen. Components reference these by key; they never
 * contain literal statistics. Values use Uzbek number formatting (decimal
 * comma, thin-space thousands).
 */
const FACT_MAP = {
  // — Global (FAO FRA 2025) —
  forestArea: { id: 'forestArea', value: '4,14', unit: 'mlrd gektar', year: '2025', region: 'Dunyo', label: 'o‘rmonlar maydoni', note: 'FAO ta’rifi: 0,5 gektardan katta, daraxtlar 5 metrdan baland, soyabon qoplami 10 foizdan ortiq.', sourceId: 'fao-fra-2025', confidence: 'verified' },
  forestShare: { id: 'forestShare', value: '32', unit: '%', year: '2025', region: 'Dunyo', label: 'quruqlikning o‘rmon bilan qoplangan qismi', sourceId: 'fao-fra-2025', confidence: 'verified' },
  tropicsShare: { id: 'tropicsShare', value: '45', unit: '%', year: '2025', region: 'Dunyo', label: 'o‘rmonlarning tropik mintaqadagi ulushi', sourceId: 'fao-fra-2025', confidence: 'verified' },
  topFiveShare: { id: 'topFiveShare', value: '54', unit: '%', year: '2025', region: 'Rossiya, Braziliya, Kanada, AQSH, Xitoy', label: 'dunyo o‘rmonlarining besh mamlakatdagi ulushi', sourceId: 'fao-fra-2025', confidence: 'verified' },
  deforestationNow: { id: 'deforestationNow', value: '10,9', unit: 'mln gektar / yil', year: '2015–2025', region: 'Dunyo', label: 'o‘rmon kesilishi (yalpi)', note: 'Yalpi kesish. Yangi o‘rmonlar paydo bo‘lishi hisobga olinmagan.', sourceId: 'fao-fra-2025', confidence: 'verified' },
  deforestationMid: { id: 'deforestationMid', value: '13,6', unit: 'mln gektar / yil', year: '2000–2015', region: 'Dunyo', label: 'o‘rmon kesilishi (yalpi)', sourceId: 'fao-fra-2025', confidence: 'verified' },
  deforestation1990s: { id: 'deforestation1990s', value: '17,6', unit: 'mln gektar / yil', year: '1990–2000', region: 'Dunyo', label: 'o‘rmon kesilishi (yalpi)', sourceId: 'fao-fra-2025', confidence: 'verified' },
  netLossNow: { id: 'netLossNow', value: '4,12', unit: 'mln gektar / yil', year: '2015–2025', region: 'Dunyo', label: 'sof yo‘qotish (yangi o‘rmonlar ayirib tashlangandan keyin)', sourceId: 'fao-fra-2025', confidence: 'verified' },
  carbonStock: { id: 'carbonStock', value: '714', unit: 'gigatonna uglerod', year: '2025', region: 'Dunyo', label: 'o‘rmonlardagi uglerod zaxirasi (tuproq va biomassa)', sourceId: 'fao-fra-2025', confidence: 'verified' },

  // — Drivers —
  driverAgriculture: { id: 'driverAgriculture', value: 'qariyb 90', unit: '%', year: '2000–2018', region: 'Dunyo', label: 'o‘rmon kesilishi qishloq xo‘jaligi kengayishi bilan bog‘liq', sourceId: 'fao-fra-2020-rss', confidence: 'verified' },
  driverCropland: { id: 'driverCropland', value: 'qariyb 50', unit: '%', year: '2000–2018', region: 'Dunyo', label: 'ekin maydonlari (moyli palma plantatsiyalari bilan)', sourceId: 'fao-fra-2020-rss', confidence: 'verified' },
  driverGrazing: { id: 'driverGrazing', value: '38,5', unit: '%', year: '2000–2018', region: 'Dunyo', label: 'chorva yaylovlari', sourceId: 'fao-fra-2020-rss', confidence: 'verified' },
  fireShare2024: { id: 'fireShare2024', value: 'qariyb 50', unit: '%', year: '2024', region: 'Tropik birlamchi o‘rmonlar', label: 'yo‘qotishning yong‘inlar bilan bog‘liq qismi (rekord yil)', note: 'GFW “daraxt qoplami yo‘qotilishi”ni o‘lchaydi — bu FAO “o‘rmon kesilishi” ta’rifi bilan bir xil emas.', sourceId: 'wri-gfw-2024', confidence: 'verified' },
  tropicalLoss2024: { id: 'tropicalLoss2024', value: '6,7', unit: 'mln gektar', year: '2024', region: 'Tropik birlamchi o‘rmonlar', label: 'bir yilda yo‘qotilgan maydon (rekord)', sourceId: 'wri-gfw-2024', confidence: 'verified' },

  // — Biodiversity, carbon, water —
  amphibians: { id: 'amphibians', value: '80', unit: '%', region: 'Dunyo', label: 'suvda va quruqlikda yashovchi turlar o‘rmonda yashaydi', sourceId: 'fao-sofo-2020', confidence: 'verified' },
  birds: { id: 'birds', value: '75', unit: '%', region: 'Dunyo', label: 'qush turlari o‘rmonda yashaydi', sourceId: 'fao-sofo-2020', confidence: 'verified' },
  mammals: { id: 'mammals', value: '68', unit: '%', region: 'Dunyo', label: 'sutemizuvchi turlar o‘rmonda yashaydi', sourceId: 'fao-sofo-2020', confidence: 'verified' },
  treeSpecies: { id: 'treeSpecies', value: '60 000 dan ortiq', region: 'Dunyo', label: 'daraxt turlari', sourceId: 'fao-sofo-2020', confidence: 'verified' },
  landUseEmissions: { id: 'landUseEmissions', value: '5,0', unit: 'Gt CO2 / yil', year: '2015–2024', region: 'Dunyo', label: 'yerdan foydalanish o‘zgarishidan sof chiqindilar (o‘rtacha)', note: 'Inson faoliyatidan chiqadigan CO2 ning taxminan 12 foizi.', sourceId: 'gcb-2025', confidence: 'verified' },
  landUseShare: { id: 'landUseShare', value: '12', unit: '%', year: '2015–2024', region: 'Dunyo', label: 'inson faoliyatidan chiqadigan CO2 dagi ulushi (taxminan)', sourceId: 'gcb-2025', confidence: 'verified' },
  amazonRecycling: { id: 'amazonRecycling', value: 'uchdan bir', region: 'Amazoniya', label: 'qismi havzaning o‘zidan bug‘langan namlikdan yog‘adi', sourceId: 'staal-2018', confidence: 'verified' },
  forestWater: { id: 'forestWater', value: '75', unit: '%', region: 'Dunyo', label: 'foydalanish mumkin bo‘lgan chuchuk suv o‘rmonli suv havzalaridan keladi (taxminan)', sourceId: 'fao-forest-water', confidence: 'verified' },

  // — United Kingdom —
  ukWoodlandNow: { id: 'ukWoodlandNow', value: '14', unit: '%', year: '2026', region: 'Buyuk Britaniya', label: 'o‘rmonzorlar ulushi (3,30 mln gektar)', note: 'Buyuk Britaniya ta’rifi: kamida 0,5 gektar, kengligi 20 metrdan ortiq, soyabon qoplami 20 foizdan ortiq.', sourceId: 'uk-woodland-2026', confidence: 'verified' },
  ukWoodland1905: { id: 'ukWoodland1905', value: '4,7', unit: '%', year: '1905', region: 'Buyuk Britaniya', label: 'o‘rmonzorlar ulushi', sourceId: 'uk-forestry-stats-history', confidence: 'verified' },
  ukForestryAct: { id: 'ukForestryAct', value: '1919', region: 'Buyuk Britaniya', label: 'O‘rmon to‘g‘risidagi qonun: O‘rmon xo‘jaligi komissiyasi tuzildi', sourceId: 'uk-lords-1919', confidence: 'verified' },

  // — Japan —
  japanArea: { id: 'japanArea', value: '25', unit: 'mln gektar', region: 'Yaponiya', label: 'o‘rmonlar maydoni — mamlakatning uchdan ikki qismi', sourceId: 'japan-forestry-agency', confidence: 'verified' },
  japanShare: { id: 'japanShare', value: '68', unit: '%', year: '2023', region: 'Yaponiya', label: 'quruqlikning o‘rmon bilan qoplangan qismi', sourceId: 'wb-forest-indicator', confidence: 'verified' },
  japanPlanted: { id: 'japanPlanted', value: '40', unit: '%', region: 'Yaponiya', label: 'o‘rmonlarning ekilgan qismi (asosan sugi va hinoki)', sourceId: 'japan-forestry-agency', confidence: 'verified' },

  // — Uzbekistan & the Aral Sea —
  uzForestArea: { id: 'uzForestArea', value: '3,7', unit: 'mln gektar', year: '2020', region: 'O‘zbekiston', label: 'o‘rmon maydoni (FAO ta’rifi)', note: 'Milliy “o‘rmon fondi” kengroq hisoblanadi; FAO ta’rifi xalqaro taqqoslash uchun ishlatildi.', sourceId: 'wb-uzbekistan-forest-note', confidence: 'verified' },
  uzForestShare: { id: 'uzForestShare', value: '8,5', unit: '%', year: '2023', region: 'O‘zbekiston', label: 'quruqlikning o‘rmon bilan qoplangan qismi', sourceId: 'wb-forest-indicator', confidence: 'verified' },
  yashilMakon: { id: 'yashilMakon', value: '200', unit: 'mln ko‘chat / yil', year: '2021-yildan', region: 'O‘zbekiston', label: '“Yashil makon” loyihasining maqsadi', sourceId: 'undp-yashil-makon', confidence: 'verified' },
  aralPlanted: { id: 'aralPlanted', value: '2', unit: 'mln gektar', year: '2026', region: 'Orol dengizining qurigan tubi', label: 'himoya o‘rmonzorlari barpo etilgani haqida rasmiy bayonot', note: 'Mustaqil sun’iy yo‘ldosh tahlili ko‘rinadigan o‘simlik qoplami e’lon qilingandan ancha kam ekanini ko‘rsatgan (Shields, 2026).', sourceId: 'uz-president-aral-2026', confidence: 'reported' },
  aralArea1960: { id: 'aralArea1960', value: '68 000', unit: 'km²', year: '1960', region: 'Orol dengizi', label: 'maydoni — dunyodagi to‘rtinchi eng katta ko‘l', sourceId: 'esa-aral-2025', confidence: 'verified' },
  aralRemaining: { id: 'aralRemaining', value: 'taxminan 10', unit: '%', region: 'Orol dengizi', label: 'tarixiy maydonidan qolgan qismi', sourceId: 'unep-aral', confidence: 'verified' },
  kokaralDam: { id: 'kokaralDam', value: '2005', region: 'Shimoliy Orol (Qozog‘iston)', label: 'Ko‘karal to‘g‘oni qurildi — Shimoliy Orol qisman tiklandi, janubiy qism esa yo‘q', sourceId: 'wb-kokaral', confidence: 'verified' },
  saxaulEstablishment: { id: 'saxaulEstablishment', value: '10 foizgacha', region: 'Janubiy Orolqum, sho‘rxok tuproqlar', label: 'saksovul ko‘chatlarining tutib qolishi', sourceId: 'novitskiy-2012', confidence: 'verified' },
  saxaulSurvival: { id: 'saxaulSurvival', value: '0,12–78', unit: '%', year: '2020', region: 'Orolbo‘yi (Qozog‘iston qismi, 24 hudud)', label: 'saksovul ko‘chatlarining saqlanib qolishi — tuproqqa qarab', sourceId: 'cajwr-2021-saxaul', confidence: 'verified' },

  // — Recovery (Poorter et al. 2021, natural regrowth, 77 tropical sites) —
  recoverySoil: { id: 'recoverySoil', value: '10 yildan kam', label: 'tuproq xususiyatlari', region: 'Tropik o‘rmonlar', sourceId: 'poorter-2021', confidence: 'verified' },
  recoveryFunction: { id: 'recoveryFunction', value: '25 yildan kam', label: 'o‘simliklar faoliyati', region: 'Tropik o‘rmonlar', sourceId: 'poorter-2021', confidence: 'verified' },
  recoveryStructure: { id: 'recoveryStructure', value: '25–60 yil', label: 'tuzilma va turlar xilma-xilligi', region: 'Tropik o‘rmonlar', sourceId: 'poorter-2021', confidence: 'verified' },
  recoveryBiomass: { id: 'recoveryBiomass', value: '120 yildan ortiq', label: 'biomassa va turlar tarkibi', region: 'Tropik o‘rmonlar', note: 'Yetuk o‘rmon ko‘rsatkichlarining 90 foiziga yetish vaqti.', sourceId: 'poorter-2021', confidence: 'verified' },

  // — Central Asian mountain forests —
  juniperPressure: { id: 'juniperPressure', value: 'archa', region: 'Markaziy Osiyo tog‘lari', label: 'o‘rmonlari ortiqcha mol boqish va noqonuniy kesish tufayli tiklanganidan tezroq yo‘qolmoqda', sourceId: 'fao-mountain-juniper', confidence: 'secondary' },
} satisfies Record<string, Fact>;

export type FactId = keyof typeof FACT_MAP;

export const FACTS: Record<FactId, Fact> = FACT_MAP;

export const fact = (id: FactId): Fact => FACTS[id];

/** Formats “value unit”. */
export const factParts = (id: FactId): { value: string; unit: string } => {
  const f = FACTS[id];
  return { value: String(f.value), unit: f.unit === '%' ? '%' : f.unit ? ` ${f.unit}` : '' };
};

export const formatFact = (id: FactId): string => {
  const f = FACTS[id];
  return f.unit ? (f.unit === '%' ? `${f.value}%` : `${f.value} ${f.unit}`) : String(f.value);
};

/**
 * Claims that were checked and could not be stated as precise numbers, or that
 * differ from the original school text. Shown at the end of the Sources panel.
 */
export const RESEARCH_GAPS: ResearchGap[] = [
  {
    claim: '“Buyuk Britaniyada o‘rmonlar 3 baravar ko‘paygan”',
    status: 'Qisman to‘g‘ri',
    handling: 'O‘rmonzorlar ulushi 1905-yildagi 4,7 foizdan 2026-yildagi 14 foizgacha — qariyb uch baravar oshgan. 1924-yildan hisoblansa, 2,7 baravar. Eski inventarizatsiyalarda ta’riflar biroz farq qilgan.',
  },
  {
    claim: 'Orol tubida 2 mln gektar himoya o‘rmonzori',
    status: 'Rasmiy bayonot, mustaqil tasdiqlanmagan',
    handling: '“Rasmiy ma’lumotlarga ko‘ra” deb ko‘rsatildi. Mustaqil tadqiqot sun’iy yo‘ldoshda ko‘rinadigan qoplam ancha kam ekanini qayd etgan; ko‘chatlar tutishi tuproqqa qarab keskin farq qiladi.',
  },
  {
    claim: 'Orol tubidan har yili ko‘tariladigan chang miqdori',
    status: 'Baholar juda turlicha',
    handling: 'Raqam o‘rniga sifat jihatidan tasvirlandi: “shamol tuzli changni uzoqlarga olib ketadi”.',
  },
  {
    claim: 'Qurigan tubning umumiy maydoni (taxminan 5–5,5 mln gektar)',
    status: 'Faqat ikkilamchi manbalarda',
    handling: 'Aniq raqam ko‘rsatilmadi.',
  },
  {
    claim: '“Ekin maydonlari — 49,6 foiz”',
    status: 'FAO matnida “qariyb 50 foiz” deyilgan',
    handling: '“Qariyb 50 foiz” shaklida berildi.',
  },
  {
    claim: '“Bitta saksovul 10 tonnagacha tuproqni ushlaydi”; “yong‘oq-mevali o‘rmonlar 90 foizga qisqargan”',
    status: 'Tasdiqlanmagan',
    handling: 'Taqdimotdan chiqarildi.',
  },
  {
    claim: 'O‘zbekiston o‘rmon maydoni',
    status: 'Ta’riflar turlicha',
    handling: 'Milliy “o‘rmon fondi” maydoni FAO o‘rmon ta’rifidan kengroq. Xalqaro taqqoslash uchun FAO ma’lumoti ishlatildi.',
  },
];
