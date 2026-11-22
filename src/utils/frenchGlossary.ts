import { FRENCH_TRAINING_PROGRAMS } from '../data/frenchTrainingData';
import { GradeLevel, TrimesterType } from '../types/curriculum';

export interface FrenchGlossaryEntry {
  id: string;
  word: string;
  article?: string;
  arMeaning: string;
  grade: GradeLevel | 'all';
  trimester?: TrimesterType;
  letter: string;
}

const CORE_CURRICULUM_WORDS: Omit<FrenchGlossaryEntry, 'id' | 'letter'>[] = [
  { word: 'aller', arMeaning: 'يذهب', grade: 3 },
  { word: 'animal', article: 'un', arMeaning: 'حيوان', grade: 3 },
  { word: 'applaudir', arMeaning: 'يصفّق', grade: 5 },
  { word: 'arbre', article: 'un', arMeaning: 'شجرة', grade: 3 },
  { word: 'armoire', article: 'une', arMeaning: 'خزانة', grade: 3 },
  { word: 'arrosoir', article: 'un', arMeaning: 'مرشّ الماء', grade: 3 },
  { word: 'aujourd’hui', arMeaning: 'اليوم', grade: 3 },
  { word: 'automne', article: 'l’', arMeaning: 'الخريف', grade: 3 },
  { word: 'autrefois', arMeaning: 'قديماً / في الماضي', grade: 6 },
  { word: 'avion', article: 'un', arMeaning: 'طائرة', grade: 6 },
  { word: 'avoir', arMeaning: 'يملك / لديه', grade: 3 },
  { word: 'bateau', article: 'un', arMeaning: 'سفينة / قارب', grade: 4 },
  { word: 'blanc', arMeaning: 'أبيض', grade: 3 },
  { word: 'bleu', arMeaning: 'أزرق', grade: 3 },
  { word: 'bois', article: 'le', arMeaning: 'الخشب', grade: 4 },
  { word: 'bonjour', arMeaning: 'صباح الخير', grade: 3 },
  { word: 'bonsoir', arMeaning: 'مساء الخير', grade: 3 },
  { word: 'bouche', article: 'la', arMeaning: 'الفم', grade: 3 },
  { word: 'boulanger', article: 'un', arMeaning: 'خبّاز', grade: 4 },
  { word: 'boulangerie', article: 'la', arMeaning: 'المخبزة', grade: 5 },
  { word: 'bus', article: 'le', arMeaning: 'الحافلة', grade: 5 },
  { word: 'cadeau', article: 'un', arMeaning: 'هدية', grade: 4 },
  { word: 'cahier', article: 'un', arMeaning: 'كراس', grade: 3 },
  { word: 'canapé', article: 'le', arMeaning: 'الأريكة', grade: 3 },
  { word: 'car', arMeaning: 'لأنّ', grade: 6 },
  { word: 'carotte', article: 'la', arMeaning: 'الجزرة', grade: 4 },
  { word: 'cartable', article: 'un', arMeaning: 'محفظة مدرسية', grade: 3 },
  { word: 'cependant', arMeaning: 'مع ذلك', grade: 6 },
  { word: 'chaise', article: 'la', arMeaning: 'الكرسي', grade: 3 },
  { word: 'chambre', article: 'la', arMeaning: 'غرفة النوم', grade: 3 },
  { word: 'chat', article: 'le', arMeaning: 'القط', grade: 3 },
  { word: 'cheval', article: 'le', arMeaning: 'الحصان', grade: 3 },
  { word: 'cheveux', article: 'les', arMeaning: 'الشعر', grade: 3 },
  { word: 'chien', article: 'le', arMeaning: 'الكلب', grade: 3 },
  { word: 'choisir', arMeaning: 'يختار', grade: 4 },
  { word: 'confiture', article: 'la', arMeaning: 'المربّى', grade: 4 },
  { word: 'cour', article: 'la', arMeaning: 'ساحة المدرسة', grade: 3 },
  { word: 'courageux', arMeaning: 'شجاع', grade: 4 },
  { word: 'crayon', article: 'un', arMeaning: 'قلم رصاص', grade: 3 },
  { word: 'cuisine', article: 'la', arMeaning: 'المطبخ', grade: 3 },
  { word: 'd’abord', arMeaning: 'أوّلاً', grade: 6 },
  { word: 'dans', arMeaning: 'في / داخل', grade: 5 },
  { word: 'déchets', article: 'les', arMeaning: 'النفايات', grade: 5 },
  { word: 'déjeuner', article: 'le', arMeaning: 'الغداء', grade: 4 },
  { word: 'demain', arMeaning: 'غداً', grade: 5 },
  { word: 'demander', arMeaning: 'يسأل / يطلب', grade: 5 },
  { word: 'dentiste', article: 'le', arMeaning: 'طبيب الأسنان', grade: 5 },
  { word: 'derrière', arMeaning: 'خلف', grade: 5 },
  { word: 'devant', arMeaning: 'أمام', grade: 5 },
  { word: 'devoir', article: 'un', arMeaning: 'واجب منزلي', grade: 4 },
  { word: 'dimanche', arMeaning: 'الأحد', grade: 3 },
  { word: 'dîner', article: 'le', arMeaning: 'العشاء', grade: 4 },
  { word: 'dire', arMeaning: 'يقول', grade: 5 },
  { word: 'donc', arMeaning: 'إذن / لذلك', grade: 6 },
  { word: 'eau', article: 'l’', arMeaning: 'الماء', grade: 4 },
  { word: 'école', article: 'l’', arMeaning: 'المدرسة', grade: 3 },
  { word: 'écran', article: 'l’', arMeaning: 'الشاشة', grade: 6 },
  { word: 'économiser', arMeaning: 'يقتصد في', grade: 5 },
  { word: 'élève', article: 'un / une', arMeaning: 'تلميذ / تلميذة', grade: 3 },
  { word: 'énergie', article: 'l’', arMeaning: 'الطاقة', grade: 6 },
  { word: 'enfant', article: 'un / une', arMeaning: 'طفل / طفلة', grade: 3 },
  { word: 'enfin', arMeaning: 'أخيراً', grade: 6 },
  { word: 'ensuite', arMeaning: 'ثم / بعد ذلك', grade: 6 },
  { word: 'entraide', article: 'l’', arMeaning: 'التعاون', grade: 6 },
  { word: 'entre', arMeaning: 'بين', grade: 5 },
  { word: 'été', article: 'l’', arMeaning: 'الصيف', grade: 3 },
  { word: 'être', arMeaning: 'يكون', grade: 3 },
  { word: 'expliquer', arMeaning: 'يشرح', grade: 5 },
  { word: 'faire', arMeaning: 'يفعل / يمارس', grade: 4 },
  { word: 'famille', article: 'la', arMeaning: 'العائلة', grade: 3 },
  { word: 'ferme', article: 'la', arMeaning: 'المزرعة', grade: 3 },
  { word: 'finir', arMeaning: 'يُنهي', grade: 4 },
  { word: 'fleur', article: 'une', arMeaning: 'زهرة', grade: 3 },
  { word: 'forêt', article: 'la', arMeaning: 'الغابة', grade: 5 },
  { word: 'frère', article: 'le', arMeaning: 'الأخ', grade: 3 },
  { word: 'froid', arMeaning: 'بارد', grade: 4 },
  { word: 'fromage', article: 'le', arMeaning: 'الجبن', grade: 4 },
  { word: 'fruit', article: 'un', arMeaning: 'فاكهة', grade: 4 },
  { word: 'gaspiller', arMeaning: 'يبذّر', grade: 5 },
  { word: 'gâteau', article: 'un', arMeaning: 'كعكة / مرطبات', grade: 4 },
  { word: 'générosité', article: 'la', arMeaning: 'الكرم', grade: 6 },
  { word: 'gomme', article: 'une', arMeaning: 'ممحاة', grade: 3 },
  { word: 'goûter', article: 'le', arMeaning: 'اللمجة', grade: 4 },
  { word: 'grand', arMeaning: 'كبير', grade: 3 },
  { word: 'grand-mère', article: 'la', arMeaning: 'الجدّة', grade: 3 },
  { word: 'grand-père', article: 'le', arMeaning: 'الجدّ', grade: 3 },
  { word: 'grandir', arMeaning: 'يكبر / ينمو', grade: 5 },
  { word: 'heureux', arMeaning: 'سعيد', grade: 4 },
  { word: 'hier', arMeaning: 'أمس / البارحة', grade: 5 },
  { word: 'histoire', article: 'une', arMeaning: 'قصة / تاريخ', grade: 5 },
  { word: 'hiver', article: 'l’', arMeaning: 'الشتاء', grade: 3 },
  { word: 'hôpital', article: 'l’', arMeaning: 'المستشفى', grade: 5 },
  { word: 'immeuble', article: 'un', arMeaning: 'مبنى / عمارة', grade: 5 },
  { word: 'inoubliable', arMeaning: 'لا يُنسى', grade: 5 },
  { word: 'jardin', article: 'un', arMeaning: 'حديقة / بستان', grade: 3 },
  { word: 'jaune', arMeaning: 'أصفر', grade: 3 },
  { word: 'jeu', article: 'un', arMeaning: 'لعبة', grade: 4 },
  { word: 'jeudi', arMeaning: 'الخميس', grade: 3 },
  { word: 'joli', arMeaning: 'جميل', grade: 3 },
  { word: 'jouer', arMeaning: 'يلعب', grade: 4 },
  { word: 'jour', article: 'un', arMeaning: 'يوم', grade: 3 },
  { word: 'journal', article: 'un', arMeaning: 'جريدة', grade: 4 },
  { word: 'jus', article: 'le', arMeaning: 'العصير', grade: 4 },
  { word: 'lait', article: 'le', arMeaning: 'الحليب', grade: 3 },
  { word: 'lapin', article: 'le', arMeaning: 'الأرنب', grade: 4 },
  { word: 'légume', article: 'un', arMeaning: 'خضار', grade: 4 },
  { word: 'lettre', article: 'une', arMeaning: 'رسالة / حرف', grade: 5 },
  { word: 'lit', article: 'le', arMeaning: 'السرير', grade: 3 },
  { word: 'livre', article: 'un', arMeaning: 'كتاب', grade: 3 },
  { word: 'lundi', arMeaning: 'الإثنين', grade: 3 },
  { word: 'main', article: 'la', arMeaning: 'اليد', grade: 3 },
  { word: 'mais', arMeaning: 'لكن', grade: 6 },
  { word: 'maison', article: 'une', arMeaning: 'منزل', grade: 3 },
  { word: 'maîtresse', article: 'la', arMeaning: 'المعلمة', grade: 3 },
  { word: 'manger', arMeaning: 'يأكل', grade: 4 },
  { word: 'marché', article: 'le', arMeaning: 'السوق', grade: 4 },
  { word: 'mardi', arMeaning: 'الثلاثاء', grade: 3 },
  { word: 'mauvais', arMeaning: 'سيئ / رديء', grade: 4 },
  { word: 'mer', article: 'la', arMeaning: 'البحر', grade: 4 },
  { word: 'mercredi', arMeaning: 'الأربعاء', grade: 3 },
  { word: 'merci', arMeaning: 'شكراً', grade: 3 },
  { word: 'menuisier', article: 'un', arMeaning: 'نجّار', grade: 4 },
  { word: 'mère', article: 'la', arMeaning: 'الأم', grade: 3 },
  { word: 'mouton', article: 'le', arMeaning: 'الخروف', grade: 3 },
  { word: 'musée', article: 'le', arMeaning: 'المتحف', grade: 5 },
  { word: 'nature', article: 'la', arMeaning: 'الطبيعة', grade: 4 },
  { word: 'nez', article: 'le', arMeaning: 'الأنف', grade: 3 },
  { word: 'noir', arMeaning: 'أسود', grade: 3 },
  { word: 'obéir', arMeaning: 'يطيع', grade: 5 },
  { word: 'œil', article: 'un', arMeaning: 'عين', grade: 3 },
  { word: 'oiseau', article: 'l’', arMeaning: 'العصفور', grade: 3 },
  { word: 'olivier', article: 'un', arMeaning: 'شجرة زيتون', grade: 3 },
  { word: 'oncle', article: 'l’', arMeaning: 'العم / الخال', grade: 4 },
  { word: 'orange', article: 'une', arMeaning: 'برتقالة', grade: 4 },
  { word: 'oreille', article: 'l’', arMeaning: 'الأذن', grade: 3 },
  { word: 'pain', article: 'le', arMeaning: 'الخبز', grade: 3 },
  { word: 'parc', article: 'le', arMeaning: 'المنتزه / الحديقة', grade: 4 },
  { word: 'parler', arMeaning: 'يتكلم', grade: 3 },
  { word: 'partager', arMeaning: 'يتقاسم / يشارك', grade: 5 },
  { word: 'père', article: 'le', arMeaning: 'الأب', grade: 3 },
  { word: 'petit', arMeaning: 'صغير', grade: 3 },
  { word: 'petit-déjeuner', article: 'le', arMeaning: 'الفطور', grade: 4 },
  { word: 'pied', article: 'le', arMeaning: 'القدم', grade: 3 },
  { word: 'pilote', article: 'un', arMeaning: 'طيّار', grade: 4 },
  { word: 'plage', article: 'la', arMeaning: 'الشاطئ', grade: 4 },
  { word: 'planète', article: 'la', arMeaning: 'الكوكب', grade: 5 },
  { word: 'plante', article: 'une', arMeaning: 'نبتة', grade: 3 },
  { word: 'planter', arMeaning: 'يغرس / يزرع', grade: 5 },
  { word: 'pluie', article: 'la', arMeaning: 'المطر', grade: 4 },
  { word: 'polluer', arMeaning: 'يلوّث', grade: 4 },
  { word: 'pollution', article: 'la', arMeaning: 'التلوّث', grade: 6 },
  { word: 'pompier', article: 'un', arMeaning: 'رجل إطفاء', grade: 5 },
  { word: 'poubelle', article: 'la', arMeaning: 'سلة المهملات', grade: 5 },
  { word: 'poule', article: 'la', arMeaning: 'الدجاجة', grade: 3 },
  { word: 'printemps', article: 'le', arMeaning: 'الربيع', grade: 3 },
  { word: 'prochain', arMeaning: 'القادم', grade: 5 },
  { word: 'propre', arMeaning: 'نظيف', grade: 4 },
  { word: 'protéger', arMeaning: 'يحمي', grade: 5 },
  { word: 'recycler', arMeaning: 'يعيد التدوير', grade: 5 },
  { word: 'règle', article: 'une', arMeaning: 'مسطرة / قاعدة', grade: 3 },
  { word: 'remplir', arMeaning: 'يملأ', grade: 5 },
  { word: 'répondre', arMeaning: 'يجيب', grade: 5 },
  { word: 'réussir', arMeaning: 'ينجح', grade: 5 },
  { word: 'rouge', arMeaning: 'أحمر', grade: 3 },
  { word: 'sable', article: 'le', arMeaning: 'الرمل', grade: 6 },
  { word: 'salon', article: 'le', arMeaning: 'غرفة الجلوس', grade: 3 },
  { word: 'samedi', arMeaning: 'السبت', grade: 3 },
  { word: 'santé', article: 'la', arMeaning: 'الصحة', grade: 5 },
  { word: 'sœur', article: 'la', arMeaning: 'الأخت', grade: 3 },
  { word: 'solaire', arMeaning: 'شمسي', grade: 6 },
  { word: 'soleil', article: 'le', arMeaning: 'الشمس', grade: 4 },
  { word: 'solidarité', article: 'la', arMeaning: 'التضامن', grade: 6 },
  { word: 'soudain', arMeaning: 'فجأةً', grade: 6 },
  { word: 'sous', arMeaning: 'تحت', grade: 5 },
  { word: 'stade', article: 'le', arMeaning: 'الملعب', grade: 4 },
  { word: 'stylo', article: 'un', arMeaning: 'قلم حبر', grade: 3 },
  { word: 'sur', arMeaning: 'فوق', grade: 5 },
  { word: 'tableau', article: 'le', arMeaning: 'السبورة', grade: 3 },
  { word: 'tante', article: 'la', arMeaning: 'العمة / الخالة', grade: 5 },
  { word: 'tapis', article: 'un', arMeaning: 'زربية / سجادة', grade: 5 },
  { word: 'tête', article: 'la', arMeaning: 'الرأس', grade: 3 },
  { word: 'train', article: 'le', arMeaning: 'القطار', grade: 6 },
  { word: 'trousse', article: 'une', arMeaning: 'مقلمة', grade: 3 },
  { word: 'vache', article: 'la', arMeaning: 'البقرة', grade: 3 },
  { word: 'vague', article: 'une', arMeaning: 'موجة', grade: 6 },
  { word: 'vélo', article: 'le', arMeaning: 'الدراجة', grade: 4 },
  { word: 'vendredi', arMeaning: 'الجمعة', grade: 3 },
  { word: 'vert', arMeaning: 'أخضر', grade: 3 },
  { word: 'voiture', article: 'la', arMeaning: 'السيارة', grade: 6 },
  { word: 'voix', article: 'la', arMeaning: 'الصوت', grade: 5 },
  { word: 'voyage', article: 'un', arMeaning: 'سفر / رحلة', grade: 5 },
  { word: 'yeux', article: 'les', arMeaning: 'العينان', grade: 3 },
];

export function getFrenchAlphaLetter(word: string): string {
  const cleaned = word
    .trim()
    .replace(/^(l’|l'|d’|d')/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const ch = cleaned.charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : '#';
}

function normalizeSortKey(word: string): string {
  return word
    .trim()
    .replace(/^(l’|l'|d’|d')/i, '')
    .toLowerCase();
}

export function buildFrenchWordGlossary(options?: {
  grade?: GradeLevel;
  includeAllGrades?: boolean;
  trimester?: 'all' | TrimesterType;
  query?: string;
  letterFilter?: string;
}): {
  entries: FrenchGlossaryEntry[];
  availableLetters: string[];
} {
  const map = new Map<string, FrenchGlossaryEntry>();

  const upsert = (item: Omit<FrenchGlossaryEntry, 'id' | 'letter'>) => {
    const cleanWord = item.word.trim();
    if (!cleanWord) return;
    const key = cleanWord.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...item,
        id: `gl-${key}`,
        word: cleanWord,
        letter: getFrenchAlphaLetter(cleanWord),
      });
    }
  };

  // Extract words from vocabCards across all grades
  const grades: GradeLevel[] = [3, 4, 5, 6];
  for (const grade of grades) {
    const prog = FRENCH_TRAINING_PROGRAMS[grade];
    for (const card of prog.vocabCards) {
      const raw = card.frWord.trim();
      // Skip multi-word expressions/particles that have punctuation or slashes; split clean word pairs
      if (raw.includes('...') || raw.includes('!')) {
        continue;
      }
      if (raw.includes('/')) {
        const words = raw.split('/').map((s) => s.trim());
        const meanings = card.arMeaning.split('/').map((s) => s.trim());
        words.forEach((w, i) => {
          if (w && !w.includes(' ')) {
            upsert({
              word: w,
              article: card.article,
              arMeaning: meanings[i] || card.arMeaning,
              grade,
              trimester: card.trimester,
            });
          }
        });
        continue;
      }

      // Keep single words only (no multi-word expressions)
      if (raw.includes(' ')) {
        continue;
      }
      upsert({
        word: raw,
        article: card.article,
        arMeaning: card.arMeaning,
        grade,
        trimester: card.trimester,
      });
    }
  }

  // Merge core curriculum words
  for (const entry of CORE_CURRICULUM_WORDS) {
    upsert(entry);
  }

  let list = Array.from(map.values());

  if (options?.grade && !options?.includeAllGrades) {
    list = list.filter((e) => e.grade === options.grade || e.grade === 'all');
  }

  if (options?.trimester && options.trimester !== 'all') {
    list = list.filter((e) => !e.trimester || e.trimester === options.trimester);
  }

  // Sort strictly alphabetically according to French alphabet (A -> Z)
  list.sort((a, b) =>
    normalizeSortKey(a.word).localeCompare(normalizeSortKey(b.word), 'fr', {
      sensitivity: 'base',
    })
  );

  const availableLetters = Array.from(
    new Set(list.map((e) => e.letter).filter((l) => l !== '#'))
  ).sort((a, b) => a.localeCompare(b, 'fr'));

  if (options?.letterFilter && options.letterFilter !== 'ALL') {
    list = list.filter((e) => e.letter === options.letterFilter);
  }

  if (options?.query && options.query.trim()) {
    const q = options.query.trim().toLowerCase();
    list = list.filter(
      (e) =>
        e.word.toLowerCase().includes(q) ||
        e.arMeaning.toLowerCase().includes(q)
    );
  }

  return { entries: list, availableLetters };
}
