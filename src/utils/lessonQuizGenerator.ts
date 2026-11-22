import { LESSONS } from '../data/tunisianCurriculum';
import { Exercise, Lesson } from '../types/curriculum';

export interface PostLessonQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedStepTitle: string;
  relatedTakeaway: string;
  ltr?: boolean;
}

function deterministicHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rotateOptions(
  correct: string,
  distractors: string[],
  seed: string
): { options: string[]; correctIndex: number } {
  const uniqueDistractors: string[] = [];
  for (const d of distractors) {
    const trimmed = d.trim();
    if (trimmed && trimmed !== correct.trim() && !uniqueDistractors.includes(trimmed)) {
      uniqueDistractors.push(trimmed);
    }
    if (uniqueDistractors.length === 3) break;
  }

  const all = [correct.trim(), ...uniqueDistractors];
  const shift = deterministicHash(seed) % all.length;
  const rotated = all.map((_, idx) => all[(idx + all.length - shift) % all.length]);
  return {
    options: rotated,
    correctIndex: rotated.indexOf(correct.trim()),
  };
}

function exerciseToQuizQuestion(
  ex: Exercise,
  lesson: Lesson,
  idx: number
): PostLessonQuizQuestion | null {
  const fallbackStep = lesson.steps[idx % Math.max(1, lesson.steps.length)];
  const stepTitle = fallbackStep?.title ?? lesson.title;
  const takeaway = fallbackStep?.takeaway ?? lesson.supportTip ?? lesson.subtitle;

  if (ex.type === 'choice') {
    return {
      id: `${lesson.id}-quiz-ex-${ex.id}`,
      prompt: ex.prompt,
      options: ex.options,
      correctIndex: ex.correctIndex,
      explanation: ex.explanation,
      relatedStepTitle: stepTitle,
      relatedTakeaway: takeaway,
      ltr: ex.ltr,
    };
  }

  if (ex.type === 'fill_blank' && ex.choices.length >= 2) {
    const correctIndex = ex.choices.indexOf(ex.correctChoice);
    if (correctIndex !== -1) {
      return {
        id: `${lesson.id}-quiz-ex-${ex.id}`,
        prompt: `${ex.prompt} — (${ex.beforeBlank} [ ... ] ${ex.afterBlank})`.trim(),
        options: ex.choices,
        correctIndex,
        explanation: ex.explanation,
        relatedStepTitle: stepTitle,
        relatedTakeaway: takeaway,
        ltr: ex.ltr,
      };
    }
  }

  if (ex.type === 'classify' && ex.items.length > 0) {
    const targetItem = ex.items[0];
    const isFrench = lesson.subjectId === 'french' || Boolean(ex.ltr);
    const correctLabel =
      targetItem.targetBin === 'A' ? ex.binALabel : ex.binBLabel;
    const otherLabel =
      targetItem.targetBin === 'A' ? ex.binBLabel : ex.binALabel;
    const { options, correctIndex } = rotateOptions(
      correctLabel,
      [otherLabel],
      `${lesson.id}-${ex.id}`
    );
    return {
      id: `${lesson.id}-quiz-ex-${ex.id}`,
      prompt: isFrench
        ? `${ex.prompt} : « ${targetItem.label} »`
        : `${ex.prompt}: أين نصنّف «${targetItem.label}»؟`,
      options,
      correctIndex,
      explanation: ex.explanation,
      relatedStepTitle: stepTitle,
      relatedTakeaway: takeaway,
      ltr: ex.ltr,
    };
  }

  if (ex.type === 'order' && ex.correctOrder.length >= 2) {
    const correctSeq = ex.correctOrder.join(' ← ');
    const reversedSeq = [...ex.correctOrder].reverse().join(' ← ');
    const swapped = [...ex.correctOrder];
    if (swapped.length >= 2) {
      const tmp = swapped[0];
      swapped[0] = swapped[1];
      swapped[1] = tmp;
    }
    const swappedSeq = swapped.join(' ← ');
    const { options, correctIndex } = rotateOptions(
      correctSeq,
      [reversedSeq, swappedSeq],
      `${lesson.id}-${ex.id}`
    );
    if (options.length >= 2) {
      return {
        id: `${lesson.id}-quiz-ex-${ex.id}`,
        prompt: ex.prompt,
        options,
        correctIndex,
        explanation: ex.explanation,
        relatedStepTitle: stepTitle,
        relatedTakeaway: takeaway,
        ltr: ex.ltr,
      };
    }
  }

  return null;
}

export function buildPostLessonQuiz(lesson: Lesson): PostLessonQuizQuestion[] {
  const questions: PostLessonQuizQuestion[] = [];
  const isFrench = lesson.subjectId === 'french';

  // 1. Pick up to 2 distinct exercise-derived questions first (prefer choice & fill_blank)
  const prioritized = [
    ...lesson.exercises.filter((e) => e.type === 'choice' || e.type === 'fill_blank'),
    ...lesson.exercises.filter((e) => e.type === 'classify' || e.type === 'order'),
  ];

  for (let i = 0; i < prioritized.length && questions.length < 2; i++) {
    const q = exerciseToQuizQuestion(prioritized[i], lesson, i);
    if (q && !questions.some((existing) => existing.prompt === q.prompt)) {
      questions.push(q);
    }
  }

  // 2. Add step/rule mastery question(s) from the lesson's discovery steps so the quiz
  // reinforces conceptual takeaways from the lesson (Arabic lessons & non-French subjects,
  // or French rules without translating sentences).
  const peerTakeaways = LESSONS.filter(
    (other) =>
      other.id !== lesson.id &&
      other.subjectId === lesson.subjectId &&
      other.grade === lesson.grade
  )
    .flatMap((other) => other.steps.map((s) => s.takeaway))
    .filter((t) => t.trim().length > 8);

  const fallbackPool = LESSONS.filter(
    (other) => other.id !== lesson.id && other.subjectId === lesson.subjectId
  )
    .flatMap((other) => other.steps.map((s) => s.takeaway))
    .filter((t) => t.trim().length > 8);

  const combinedDistractors = [...peerTakeaways, ...fallbackPool];

  for (let sIdx = 0; sIdx < lesson.steps.length && questions.length < 4; sIdx++) {
    const step = lesson.steps[sIdx];
    if (!step?.takeaway) continue;

    // For French lessons, avoid asking Arabic takeaway questions if another French exercise exists
    if (isFrench && lesson.exercises.length > questions.length + 1) {
      const extraEx = prioritized.find(
        (e) => !questions.some((q) => q.id.endsWith(e.id))
      );
      if (extraEx) {
        const extraQ = exerciseToQuizQuestion(extraEx, lesson, sIdx + 2);
        if (extraQ) {
          questions.push(extraQ);
          continue;
        }
      }
    }

    const { options, correctIndex } = rotateOptions(
      step.takeaway,
      combinedDistractors,
      `${lesson.id}-step-${sIdx}`
    );

    if (options.length >= 3) {
      questions.push({
        id: `${lesson.id}-quiz-step-${sIdx}`,
        prompt: `في محور «${step.title}» من هذا الدرس، ما هي القاعدة الصحيحة التي تعلّمناها؟`,
        options,
        correctIndex,
        explanation: `صحيح! القاعدة الأساسية في «${step.title}» هي: ${step.takeaway}`,
        relatedStepTitle: step.title,
        relatedTakeaway: step.takeaway,
        ltr: false,
      });
    }
  }

  // 3. Fill up to 4 questions with remaining exercises if needed
  for (let i = 0; i < prioritized.length && questions.length < 4; i++) {
    const ex = prioritized[i];
    if (questions.some((q) => q.id.endsWith(ex.id))) continue;
    const q = exerciseToQuizQuestion(ex, lesson, i);
    if (q) {
      questions.push(q);
    }
  }

  return questions.slice(0, 4);
}
