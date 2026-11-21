import { FrenchPhrase, Lesson } from '../types/curriculum';
import {
  BADGES,
  GRADES,
  LEVELS,
  SUBJECTS,
  TUNISIAN_GOVERNORATES,
} from './curriculumMeta';
import { LESSONS_GRADE_3 } from './lessonsGrade3';
import { LESSONS_GRADE_4 } from './lessonsGrade4';
import { LESSONS_GRADE_5 } from './lessonsGrade5';
import { LESSONS_GRADE_6 } from './lessonsGrade6';
import { EXTRA_LESSONS_GRADE_3 } from './extraLessonsGrade3';
import { EXTRA_LESSONS_GRADE_4 } from './extraLessonsGrade4';
import { EXTRA_LESSONS_GRADE_5 } from './extraLessonsGrade5';
import { EXTRA_LESSONS_GRADE_6 } from './extraLessonsGrade6';
import { EXPANSION_MATH_LESSONS } from './expansionMath';
import { EXPANSION_SCIENCE_LESSONS } from './expansionScience';
import { EXPANSION_ARABIC_LESSONS } from './expansionArabic';
import { EXPANSION_FRENCH_LESSONS } from './expansionFrench';
import { EXPANSION_SOCIAL_LESSONS } from './expansionSocialStudies';
import { EXPANSION_REMEDIAL_2026_LESSONS } from './expansionRemedial2026';
import { EXPANSION_FULL_YEAR_2026_LESSONS } from './expansionFullYear2026';

export { BADGES, GRADES, LEVELS, SUBJECTS, TUNISIAN_GOVERNORATES };

export const TRIMESTERS: ('الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث')[] = [
  'الثلاثي الأول',
  'الثلاثي الثاني',
  'الثلاثي الثالث',
];

export const TRIMESTER_ORDER: Record<'الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث', number> = {
  'الثلاثي الأول': 1,
  'الثلاثي الثاني': 2,
  'الثلاثي الثالث': 3,
};

const SUBJECT_SORT_ORDER: Record<Lesson['subjectId'], number> = {
  math: 1,
  science: 2,
  arabic: 3,
  french: 4,
  social: 5,
};

const BASE_FRENCH_PHRASES: Record<string, FrenchPhrase[]> = {
  'g3-french-articles': [
    { fr: 'Un garçon porte un cartable.', ar: 'يحمل ولد محفظة.', phoneticHint: 'آن غارسون بورت آن كارتابل.' },
    { fr: 'Une fille ouvre une trousse.', ar: 'تفتح بنت مقلمة.', phoneticHint: 'أون في أوفر أون تروس.' },
    { fr: 'Le maître écrit sur le tableau.', ar: 'يكتب المعلم على السبورة.', phoneticHint: 'لو ميتر إيكري سور لو تابلو.' },
    { fr: 'Les élèves rangent les cahiers.', ar: 'يرتّب التلاميذ الكراسات.', phoneticHint: 'لي زيلف رانج لي كايي.' },
  ],
  'g3-french-presentation': [
    { fr: 'Bonjour, je m’appelle Aziz.', ar: 'صباح الخير، اسمي عزيز.', phoneticHint: 'بونجور، جو مابيل عزيز.' },
    { fr: 'J’ai neuf ans et j’habite en Tunisie.', ar: 'عمري تسع سنوات وأسكن في تونس.', phoneticHint: 'جي نوف آن إيه جابيت أون تونيزي.' },
    { fr: 'Je suis élève en troisième année.', ar: 'أنا تلميذ في السنة الثالثة.', phoneticHint: 'جو سوي إيلف أون تروازيام أني.' },
    { fr: 'Tu parles français avec ton ami.', ar: 'تتكلم الفرنسية مع صديقك.', phoneticHint: 'تو بارل فرانسي أفيك تون أمي.' },
  ],
  'g4-french-verbs': [
    { fr: 'Je parle poliment avec mes amis.', ar: 'أتكلم بأدب مع أصدقائي.', phoneticHint: 'جو بارل بوليمون أفيك مي زامي.' },
    { fr: 'Nous sommes heureux dans notre école.', ar: 'نحن سعداء في مدرستنا.', phoneticHint: 'نو سوم أورو دان نوتر إيكول.' },
    { fr: 'Mes parents sont fiers de mon travail.', ar: 'والداي فخوران بعملي.', phoneticHint: 'مي بارون سون فيير دو مون ترافاي.' },
    { fr: 'Elle regarde un documentaire sur la mer.', ar: 'تشاهد فيلماً وثائقياً عن البحر.', phoneticHint: 'إيل روغارد آن دوكومونتير سور لا مير.' },
  ],
  'g4-french-articles-accord': [
    { fr: 'Aziz va à l’école chaque matin.', ar: 'يذهب عزيز إلى المدرسة كل صباح.', phoneticHint: 'عزيز فا آ ليكول شاك ماتان.' },
    { fr: 'Une fleur blanche pousse dans le jardin.', ar: 'تنمو زهرة بيضاء في الحديقة.', phoneticHint: 'أون فلور بلانش بوس دان لو جاردان.' },
    { fr: 'Notre classe est grande et propre.', ar: 'قسمنا كبير ونظيف.', phoneticHint: 'نوتر كلاس إي غراند إيه بروبر.' },
    { fr: 'Les petits chats dorment doucement.', ar: 'تنام القطط الصغيرة بهدوء.', phoneticHint: 'لي بوتي شا دورم دوسمون.' },
  ],
  'french-verbs': [
    { fr: 'Nous parlons français en classe avec notre maîtresse.', ar: 'نتكلم الفرنسية في القسم مع معلمتنا.', phoneticHint: 'نو بارلون فرانسي أون كلاس.' },
    { fr: 'Ils finissent leurs exercices avant la sonnerie.', ar: 'يُنهون تمارينهم قبل رنين الجرس.', phoneticHint: 'إيل فينيس لور زيكسيرسيس.' },
    { fr: 'Aziz lit un beau livre sur la science.', ar: 'يقرأ عزيز كتاباً جميلاً عن العلوم.', phoneticHint: 'عزيز لي آن بو ليفر سور لا سيونس.' },
    { fr: 'Vous choisissez le bon livre à la bibliothèque.', ar: 'تختارون الكتاب المناسب في المكتبة.', phoneticHint: 'فو شوازيسي لو بون ليفر.' },
  ],
  'g6-french-verbs': [
    { fr: 'Les élèves finissent leurs révisions avec sérieux.', ar: 'يُنهي التلاميذ مراجعتهم بجدية.', phoneticHint: 'لي زيلف فينيس لور ريفيزيون أفيك سيريو.' },
    { fr: 'Mes amis sont très motivés pour le concours.', ar: 'أصدقائي متحمسون جداً للمناظرة.', phoneticHint: 'مي زامي سون تري موتيفي.' },
    { fr: 'Les enfants parlent de leur projet écologique.', ar: 'يتحدث الأطفال عن مشروعهم البيئي.', phoneticHint: 'لي زونفون بارل دو لور بروجي.' },
    { fr: 'Demain, nous allons visiter le musée du Bardo.', ar: 'غداً، سنزور متحف باردو.', phoneticHint: 'دومان، نو زالون فيزيتي لو موزيه دو باردو.' },
  ],
};

function enrichFrenchLesson(lesson: Lesson): Lesson {
  if (lesson.frenchPhrases && lesson.frenchPhrases.length > 0) {
    return lesson;
  }
  const phrases = BASE_FRENCH_PHRASES[lesson.id];
  return phrases ? { ...lesson, frenchPhrases: phrases } : lesson;
}

export const LESSONS: Lesson[] = [
  ...LESSONS_GRADE_3,
  ...EXTRA_LESSONS_GRADE_3,
  ...LESSONS_GRADE_4,
  ...EXTRA_LESSONS_GRADE_4,
  ...LESSONS_GRADE_5,
  ...EXTRA_LESSONS_GRADE_5,
  ...LESSONS_GRADE_6,
  ...EXTRA_LESSONS_GRADE_6,
  ...EXPANSION_MATH_LESSONS,
  ...EXPANSION_SCIENCE_LESSONS,
  ...EXPANSION_ARABIC_LESSONS,
  ...EXPANSION_FRENCH_LESSONS,
  ...EXPANSION_SOCIAL_LESSONS,
  ...EXPANSION_REMEDIAL_2026_LESSONS,
  ...EXPANSION_FULL_YEAR_2026_LESSONS,
]
  .map(enrichFrenchLesson)
  .sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    const tDiff = (TRIMESTER_ORDER[a.trimester] ?? 9) - (TRIMESTER_ORDER[b.trimester] ?? 9);
    if (tDiff !== 0) return tDiff;
    return (SUBJECT_SORT_ORDER[a.subjectId] ?? 9) - (SUBJECT_SORT_ORDER[b.subjectId] ?? 9);
  });

