/**
 * The 12 acts in order. Titles appear only in the navigator / presenter mode —
 * never as on-screen section headings.
 */
export const CHAPTER_IDS = [
  'intro',
  'system',
  'cut',
  'causes',
  'consequences',
  'world',
  'cases',
  'aral',
  'simulator',
  'recovery',
  'futures',
  'finale',
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export type Chapter = {
  id: ChapterId;
  numeral: string;
  title: string;
  /** Presenter talking points (Uzbek), shown only in presenter mode. */
  notes: string[];
  /** Source ids the presenter may want to cite in this act. */
  sources: string[];
  /** Ambience bed while this act is on screen. */
  bed: 'forest' | 'forest-thin' | 'wind' | 'room' | 'none';
};

export const CHAPTERS: Chapter[] = [
  {
    id: 'intro',
    numeral: 'I',
    title: 'O‘rmonga kirish',
    notes: [
      'Sekin aylantiring: o‘rmon chuqurlashadi, matn o‘z-o‘zidan paydo bo‘ladi.',
      'Daraxt qulagan lahzada to‘xtab, sukut saqlang.',
      'Asosiy g‘oya: daraxt yo‘qolishi — tizim o‘zgarishining boshlanishi.',
    ],
    sources: [],
    bed: 'forest',
  },
  {
    id: 'system',
    numeral: 'II',
    title: 'O‘rmon — tirik tizim',
    notes: [
      'Belgilarni bittadan tanlang: daraxt, ildiz, tuproq, suv, hayvonot, havo.',
      'Har birida boshqa qismlar bilan bog‘lanish yorishadi.',
      'Xulosa: o‘rmon = daraxtlar emas, o‘rmon = bog‘langan tirik tizim.',
    ],
    sources: ['fao-sofo-2020'],
    bed: 'forest',
  },
  {
    id: 'cut',
    numeral: 'III',
    title: 'Kesish',
    notes: [
      'Tutqichni sekin suring yoki aylantiring — butun manzara birga o‘zgaradi.',
      'Ko‘rsating: soya yo‘qoladi, tuproq ochiladi, daryo loyqalanadi, hayvonlar ketadi.',
      'Ko‘rsatkichlar illyustrativ — real o‘lchov emas.',
    ],
    sources: ['fao-fra-2025'],
    bed: 'forest-thin',
  },
  {
    id: 'causes',
    numeral: 'IV',
    title: 'Nega o‘rmonlar yo‘qolmoqda?',
    notes: [
      'Har bir sababni tanlang — o‘rmon maydoni qanday o‘zgarishini ko‘rsating.',
      'Dunyo bo‘yicha asosiy sabab — qishloq xo‘jaligining kengayishi (FAO).',
      'Mintaqaga qarab sabablar ulushi turlicha ekanini ta’kidlang.',
    ],
    sources: ['fao-fra-2020-rss'],
    bed: 'forest-thin',
  },
  {
    id: 'consequences',
    numeral: 'V',
    title: 'Nimalar yo‘qoladi?',
    notes: [
      'Uchta zanjir: biologik xilma-xillik, tuproq va suv, iqlim.',
      'Mexanizmni tushuntiring — vahima emas, sabab-oqibat.',
    ],
    sources: ['fao-sofo-2020', 'gcb-2025'],
    bed: 'room',
  },
  {
    id: 'world',
    numeral: 'VI',
    title: 'Dunyo miqyosida',
    notes: [
      'Hududlarni ro‘yxatdan yoki xaritadan tanlang.',
      'Tropik o‘rmonlar, boreal o‘rmonlar va quruq mintaqalardagi tog‘ o‘rmonlari.',
      'Oxirida Markaziy Osiyo va Orolbo‘yiga e’tibor qarating.',
    ],
    sources: ['fao-fra-2025'],
    bed: 'room',
  },
  {
    id: 'cases',
    numeral: 'VII',
    title: 'Uch hikoya',
    notes: [
      'Buyuk Britaniya: o‘rmonzorlar ulushi bir asrda qanday o‘sgan.',
      'Yaponiya: yuqori o‘rmon qoplami, lekin katta qismi ekilgan o‘rmonlar.',
      'O‘zbekiston: Orol tubidagi o‘rmonzorlar — keyingi bobga ko‘prik.',
    ],
    sources: ['uk-forestry-stats-history', 'japan-forestry-agency', 'uz-president-aral-2026'],
    bed: 'room',
  },
  {
    id: 'aral',
    numeral: 'VIII',
    title: 'Orolbo‘yi',
    notes: [
      'Sukut. Keyin shamol.',
      'Orol dengizi asosan sug‘orish uchun daryo suvlari olinishi sababli qisqargan.',
      'Saksovul ekish dengizni qaytarmaydi, lekin qum va tuzli chang ko‘chishini kamaytirishga yordam beradi.',
    ],
    sources: ['nasa-aral', 'uz-president-aral-2026', 'novitskiy-2012'],
    bed: 'wind',
  },
  {
    id: 'simulator',
    numeral: 'IX',
    title: 'Yer sizning qo‘lingizda',
    notes: [
      'Tomoshabinlardan qaror so‘rang: qayerni kesamiz, qayerni himoya qilamiz?',
      'Har bir tanlov — murosa: oziq-ovqat va daromad ham kerak.',
      'Bu ilmiy model emas, bog‘liqliklarni ko‘rsatuvchi soddalashtirilgan model.',
    ],
    sources: [],
    bed: 'room',
  },
  {
    id: 'recovery',
    numeral: 'X',
    title: 'Tiklanish vaqt talab qiladi',
    notes: [
      'Sekinlashing. Bu bob — nafas olish uchun.',
      'Ekish tez; ekotizim tiklanishi o‘nlab yillar, ba’zi xususiyatlari esa yuz yildan ortiq vaqt oladi.',
    ],
    sources: ['poorter-2021'],
    bed: 'forest-thin',
  },
  {
    id: 'futures',
    numeral: 'XI',
    title: 'Ikki kelajak',
    notes: [
      'Ajratgichni tomoshabinlarga suring: A — yemirilish, B — himoya va tiklash.',
      'Bu prognoz emas — oldingi boblardagi oqibatlarning vizual xulosasi.',
    ],
    sources: [],
    bed: 'forest',
  },
  {
    id: 'finale',
    numeral: 'XII',
    title: 'So‘nggi so‘z va manbalar',
    notes: ['O‘rmonni bir oz “yashashga” qo‘ying.', 'Savollar uchun manbalar ro‘yxatini oching (S tugmasi).'],
    sources: [],
    bed: 'forest',
  },
];

export const chapterById = (id: ChapterId): Chapter => CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0];

export const chapterIndex = (id: ChapterId): number => CHAPTER_IDS.indexOf(id);

export const nextChapter = (id: ChapterId): Chapter | undefined => CHAPTERS[chapterIndex(id) + 1];
