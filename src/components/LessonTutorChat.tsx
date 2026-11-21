import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  User,
  Volume2,
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import { Lesson } from '../types/curriculum';
import { speakFrenchText } from '../utils/frenchSpeech';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface LessonTutorChatProps {
  lesson: Lesson;
  studentName: string;
  prefillPrompt?: string | null;
  onConsumePrefill?: () => void;
}

function extractFrenchChunks(text: string): string[] {
  const matches = text.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ’'’\s,.;!?-]{2,}/g);
  if (!matches) return [];
  return Array.from(
    new Set(
      matches
        .map((m) => m.trim())
        .filter((m) => m.length >= 3 && /[a-zA-ZÀ-ÿ]{2,}/.test(m))
    )
  ).slice(0, 4);
}

export const LessonTutorChat: React.FC<LessonTutorChatProps> = ({
  lesson,
  studentName,
  prefillPrompt,
  onConsumePrefill,
}) => {
  const subject = SUBJECTS[lesson.subjectId];
  const gradeMeta = GRADES.find((g) => g.grade === lesson.grade) ?? GRADES[3];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Reset conversation when switching lessons
  useEffect(() => {
    setMessages([]);
    setInputValue('');
    setErrorMessage(null);
    setLastFailedQuestion(null);
  }, [lesson.id]);

  // Apply external prefill prompt (e.g. "Ask AI about this step")
  useEffect(() => {
    if (prefillPrompt && prefillPrompt.trim()) {
      setInputValue(prefillPrompt);
      onConsumePrefill?.();
    }
  }, [prefillPrompt, onConsumePrefill]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const quickPrompts: string[] =
    lesson.subjectId === 'french'
      ? [
          `اشرح لي قاعدة درس «${lesson.title}» بالعربية وبأمثلة فرنسية سهلة.`,
          'أعطني 3 جمل فرنسية بسيطة من هذا الدرس مع ترجمتها ونطقها.',
          'ما هي الأخطاء الشائعة التي يقع فيها التلاميذ في هذا الدرس؟',
          'اطرح عليّ سؤالاً تدريبياً صغيراً لأتأكد من فهمي.',
        ]
      : [
          `اشرح لي فكرة درس «${lesson.title}» بأسلوب مبسّط.`,
          'أعطني مثالاً تطبيقياً من حياتنا اليومية في تونس.',
          'ما هي القاعدة الذهبية التي يجب أن أحفظها قبل الامتحان؟',
          'ساعدني على فهم خطوات المختبر التفاعلي خطوة بخطوة.',
        ];

  const lastSentAtRef = useRef<number>(0);

  const sendQuestion = async (questionText: string) => {
    const clean = questionText.trim();
    if (!clean || loading) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < 1500) return;
    lastSentAtRef.current = now;

    const userTurn: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: clean,
    };

    const nextHistory = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    // Serve identical first-turn questions from sessionStorage cache to save Vercel/Gemini calls
    const cacheKey = `tutor_cache_${lesson.id}_${clean}`;
    if (nextHistory.length === 0) {
      try {
        const cachedReply = sessionStorage.getItem(cacheKey);
        if (cachedReply) {
          setMessages((prev) => [
            ...prev,
            userTurn,
            { id: `m-${Date.now()}`, role: 'model', text: cachedReply },
          ]);
          setInputValue('');
          setErrorMessage(null);
          return;
        }
      } catch {
        // Ignore sessionStorage errors
      }
    }

    setMessages((prev) => [...prev, userTurn]);
    setInputValue('');
    setErrorMessage(null);
    setLastFailedQuestion(null);
    setLoading(true);

    try {
      const res = await fetch('/api/lesson-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          message: clean.slice(0, 600),
          history: nextHistory.slice(-8),
          lesson: {
            id: lesson.id,
            title: lesson.title,
            subjectId: lesson.subjectId,
            subjectName: subject.name,
            grade: lesson.grade,
            gradeLabel: gradeMeta.label,
            trimester: lesson.trimester,
            subtitle: lesson.subtitle,
            simTitle: lesson.simTitle,
            simDescription: lesson.simDescription,
            steps: lesson.steps,
            frenchPhrases: lesson.frenchPhrases?.map((p) => ({ fr: p.fr, ar: p.ar })),
          },
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'تعذّر الحصول على رد من المعلّم الذكي.');
      }

      if (nextHistory.length === 0) {
        try {
          sessionStorage.setItem(cacheKey, data.reply);
        } catch {
          // Ignore quota
        }
      }

      const modelTurn: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.reply,
      };
      setMessages((prev) => [...prev, modelTurn]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'حدث خطأ أثناء الاتصال بالمعلّم الذكي. حاول مرة أخرى.';
      setErrorMessage(msg);
      setLastFailedQuestion(clean);
      // Remove optimistic user message so retry doesn't duplicate it
      setMessages((prev) => prev.filter((m) => m.id !== userTurn.id));
      setInputValue(clean);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendQuestion(inputValue);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 truncate">
              المعلّم الذكي للدرس
            </h2>
            <p className="text-xs text-slate-600 truncate">
              اسأل أي سؤال حول «{lesson.title}» ({gradeMeta.shortLabel})
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setErrorMessage(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            محادثة جديدة
          </button>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white space-y-2">
        <div className="text-xs font-semibold text-slate-500">
          أسئلة مقترحة للبدء السريع:
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => void sendQuestion(q)}
              className="px-3 py-1.5 text-xs font-medium text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors text-right cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Area */}
      <div className="p-4 sm:p-5 space-y-4 min-h-[300px] max-h-[460px] overflow-y-auto bg-slate-50/40">
        {messages.length === 0 && !loading && (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-2">
            <Sparkles className="w-7 h-7 text-sky-600 mx-auto" aria-hidden="true" />
            <div className="text-sm font-display font-bold text-slate-900">
              مرحباً {studentName || 'عزيز'}! أنا هنا لمساعدتك في هذا الدرس
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              اكتب أي نقطة لم تفهمها في «{lesson.title}» أو اضغط على أحد الأسئلة المقترحة بالأعلى وسأشرحها لك فوراً خطوة بخطوة.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const frenchChunks =
            !isUser && lesson.subjectId === 'french' ? extractFrenchChunks(msg.text) : [];

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Bot className="w-4 h-4" aria-hidden="true" />
                )}
              </div>

              <div
                className={`flex-1 rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-sky-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <div>{msg.text}</div>

                {frenchChunks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-500 ml-1">نطق العبارات:</span>
                    {frenchChunks.map((chunk) => (
                      <button
                        key={chunk}
                        type="button"
                        dir="ltr"
                        onClick={() => speakFrenchText(chunk)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>{chunk}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-600">
              يفكّر المعلّم الذكي في إجابة واضحة لك...
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-rose-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
            {lastFailedQuestion && (
              <button
                type="button"
                onClick={() => void sendQuestion(lastFailedQuestion)}
                className="px-3 py-1.5 text-xs font-semibold bg-white text-rose-800 border border-rose-300 hover:bg-rose-100 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        )}

        <div ref={listEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2.5"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
          placeholder={`اكتب سؤالك حول «${lesson.title}»...`}
          aria-label="اكتب سؤالك للمعلّم الذكي"
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          إرسال
        </button>
      </form>
    </div>
  );
};
