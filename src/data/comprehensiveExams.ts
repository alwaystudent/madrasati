import { ComprehensiveExamPreset, GradeLevel } from '../types/curriculum';
import { LESSONS } from './tunisianCurriculum';

function buildExamPresetsForGrade(grade: GradeLevel): ComprehensiveExamPreset[] {
  const gradeLessons = LESSONS.filter((l) => l.grade === grade);
  const t1 = gradeLessons
    .filter((l) => l.trimester === 'الثلاثي الأول')
    .flatMap((l) => l.exercises);
  const t2 = gradeLessons
    .filter((l) => l.trimester === 'الثلاثي الثاني')
    .flatMap((l) => l.exercises);
  const t3 = gradeLessons
    .filter((l) => l.trimester === 'الثلاثي الثالث')
    .flatMap((l) => l.exercises);

  // Pick balanced cross-subject questions across all 4 subjects
  const allBalanced = (['math', 'science', 'arabic', 'french'] as const).flatMap((subj) =>
    gradeLessons
      .filter((l) => l.subjectId === subj)
      .flatMap((l) => l.exercises.slice(0, 4))
  );

  const gradeTitle =
    grade === 6
      ? 'مناظرة السيزيام التجريبية الشاملة 2026'
      : `الاختبار التأليفي السنوي الشامل (${grade}ème)`;

  return [
    {
      id: `exam-g${grade}-t1`,
      grade,
      title: 'امتحان الثلاثي الأول الشامل (4 مواد)',
      trimester: 'الثلاثي الأول',
      description: 'تقييم تأليفي يجمع تمارين مختارة من دروس الثلاثي الأول في الرياضيات والإيقاظ والعربية والفرنسية.',
      durationMinutes: 12,
      bonusPoints: 35,
      exercises: (t1.length >= 8 ? t1 : allBalanced).slice(0, 10),
    },
    {
      id: `exam-g${grade}-t2`,
      grade,
      title: 'امتحان الثلاثي الثاني الشامل (4 مواد)',
      trimester: 'الثلاثي الثاني',
      description: 'اختبار متدرّج يغطي مهارات ومعارف الثلاثي الثاني وفق المنهج التونسي 2026.',
      durationMinutes: 12,
      bonusPoints: 40,
      exercises: (t2.length >= 8 ? t2 : allBalanced).slice(0, 10),
    },
    {
      id: `exam-g${grade}-t3`,
      grade,
      title: 'امتحان الثلاثي الثالث الشامل (4 مواد)',
      trimester: 'الثلاثي الثالث',
      description: 'مراجعة نهائية مركّزة لدروس الثلاثي الثالث مع تصحيح وتفسير فوري لكل سؤال.',
      durationMinutes: 12,
      bonusPoints: 45,
      exercises: (t3.length >= 8 ? t3 : allBalanced).slice(0, 10),
    },
    {
      id: `exam-g${grade}-annual`,
      grade,
      title: gradeTitle,
      trimester: 'شامل',
      description:
        grade === 6
          ? 'محاكاة كاملة لامتحان ختم التعليم الأساسي (السيزيام 2026) تشمل المواد الأساسية الأربع بـ 16 سؤالاً متدرّجاً.'
          : 'اختبار شامل لكامل السنة الدراسية يغطي المواد الأربع بـ 16 تمريناً متنوعاً لقياس الجاهزية الكاملة.',
      durationMinutes: 18,
      bonusPoints: 70,
      exercises: allBalanced.slice(0, 16),
    },
  ];
}

export function getComprehensiveExams(grade: GradeLevel): ComprehensiveExamPreset[] {
  return buildExamPresetsForGrade(grade);
}
