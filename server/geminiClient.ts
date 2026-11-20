import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export interface LessonChatStepContext {
  title: string;
  instruction: string;
  takeaway: string;
}

export interface LessonChatContext {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  grade: number;
  gradeLabel: string;
  trimester: string;
  subtitle: string;
  simTitle: string;
  simDescription: string;
  steps: LessonChatStepContext[];
  frenchPhrases?: { fr: string; ar: string }[];
}

export interface LessonChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface AskLessonTutorInput {
  lesson: LessonChatContext;
  studentName?: string;
  history?: LessonChatTurn[];
  message: string;
}

export class TutorApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let cachedAi: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new TutorApiError(
      503,
      'مفتاح Gemini API غير مهيّأ على الخادم حالياً. يرجى إضافته في إعدادات البيئة (Secrets).'
    );
  }
  if (!cachedAi) {
    cachedAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedAi;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSystemInstruction(lesson: LessonChatContext, studentName: string): string {
  const stepsSummary = lesson.steps
    .map(
      (s, i) =>
        `${i + 1}. ${s.title}\n   - التجربة/المهمة: ${s.instruction}\n   - القاعدة الذهبية: ${s.takeaway}`
    )
    .join('\n');

  const frenchContext =
    lesson.frenchPhrases && lesson.frenchPhrases.length > 0
      ? `\nجمل ومفردات فرنسية في هذا الدرس:\n${lesson.frenchPhrases
          .map((p) => `- "${p.fr}" = ${p.ar}`)
          .join('\n')}`
      : '';

  return `أنت "المعلّم الذكي" في منصة «منارة التعلّم» وفق المنهاج الرسمي للجمهورية التونسية 2026.
تتحدث مع التلميذ(ة) «${studentName}» الذي يدرس في «${lesson.gradeLabel}».

مهمتك الحالية مساعدة التلميذ داخل الدرس الجاري فقط:
- عنوان الدرس: ${lesson.title}
- المادة: ${lesson.subjectName}
- الثلاثي: ${lesson.trimester}
- وصف المختبر التفاعلي (${lesson.simTitle}): ${lesson.simDescription}
- أهداف وخطوات الدرس:
${stepsSummary}${frenchContext}

قواعد أسلوبك التربوي:
1. اشرح بأسلوب عربي مبسّط وودود ومحفّز يناسب تلميذ المرحلة الابتدائية في تونس، مع أمثلة ملموسة من الحياة اليومية في تونس عند الحاجة.
2. التزم بمحتوى هذا الدرس ومستوى ${lesson.gradeLabel}؛ وإذا سأل التلميذ عن موضوع خارج هذا الدرس وجّهه بلطف للتركيز على الدرس الحالي أو اربطه بمفهوم الدرس إن أمكن.
3. اجعل الإجابة مركّزة ومرتبطة بالسؤال (حوالي 3 إلى 6 أسطر قصيرة واضحة أو نقاط مرقّمة) دون حشو طويل، وتجنّب أي عبارات تقنية أو إنجليزية غير مرتبطة بالدرس.
4. إذا كان الدرس في مادة اللغة الفرنسية، اكتب الكلمات والجمل الفرنسية بشكل سليم ومشكّل بالحروف الصحيحة مع شرحها بالعربية وتقديم نصيحة نطق واضحة.
5. عند مساعدة التلميذ على فهم سؤال أو تمرين، اشرح له الطريقة وخطوة التفكير وشجّعه.`;
}

export async function askLessonTutor(input: AskLessonTutorInput): Promise<string> {
  const cleanMessage = input.message.trim();
  if (!cleanMessage) {
    throw new TutorApiError(400, 'يرجى كتابة سؤالك أولاً قبل الإرسال.');
  }
  if (cleanMessage.length > 1500) {
    throw new TutorApiError(400, 'السؤال طويل جداً؛ يرجى اختصاره في بضع جمل.');
  }

  const ai = getAiClient();
  const studentName = (input.studentName || 'عزيز').trim() || 'عزيز';
  const systemInstruction = buildSystemInstruction(input.lesson, studentName);

  const safeHistory = (input.history ?? [])
    .filter((t) => (t.role === 'user' || t.role === 'model') && typeof t.text === 'string' && t.text.trim())
    .slice(-10)
    .map((t) => ({
      role: t.role,
      parts: [{ text: t.text.trim() }],
    }));

  const contents = [
    ...safeHistory,
    {
      role: 'user' as const,
      parts: [{ text: cleanMessage }],
    },
  ];

  const maxAttempts = 3;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const answer = response.text?.trim();
      if (!answer) {
        throw new TutorApiError(502, 'لم يصل رد نصي من المعلّم الذكي، يرجى المحاولة مرة أخرى.');
      }
      return answer;
    } catch (err) {
      lastError = err;
      if (err instanceof TutorApiError) {
        throw err;
      }

      const rawMessage = err instanceof Error ? err.message : String(err);
      const statusMatch = rawMessage.match(/\b(400|401|403|404|429|500|502|503|504)\b/);
      const statusCode = statusMatch ? Number(statusMatch[1]) : 500;

      if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
        throw new TutorApiError(
          statusCode,
          'تعذّر التحقق من صلاحية مفتاح Gemini API في إعدادات المشروع (Secrets).'
        );
      }
      if (statusCode === 404) {
        throw new TutorApiError(
          404,
          'النموذج المطلوب غير متاح حالياً، يرجى مراجعة إعدادات الخادم.'
        );
      }
      if (statusCode === 429) {
        if (attempt < maxAttempts - 1) {
          await sleep(600 * (attempt + 1));
          continue;
        }
        throw new TutorApiError(
          429,
          'المعلّم الذكي مشغول جداً الآن بكثرة الطلبات. انتظر لحظة ثم أعد المحاولة.'
        );
      }

      if (attempt < maxAttempts - 1) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
    }
  }

  const fallbackMsg =
    lastError instanceof Error ? lastError.message : 'تعذّر الاتصال بالمعلّم الذكي حالياً.';
  throw new TutorApiError(502, `حدث خطأ أثناء الاتصال بالمعلّم الذكي: ${fallbackMsg}`);
}
