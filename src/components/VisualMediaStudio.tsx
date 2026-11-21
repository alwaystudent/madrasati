import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  Clapperboard,
  FlaskConical,
  Landmark,
  Languages,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import { VISUAL_MODULES, VisualLessonModule } from '../data/visualMediaData';
import { GradeLevel, SubjectId } from '../types/curriculum';
import { speakArabicText, stopArabicSpeech } from '../utils/arabicSpeech';

interface VisualMediaStudioProps {
  selectedGrade: GradeLevel;
  studentName: string;
  onRecordVisualStudy: (
    moduleId: string,
    title: string,
    grade: GradeLevel,
    subjectId: SubjectId,
    score: number,
    total: number,
    points: number
  ) => void;
}

export const VisualMediaStudio: React.FC<VisualMediaStudioProps> = ({
  selectedGrade,
  studentName,
  onRecordVisualStudy,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [gradeFilter, setGradeFilter] = useState<GradeLevel>(selectedGrade);
  const [subjectFilter, setSubjectFilter] = useState<'all' | SubjectId>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    return (
      VISUAL_MODULES.find((m) => m.grade === selectedGrade)?.id ?? VISUAL_MODULES[0].id
    );
  });
  const [sceneIdx, setSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [heroImgError, setHeroImgError] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    setGradeFilter(selectedGrade);
    setSubjectFilter('all');
    const firstForGrade = VISUAL_MODULES.find((m) => m.grade === selectedGrade);
    if (firstForGrade) {
      setSelectedModuleId(firstForGrade.id);
      setSceneIdx(0);
      setSceneProgress(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  }, [selectedGrade]);

  const gradeModules = VISUAL_MODULES.filter((m) => m.grade === gradeFilter);
  const filteredModules = gradeModules.filter(
    (m) => subjectFilter === 'all' || m.subjectId === subjectFilter
  );

  const activeModule: VisualLessonModule =
    filteredModules.find((m) => m.id === selectedModuleId) ??
    filteredModules[0] ??
    gradeModules[0] ??
    VISUAL_MODULES[0];

  const currentScene = activeModule.scenes[sceneIdx] ?? activeModule.scenes[0];
  const activeGradeMeta =
    GRADES.find((g) => g.grade === gradeFilter) ?? GRADES[3];

  useEffect(() => {
    if (!isPlaying) return;
    const durationMs = currentScene.durationSec * 1000;
    const intervalMs = 150;
    const step = (intervalMs / durationMs) * 100;

    const timer = window.setInterval(() => {
      setSceneProgress((prev) => {
        if (prev + step >= 100) {
          setSceneIdx((idx) => (idx + 1) % activeModule.scenes.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, sceneIdx, currentScene.durationSec, activeModule.scenes.length]);

  useEffect(() => {
    if (voiceEnabled && isPlaying) {
      speakArabicText(currentScene.narration, 'normal');
    } else {
      stopArabicSpeech();
    }
    return () => stopArabicSpeech();
  }, [voiceEnabled, isPlaying, currentScene.narration]);

  const handleSelectGrade = (grade: GradeLevel) => {
    stopArabicSpeech();
    setGradeFilter(grade);
    setSubjectFilter('all');
    const nextMod = VISUAL_MODULES.find((m) => m.grade === grade);
    if (nextMod) {
      setSelectedModuleId(nextMod.id);
    }
    setSceneIdx(0);
    setSceneProgress(0);
    setIsPlaying(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleSelectSubject = (subj: 'all' | SubjectId) => {
    setSubjectFilter(subj);
    const list = gradeModules.filter((m) => subj === 'all' || m.subjectId === subj);
    if (list.length > 0 && !list.some((m) => m.id === selectedModuleId)) {
      setSelectedModuleId(list[0].id);
      setSceneIdx(0);
      setSceneProgress(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  const handleSelectModule = (modId: string) => {
    stopArabicSpeech();
    setSelectedModuleId(modId);
    setSceneIdx(0);
    setSceneProgress(0);
    setIsPlaying(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleJumpScene = (idx: number) => {
    setSceneIdx(idx);
    setSceneProgress(0);
  };

  const handleSubmitQuiz = () => {
    if (quizSubmitted) return;
    setQuizSubmitted(true);
    const correctCount = activeModule.quiz.reduce(
      (acc, q, i) => (quizAnswers[i] === q.correctIndex ? acc + 1 : acc),
      0
    );
    const pts = correctCount * 15 + 15;
    onRecordVisualStudy(
      activeModule.id,
      `مقطع مرئي: ${activeModule.title}`,
      activeModule.grade,
      activeModule.subjectId,
      correctCount,
      activeModule.quiz.length,
      pts
    );
  };

  const renderAnimatedStage = () => {
    switch (activeModule.visualKind) {
      case 'blood_cycle': {
        const pulseScale = isPlaying && !shouldReduceMotion ? [1, 1.09, 1] : 1;
        const fastBeat = sceneIdx === 3 ? 0.65 : 1.15;
        return (
          <svg
            viewBox="0 0 640 280"
            className="w-full h-full"
            role="img"
            aria-label="رسم متحرك للدورة الدموية والقلب"
          >
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <g opacity={sceneIdx === 1 || sceneIdx === 2 ? 1 : 0.65}>
              <ellipse cx="145" cy="135" rx="52" ry="70" fill="#0ea5e9" fillOpacity="0.22" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="145" y="132" textAnchor="middle" fill="#bae6fd" fontSize="14" fontWeight="700">
                الرئتان
              </text>
              <text x="145" y="152" textAnchor="middle" fill="#7dd3fc" fontSize="11">
                (تزويد بالأكسيجين O₂)
              </text>
            </g>
            <g opacity={sceneIdx >= 2 ? 1 : 0.65}>
              <rect x="448" y="80" width="135" height="115" rx="18" fill="#10b981" fillOpacity="0.16" stroke="#34d399" strokeWidth="2.5" />
              <text x="515" y="132" textAnchor="middle" fill="#a7f3d0" fontSize="14" fontWeight="700">
                عضلات الجسم
              </text>
              <text x="515" y="154" textAnchor="middle" fill="#6ee7b7" fontSize="11">
                {sceneIdx === 3 ? 'حركة ونشاط: طلب طاقة أعلى!' : 'تتغذّى بالدم النقي'}
              </text>
            </g>
            <path d="M 195 110 Q 320 55 448 115" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="10 8" />
            <path d="M 448 165 Q 320 225 195 165" fill="none" stroke="#3b82f6" strokeWidth="5" strokeDasharray="10 8" />
            {!shouldReduceMotion && isPlaying && (
              <>
                <motion.circle
                  r="8"
                  fill="#fca5a5"
                  stroke="#ef4444"
                  strokeWidth="2"
                  animate={{ cx: [195, 320, 448], cy: [110, 72, 115] }}
                  transition={{ duration: fastBeat * 2.2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.circle
                  r="7"
                  fill="#93c5fd"
                  stroke="#2563eb"
                  strokeWidth="2"
                  animate={{ cx: [448, 320, 195], cy: [165, 205, 165] }}
                  transition={{ duration: fastBeat * 2.2, repeat: Infinity, ease: 'linear' }}
                />
              </>
            )}
            <motion.g
              style={{ originX: '320px', originY: '140px' }}
              animate={{ scale: pulseScale }}
              transition={{ duration: fastBeat, repeat: Infinity }}
            >
              <circle cx="320" cy="140" r="46" fill="#be123c" stroke="#fda4af" strokeWidth="3" />
              <text x="320" y="136" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="800">
                القلب
              </text>
              <text x="320" y="155" textAnchor="middle" fill="#fecdd3" fontSize="11">
                {sceneIdx === 3 ? '120 نبضة/دق' : '75 نبضة/دق'}
              </text>
            </motion.g>
            <text x="320" y="34" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
              الشرايين الحمراء تنقل الأكسيجين — والأوردة الزرقاء تعيد الدم للقلب
            </text>
          </svg>
        );
      }

      case 'electric_circuit': {
        const closed = sceneIdx >= 2;
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="رسم متحرك للدارة الكهربائية">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <rect x="130" y="65" width="380" height="155" rx="16" fill="none" stroke={closed ? '#f59e0b' : '#475569'} strokeWidth="6" />
            <g>
              <rect x="95" y="102" width="70" height="82" rx="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="130" y="132" textAnchor="middle" fill="#7dd3fc" fontSize="13" fontWeight="700">بطارية</text>
              <text x="130" y="152" textAnchor="middle" fill="#bae6fd" fontSize="12" fontWeight="700">+ 4.5V -</text>
            </g>
            <g>
              <rect x="260" y="42" width="120" height="44" rx="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="280" y1="65" x2="355" y2={closed ? 65 : 46} stroke={closed ? '#34d399' : '#f87171'} strokeWidth="5" strokeLinecap="round" />
              <text x="320" y="104" textAnchor="middle" fill={closed ? '#6ee7b7' : '#fca5a5'} fontSize="12" fontWeight="700">
                {closed ? 'القاطعة مغلقة (دارة مغلقة)' : 'القاطعة مفتوحة (دارة مفتوحة)'}
              </text>
            </g>
            <g>
              {closed && <circle cx="510" cy="142" r="52" fill="#facc15" fillOpacity="0.22" />}
              <circle cx="510" cy="142" r="30" fill={closed ? '#fde047' : '#334155'} stroke={closed ? '#f59e0b' : '#64748b'} strokeWidth="3" />
              <text x="510" y="147" textAnchor="middle" fill={closed ? '#78350f' : '#cbd5e1'} fontSize="13" fontWeight="800">
                {closed ? 'مضيء!' : 'منطفئ'}
              </text>
            </g>
            <rect x="240" y="200" width="160" height="36" rx="8" fill="#1e293b" stroke="#fbbf24" strokeWidth="2" />
            <text x="320" y="223" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="700">
              {sceneIdx === 3 ? 'مادة ناقلة: سلك نحاسي' : 'سلك توصيل نحاسي'}
            </text>
            {closed && isPlaying && !shouldReduceMotion && (
              <>
                <motion.circle r="6" fill="#38bdf8" animate={{ cx: [130, 510, 510, 130], cy: [65, 65, 220, 220] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }} />
                <motion.circle r="6" fill="#7dd3fc" animate={{ cx: [510, 130, 130, 510], cy: [220, 220, 65, 65] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }} />
              </>
            )}
          </svg>
        );
      }

      case 'photosynthesis': {
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="رسم متحرك للتركيب الضوئي">
            <rect width="640" height="280" fill="#064e3b" rx="12" />
            <rect x="0" y="210" width="640" height="70" fill="#451a03" />
            <text x="95" y="248" fill="#fde68a" fontSize="12" fontWeight="700">الجذور تمتص الماء والأملاح</text>
            <motion.circle cx="545" cy="55" r="34" fill="#facc15" animate={isPlaying && !shouldReduceMotion ? { scale: [1, 1.08, 1] } : undefined} transition={{ duration: 2.2, repeat: Infinity }} />
            <line x1="510" y1="75" x2="365" y2="120" stroke="#fde047" strokeWidth="3" strokeDasharray="6 6" />
            <text x="455" y="82" fill="#fef08a" fontSize="12" fontWeight="700">طاقة ضوء الشمس</text>
            <path d="M 320 212 L 280 250 M 320 212 L 320 258 M 320 212 L 360 248" stroke="#d97706" strokeWidth="4" />
            <rect x="313" y="105" width="14" height="110" rx="6" fill="#22c55e" />
            {isPlaying && !shouldReduceMotion && (
              <motion.circle cx="320" r="5" fill="#38bdf8" animate={{ cy: [215, 115] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }} />
            )}
            <ellipse cx="268" cy="135" rx="48" ry="24" transform="rotate(-18 268 135)" fill="#16a34a" stroke="#86efac" strokeWidth="2" />
            <ellipse cx="372" cy="128" rx="50" ry="25" transform="rotate(16 372 128)" fill="#16a34a" stroke="#86efac" strokeWidth="2" />
            <ellipse cx="320" cy="86" rx="44" ry="24" fill="#22c55e" stroke="#bbf7d0" strokeWidth="2" />
            <text x="320" y="91" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">اليخضور</text>
            {sceneIdx >= 2 && (
              <motion.g animate={isPlaying && !shouldReduceMotion ? { y: [0, -25, 0] } : undefined} transition={{ duration: 2.5, repeat: Infinity }}>
                <circle cx="195" cy="90" r="22" fill="#0ea5e9" fillOpacity="0.3" stroke="#7dd3fc" strokeWidth="2" />
                <text x="195" y="95" textAnchor="middle" fill="#e0f2fe" fontSize="13" fontWeight="800">O₂ نقي</text>
              </motion.g>
            )}
          </svg>
        );
      }

      case 'fractions': {
        const parts = sceneIdx === 0 ? 2 : sceneIdx === 1 ? 4 : 8;
        const colored = parts / 2;
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="رسم بصري للكسور المتكافئة">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <text x="320" y="42" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="800">
              مقارنة الأشرطة الكسرية المتكافئة: {colored}/{parts} = 1/2
            </text>
            <g transform="translate(80, 72)">
              <rect x="0" y="0" width="240" height="44" fill="#0284c7" stroke="#bae6fd" strokeWidth="2" />
              <rect x="240" y="0" width="240" height="44" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <text x="120" y="27" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800">1/2 (نصف)</text>
            </g>
            <g transform="translate(80, 140)">
              {Array.from({ length: parts }).map((_, i) => {
                const w = 480 / parts;
                return (
                  <rect key={i} x={i * w} y="0" width={w} height="48" fill={i < colored ? '#f59e0b' : '#1e293b'} stroke="#fde68a" strokeWidth="2" />
                );
              })}
              <text x="240" y="76" textAnchor="middle" fill="#fde68a" fontSize="15" fontWeight="800">
                الشريط مقسّم إلى {parts} أجزاء — الملوّن: {colored}/{parts}
              </text>
            </g>
          </svg>
        );
      }

      case 'perimeter_area': {
        const highlightArea = sceneIdx >= 2;
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="المحيط والمساحة">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <text x="320" y="38" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="800">
              {highlightArea ? 'المساحة = المربعات بالداخل: 5 × 3 = 15 م²' : 'المحيط = السياج الخارجي: (5 + 3) × 2 = 16 م'}
            </text>
            <g transform="translate(170, 65)">
              {Array.from({ length: 15 }).map((_, idx) => (
                <rect
                  key={idx}
                  x={(idx % 5) * 60}
                  y={Math.floor(idx / 5) * 50}
                  width="60"
                  height="50"
                  fill={highlightArea ? '#10b981' : '#1e293b'}
                  fillOpacity={highlightArea ? 0.35 : 0.7}
                  stroke="#475569"
                  strokeWidth="1.5"
                />
              ))}
              <rect x="0" y="0" width="300" height="150" fill="none" stroke={!highlightArea ? '#38bdf8' : '#94a3b8'} strokeWidth={!highlightArea ? 6 : 2.5} rx="4" />
              <text x="150" y="176" textAnchor="middle" fill="#7dd3fc" fontSize="14" fontWeight="700">الطول = 5 م</text>
              <text x="-35" y="80" textAnchor="middle" fill="#7dd3fc" fontSize="14" fontWeight="700">3 م</text>
            </g>
          </svg>
        );
      }

      case 'nawasikh': {
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="النواسخ وسلّم الهمزة">
            <rect width="640" height="280" fill="#1e1b4b" rx="12" />
            <text x="320" y="42" textAnchor="middle" fill="#fef3c7" fontSize="16" fontWeight="800">
              {sceneIdx === 3 ? 'سُلّم قوّة الحركات في الهمزة المتوسطة' : 'تأثير النواسخ (كانَ و إنَّ) على الجملة الاسمية'}
            </text>
            {sceneIdx < 3 ? (
              <g transform="translate(80, 75)">
                <rect x="0" y="0" width="480" height="72" rx="14" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
                <text x="240" y="45" textAnchor="middle" fill="#ffffff" fontSize="21" fontWeight="800">
                  {sceneIdx === 0
                    ? 'الجوُّ لطيفٌ (مبتدأ مرفوع + خبر مرفوع)'
                    : sceneIdx === 1
                    ? 'كانَ الجوُّ لطيفاً (ترفع الأول وتنصب الثاني)'
                    : 'إنَّ العلمَ نورٌ (تنصب الأول وترفع الثاني)'}
                </text>
                <rect x="35" y="95" width="190" height="58" rx="10" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
                <text x="130" y="129" textAnchor="middle" fill="#bae6fd" fontSize="14" fontWeight="700">كانَ ← ترفع ُ ثم تنصب َ</text>
                <rect x="255" y="95" width="190" height="58" rx="10" fill="#d97706" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="2" />
                <text x="350" y="129" textAnchor="middle" fill="#fde68a" fontSize="14" fontWeight="700">إنَّ ← تنصب َ ثم ترفع ُ</text>
              </g>
            ) : (
              <g transform="translate(95, 72)">
                {[
                  { label: '1. الكسرة (ئ) — الأقوى', w: 450, color: '#0284c7' },
                  { label: '2. الضمة (ؤ) — الثانية', w: 360, color: '#059669' },
                  { label: '3. الفتحة (أ) — الثالثة', w: 270, color: '#d97706' },
                  { label: '4. السكون — الأضعف', w: 180, color: '#64748b' },
                ].map((row, idx) => (
                  <g key={row.label} transform={`translate(0, ${idx * 42})`}>
                    <rect x="0" y="0" width={row.w} height="32" rx="8" fill={row.color} />
                    <text x="14" y="21" fill="#ffffff" fontSize="13" fontWeight="700">{row.label}</text>
                  </g>
                ))}
              </g>
            )}
          </svg>
        );
      }

      case 'place_value': {
        const blocks = [
          { label: 'الآلاف (×1000)', digit: '2', color: '#0284c7', val: '2000' },
          { label: 'المئات (×100)', digit: '3', color: '#10b981', val: '300' },
          { label: 'العشرات (×10)', digit: '4', color: '#f59e0b', val: '40' },
          { label: 'الآحاد (×1)', digit: '5', color: '#e11d48', val: '5' },
        ];
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="تمثيل منازل الأعداد">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <text x="320" y="38" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="800">
              تفكيك العدد 2345 حسب المنازل العشرية
            </text>
            {blocks.map((b, idx) => (
              <g key={b.label} transform={`translate(${65 + idx * 132}, 68)`}>
                <rect x="0" y="0" width="116" height="145" rx="14" fill="#1e293b" stroke={b.color} strokeWidth={sceneIdx === idx ? 4 : 2} />
                <text x="58" y="28" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="700">{b.label}</text>
                <text x="58" y="88" textAnchor="middle" fill={b.color} fontSize="42" fontWeight="800">{b.digit}</text>
                <text x="58" y="124" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="700">القيمة: {b.val}</text>
              </g>
            ))}
            <text x="320" y="250" textAnchor="middle" fill="#7dd3fc" fontSize="14" fontWeight="700">
              2000 + 300 + 40 + 5 = 2345 (10 مئات = 1 ألف)
            </text>
          </svg>
        );
      }

      case 'states_of_matter': {
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="حالات المادة الثلاث">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <text x="320" y="36" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="800">
              تغير حالة الماء بالتسخين: صلب ← سائل ← غاز
            </text>
            {[
              { title: '1. صلب (جليد)', x: 60, border: sceneIdx === 0 ? '#38bdf8' : '#475569', bg: '#1e3a8a', label: 'شكل ثابت' },
              { title: '2. سائل (ماء)', x: 245, border: sceneIdx === 1 || sceneIdx === 2 ? '#34d399' : '#475569', bg: '#065f46', label: 'يأخذ شكل الإناء' },
              { title: '3. غاز (بخار)', x: 430, border: sceneIdx === 3 ? '#fbbf24' : '#475569', bg: '#78350f', label: 'ينتشر في الفضاء' },
            ].map((col, idx) => (
              <g key={col.title} transform={`translate(${col.x}, 62)`}>
                <rect x="0" y="0" width="150" height="165" rx="16" fill={col.bg} fillOpacity="0.35" stroke={col.border} strokeWidth="3" />
                <text x="75" y="28" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="800">{col.title}</text>
                {idx === 0 && (
                  <g fill="#7dd3fc">
                    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}-${c}`} cx={45 + c * 30} cy={62 + r * 26} r="9" />))}
                  </g>
                )}
                {idx === 1 && (
                  <g fill="#6ee7b7">
                    {[0, 1, 2, 3, 4, 5].map((k) => (
                      <motion.circle
                        key={k}
                        cx={36 + (k % 3) * 38}
                        cy={96 + Math.floor(k / 3) * 26}
                        r="8"
                        animate={isPlaying && !shouldReduceMotion ? { x: [0, 5, 0] } : undefined}
                        transition={{ duration: 1.6, delay: k * 0.2, repeat: Infinity }}
                      />
                    ))}
                  </g>
                )}
                {idx === 2 && (
                  <g fill="#fde68a">
                    {[0, 1, 2, 3].map((k) => (
                      <motion.circle
                        key={k}
                        cx={35 + k * 28}
                        r="7"
                        animate={isPlaying && !shouldReduceMotion ? { cy: [120, 55, 120] } : { cy: 85 }}
                        transition={{ duration: 2.2, delay: k * 0.35, repeat: Infinity }}
                      />
                    ))}
                  </g>
                )}
                <text x="75" y="152" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="700">{col.label}</text>
              </g>
            ))}
          </svg>
        );
      }

      case 'word_types':
      case 'arabic_sentence': {
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="أقسام الجملة والكلمة العربية">
            <rect width="640" height="280" fill="#1e1b4b" rx="12" />
            <text x="320" y="42" textAnchor="middle" fill="#fef3c7" fontSize="16" fontWeight="800">
              {activeModule.visualKind === 'word_types'
                ? 'تصنيف الكلمة بالألوان: فعل + اسم + حرف'
                : 'الجملة الفعلية والجملة الاسمية بالضبط الصحيح'}
            </text>
            <g transform="translate(55, 78)">
              <rect x="0" y="0" width="155" height="90" rx="14" fill="#0284c7" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="77" y="38" textAnchor="middle" fill="#7dd3fc" fontSize="13" fontWeight="700">المدرسةُ / التلميذُ</text>
              <text x="77" y="68" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="800">اسم / مبتدأ</text>

              <rect x="188" y="0" width="155" height="90" rx="14" fill="#059669" fillOpacity="0.35" stroke="#34d399" strokeWidth="2.5" />
              <text x="265" y="38" textAnchor="middle" fill="#a7f3d0" fontSize="13" fontWeight="700">ذهبَ / يكتبُ</text>
              <text x="265" y="68" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="800">فعل ماضٍ / مضارع</text>

              <rect x="376" y="0" width="155" height="90" rx="14" fill="#d97706" fillOpacity="0.35" stroke="#fbbf24" strokeWidth="2.5" />
              <text x="453" y="38" textAnchor="middle" fill="#fde68a" fontSize="13" fontWeight="700">إلى / في / على</text>
              <text x="453" y="68" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="800">حرف ربط</text>
            </g>
            <rect x="85" y="195" width="470" height="52" rx="12" fill="#312e81" stroke="#a5b4fc" strokeWidth="2" />
            <text x="320" y="227" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="800">
              {sceneIdx % 2 === 0 ? 'ذهبَ عزيزٌ إلى المدرسةِ (جملة فعلية)' : 'عزيزٌ تلميذٌ مجتهدٌ في قسمِه (جملة اسمية)'}
            </text>
          </svg>
        );
      }

      case 'germination': {
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="إنبات البذرة">
            <rect width="640" height="280" fill="#064e3b" rx="12" />
            <rect x="0" y="190" width="640" height="90" fill="#451a03" />
            <circle cx="560" cy="52" r="30" fill="#facc15" />
            <text x="320" y="34" textAnchor="middle" fill="#ecfdf5" fontSize="15" fontWeight="800">
              مراحل إنبات البذرة الأربعة من التربة نحو النور
            </text>
            {[0, 1, 2, 3].map((stage) => {
              const x = 95 + stage * 145;
              const active = sceneIdx >= stage;
              return (
                <g key={stage} opacity={active ? 1 : 0.35}>
                  <ellipse cx={x} cy="210" rx="14" ry="10" fill="#fbbf24" />
                  {stage >= 1 && <path d={`M ${x} 220 L ${x - 8} 248 M ${x} 220 L ${x + 10} 252`} stroke="#d97706" strokeWidth="3" />}
                  {stage >= 2 && <rect x={x - 3} y={145 - stage * 12} width="6" height={60 + stage * 10} rx="3" fill="#22c55e" />}
                  {stage >= 3 && (
                    <>
                      <ellipse cx={x - 16} cy="128" rx="15" ry="8" fill="#4ade80" />
                      <ellipse cx={x + 16} cy="122" rx="15" ry="8" fill="#4ade80" />
                      <circle cx={x} cy="100" r="12" fill="#f43f5e" stroke="#fecdd3" strokeWidth="2" />
                    </>
                  )}
                  <text x={x} y="268" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="700">
                    مرحلة {stage + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        );
      }

      case 'water_cycle': {
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="دورة الماء في الطبيعة">
            <rect width="640" height="280" fill="#0c4a6e" rx="12" />
            <circle cx="90" cy="58" r="32" fill="#facc15" />
            <rect x="0" y="210" width="380" height="70" fill="#0284c7" />
            <path d="M 350 210 L 455 110 L 560 155 L 640 210 Z" fill="#15803d" />
            <ellipse cx="320" cy="70" rx="85" ry="28" fill="#f1f5f9" />
            <ellipse cx="450" cy="76" rx="70" ry="25" fill="#cbd5e1" />
            {isPlaying && !shouldReduceMotion && (
              <>
                <motion.text x="165" fill="#bae6fd" fontSize="13" fontWeight="700" animate={{ y: [195, 115] }} transition={{ duration: 2.2, repeat: Infinity }}>
                  ↑ تبخّر ↑
                </motion.text>
                <motion.line x1="455" y1="106" x2="455" y2="128" stroke="#7dd3fc" strokeWidth="3" animate={{ y: [0, 35] }} transition={{ duration: 1.4, repeat: Infinity }} />
              </>
            )}
            <text x="160" y="248" fill="#e0f2fe" fontSize="14" fontWeight="800">1. التبخّر من البحر</text>
            <text x="320" y="75" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="800">2. التكاثف (سحب)</text>
            <text x="485" y="248" textAnchor="middle" fill="#dcfce7" fontSize="13" fontWeight="800">3. التساقط والسيلان</text>
          </svg>
        );
      }

      case 'angles_geometry': {
        const angleDeg = sceneIdx === 1 ? 90 : sceneIdx === 2 ? 45 : 130;
        const rad = (angleDeg * Math.PI) / 180;
        const x2 = 240 + Math.cos(rad) * 140;
        const y2 = 210 - Math.sin(rad) * 140;
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="أنواع الزوايا">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <text x="320" y="38" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="800">
              {angleDeg === 90 ? 'زاوية قائمة (90°)' : angleDeg < 90 ? 'زاوية حادّة (45° < 90°)' : 'زاوية منفرجة (130° > 90°)'}
            </text>
            <line x1="240" y1="210" x2="430" y2="210" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <line x1="240" y1="210" x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
            <circle cx="240" cy="210" r="8" fill="#f43f5e" />
            <text x="485" y="135" textAnchor="middle" fill="#fde68a" fontSize="28" fontWeight="800">{angleDeg}°</text>
            <text x="485" y="165" textAnchor="middle" fill="#94a3b8" fontSize="13">قياس الزاوية بالمنقلة</text>
          </svg>
        );
      }

      case 'french_tenses': {
        const rows = [
          { pro: 'Je', stem: 'parl', end: 'e' },
          { pro: 'Tu', stem: 'parl', end: 'es' },
          { pro: 'Il / Elle', stem: 'parl', end: 'e' },
          { pro: 'Nous', stem: 'parl', end: 'ons' },
          { pro: 'Vous', stem: 'parl', end: 'ez' },
          { pro: 'Ils / Elles', stem: 'parl', end: 'ent' },
        ];
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="تصريف أفعال المجموعة الأولى">
            <rect width="640" height="280" fill="#1e1b4b" rx="12" />
            <text x="320" y="36" textAnchor="middle" fill="#e0e7ff" fontSize="16" fontWeight="800">
              Conjugaison au présent : Verbe PARLER (1er groupe)
            </text>
            {rows.map((r, i) => {
              const col = i % 2;
              const row = Math.floor(i / 2);
              return (
                <g key={r.pro} transform={`translate(${75 + col * 260}, ${62 + row * 66})`}>
                  <rect x="0" y="0" width="230" height="50" rx="12" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
                  <text x="20" y="31" fill="#ffffff" fontSize="16" fontWeight="700">{r.pro}</text>
                  <text x="115" y="31" fill="#a5f3fc" fontSize="18" fontWeight="800">{r.stem}</text>
                  <text x="155" y="31" fill="#fde047" fontSize="18" fontWeight="800">{r.end}</text>
                </g>
              );
            })}
          </svg>
        );
      }

      case 'percentage_ratio': {
        const filled = sceneIdx === 0 ? 50 : 20;
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="النسبة المئوية والتخفيض">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <text x="320" y="36" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="800">
              {sceneIdx === 0 ? 'شبكة الـ 100 مربع: 50% = النصف' : 'تخفيض 20% على 80 ديناراً = 16 د ← الثمن الجديد 64 د'}
            </text>
            <g transform="translate(95, 58)">
              {Array.from({ length: 100 }).map((_, idx) => (
                <rect
                  key={idx}
                  x={(idx % 10) * 19}
                  y={Math.floor(idx / 10) * 19}
                  width="17"
                  height="17"
                  rx="2"
                  fill={idx < filled ? '#f59e0b' : '#1e293b'}
                  stroke="#334155"
                  strokeWidth="1"
                />
              ))}
            </g>
            <g transform="translate(335, 72)">
              <rect x="0" y="0" width="225" height="150" rx="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="112" y="42" textAnchor="middle" fill="#bae6fd" fontSize="15" fontWeight="800">المبلغ الأصلي: 80 د</text>
              <text x="112" y="78" textAnchor="middle" fill="#fbbf24" fontSize="15" fontWeight="800">التخفيض (20%): −16 د</text>
              <text x="112" y="118" textAnchor="middle" fill="#34d399" fontSize="18" fontWeight="800">الصافي للدفع: 64 د</text>
            </g>
          </svg>
        );
      }

      case 'respiratory': {
        const inhale = sceneIdx <= 1;
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="الجهاز التنفسي والشهيق والزفير">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <text x="320" y="34" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="800">
              {inhale ? 'حركة الشهيق: دخول الأكسيجين O₂ واتساع الرئتين' : 'حركة الزفير: طرح ثاني أكسيد الكربون CO₂'}
            </text>
            <rect x="310" y="48" width="20" height="65" rx="6" fill="#38bdf8" />
            <motion.ellipse
              cx="245"
              cy="155"
              rx="62"
              ry="72"
              fill="#0ea5e9"
              fillOpacity="0.28"
              stroke="#38bdf8"
              strokeWidth="3"
              animate={isPlaying && !shouldReduceMotion ? { scale: [0.94, 1.07, 0.94] } : undefined}
              transition={{ duration: 2.6, repeat: Infinity }}
            />
            <motion.ellipse
              cx="395"
              cy="155"
              rx="62"
              ry="72"
              fill="#0ea5e9"
              fillOpacity="0.28"
              stroke="#38bdf8"
              strokeWidth="3"
              animate={isPlaying && !shouldReduceMotion ? { scale: [0.94, 1.07, 0.94] } : undefined}
              transition={{ duration: 2.6, repeat: Infinity }}
            />
            <text x="245" y="158" textAnchor="middle" fill="#e0f2fe" fontSize="14" fontWeight="800">رئة يمنى</text>
            <text x="395" y="158" textAnchor="middle" fill="#e0f2fe" fontSize="14" fontWeight="800">رئة يسرى</text>
            <path d="M 165 245 Q 320 225 475 245" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            <text x="320" y="268" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="700">الحجاب الحاجز</text>
          </svg>
        );
      }

      case 'map_scale': {
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="سلم الخرائط والمسافة الحقيقية">
            <rect width="640" height="280" fill="#0f172a" rx="12" />
            <text x="320" y="38" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="800">
              سلّم الخريطة: 1 / 100,000 ← كل 1 صم = 1 كلم
            </text>
            <rect x="85" y="75" width="470" height="58" rx="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="125" y1="104" x2="515" y2="104" stroke="#facc15" strokeWidth="5" />
            {[0, 1, 2, 3, 4].map((cm) => (
              <g key={cm} transform={`translate(${125 + cm * 97}, 104)`}>
                <circle cx="0" cy="0" r="6" fill="#fbbf24" />
                <text x="0" y="-12" textAnchor="middle" fill="#e0f2fe" fontSize="12" fontWeight="700">{cm} صم</text>
              </g>
            ))}
            <text x="320" y="176" textAnchor="middle" fill="#34d399" fontSize="18" fontWeight="800">
              المسافة على الخارطة: 4 صم × 100,000 = 400,000 صم = 4 كلم حقيقية
            </text>
            <text x="320" y="218" textAnchor="middle" fill="#94a3b8" fontSize="13">
              المسافة الحقيقية = المسافة على التصميم × مقام السلّم
            </text>
          </svg>
        );
      }

      case 'tunisia_history': {
        const eras = [
          { year: '814 ق.م', label: 'قرطاج المتوسطية', color: '#0284c7' },
          { year: '50 هـ', label: 'القيروان والأغالبة', color: '#059669' },
          { year: 'جربة', label: 'العمارة والحصون', color: '#d97706' },
          { year: '1956', label: 'الاستقلال والتعليم', color: '#be123c' },
        ];
        return (
          <svg viewBox="0 0 640 280" className="w-full h-full" role="img" aria-label="خط زمني لتاريخ تونس">
            <rect width="640" height="280" fill="#1e293b" rx="12" />
            <text x="320" y="38" textAnchor="middle" fill="#fef3c7" fontSize="16" fontWeight="800">
              الخط الزمني لمحطات التاريخ التونسي
            </text>
            <line x1="70" y1="145" x2="570" y2="145" stroke="#94a3b8" strokeWidth="4" />
            {eras.map((e, i) => {
              const x = 115 + i * 136;
              return (
                <g key={e.year}>
                  <circle cx={x} cy="145" r={sceneIdx === i ? 16 : 11} fill={e.color} stroke="#ffffff" strokeWidth="3" />
                  <text x={x} y="108" textAnchor="middle" fill="#fde68a" fontSize="15" fontWeight="800">{e.year}</text>
                  <text x={x} y="192" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">{e.label}</text>
                </g>
              );
            })}
          </svg>
        );
      }
    }
  };

  const subjectTabs: ('all' | SubjectId)[] = ['all', 'science', 'math', 'arabic', 'french', 'social'];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Studio Banner */}
      <div className="bg-gradient-to-l from-white via-white to-sky-50/60 border-2 border-sky-200 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xs">
        <div className="lg:col-span-8 p-5 sm:p-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
            <Clapperboard className="w-4 h-4" aria-hidden="true" />
            قسم المحتوى المرئي والرسوم المتحركة · سنوات الثالثة إلى السادسة ابتدائي 2026
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 leading-snug">
            استوديو الشرح المرئي المبسّط، {studentName || 'عزيز'} ({activeGradeMeta.shortLabel})
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            مقاطع رسوم متحركة تفاعلية بالمشاهد والنطق العربي المسموع لتبسيط مفاهيم العلوم والرياضيات واللغات والاجتماعيات لجميع المستويات بأسلوب بصري جذّاب.
          </p>

          {/* Grade Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {GRADES.map((g) => {
              const count = VISUAL_MODULES.filter((m) => m.grade === g.grade).length;
              const isSelected = gradeFilter === g.grade;
              return (
                <button
                  key={g.grade}
                  type="button"
                  onClick={() => handleSelectGrade(g.grade)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {g.shortLabel} ({count})
                </button>
              );
            })}
          </div>

          {/* Subject Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {subjectTabs.map((sid) => {
              const count =
                sid === 'all'
                  ? gradeModules.length
                  : gradeModules.filter((m) => m.subjectId === sid).length;
              if (sid !== 'all' && count === 0) return null;
              const label = sid === 'all' ? 'كل المواد' : SUBJECTS[sid].name;
              return (
                <button
                  key={sid}
                  type="button"
                  onClick={() => handleSelectSubject(sid)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    subjectFilter === sid
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 min-h-[180px] bg-slate-900 border-t lg:border-t-0 lg:border-r border-slate-200 relative">
          {!heroImgError ? (
            <img
              src="/src/assets/images/visual_studio_science_1795260006947.jpg"
              alt="غرفة استوديو العلوم والرياضيات المبسطة في أكاديمية عزيز"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sky-400">
              <Clapperboard className="w-12 h-12" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Playlist + Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Playlist Sidebar */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <h2 className="text-sm font-display font-bold text-slate-900 pb-2 border-b border-slate-100">
            قائمة الدروس المرئية لـ {activeGradeMeta.shortLabel} ({filteredModules.length})
          </h2>
          <div className="space-y-2">
            {filteredModules.map((mod) => {
              const active = mod.id === activeModule.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(mod.id)}
                  className={`w-full p-3.5 rounded-xl border text-right transition-colors cursor-pointer space-y-1.5 ${
                    active
                      ? 'bg-sky-50 border-sky-500 text-sky-950'
                      : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
                      {mod.subjectId === 'science' ? (
                        <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : mod.subjectId === 'math' ? (
                        <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : mod.subjectId === 'french' ? (
                        <Languages className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : mod.subjectId === 'social' ? (
                        <Landmark className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      {mod.trimester}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {mod.scenes.length} مشاهد
                    </span>
                  </div>
                  <div className="text-sm font-display font-bold leading-snug">
                    {mod.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Video-like Interactive Animated Stage & Quiz */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white border-2 border-sky-100 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-sky-700">
                  {activeModule.subjectLabel} · {activeModule.trimester}
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 mt-0.5">
                  {activeModule.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  voiceEnabled
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-4 h-4" aria-hidden="true" />
                )}
                {voiceEnabled ? 'الصوت المفسّر مفعّل' : 'تشغيل التعليق الصوتي'}
              </button>
            </div>

            {/* Animated Canvas */}
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
              {renderAnimatedStage()}
            </div>

            {/* Subtitle & Narration Box */}
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1">
              <div className="text-xs font-bold text-sky-900">{currentScene.title}</div>
              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                {currentScene.caption}
              </p>
            </div>

            {/* Progress Bar & Scene Scrubber */}
            <div className="space-y-3">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-150"
                  style={{ width: `${Math.min(100, sceneProgress)}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" aria-hidden="true" />
                        إيقاف مؤقت
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" aria-hidden="true" />
                        تشغيل العرض
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleJumpScene(
                        (sceneIdx - 1 + activeModule.scenes.length) %
                          activeModule.scenes.length
                      )
                    }
                    aria-label="المشهد السابق"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleJumpScene((sceneIdx + 1) % activeModule.scenes.length)
                    }
                    aria-label="المشهد التالي"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <SkipBack className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSceneIdx(0);
                      setSceneProgress(0);
                      setIsPlaying(true);
                    }}
                    aria-label="إعادة من الأول"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {activeModule.scenes.map((sc, i) => (
                    <button
                      key={sc.title}
                      type="button"
                      onClick={() => handleJumpScene(i)}
                      className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md border transition-colors cursor-pointer tabular-nums ${
                        sceneIdx === i
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      مشهد {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950">
              <strong>القاعدة المرئية المختصرة: </strong>
              {activeModule.keyRule}
            </div>
          </div>

          {/* Mini 2-Question Quick Verification */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <h3 className="text-base font-display font-bold text-slate-900">
                  تثبيت الفهم بعد المشاهدة (+15 إلى +45 نقطة)
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {activeModule.quiz.map((q, qIdx) => (
                <div key={q.prompt} className="space-y-2">
                  <div className="text-sm font-bold text-slate-900">
                    {qIdx + 1}. {q.prompt}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const chosen = quizAnswers[qIdx] === oIdx;
                      const isRight = quizSubmitted && oIdx === q.correctIndex;
                      const isWrong = quizSubmitted && chosen && oIdx !== q.correctIndex;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                          }
                          className={`p-3 rounded-xl border text-right text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            isRight
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                              : isWrong
                              ? 'bg-rose-50 border-rose-400 text-rose-900'
                              : chosen
                              ? 'bg-sky-50 border-sky-600 text-sky-950 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={
                    Object.keys(quizAnswers).length < activeModule.quiz.length
                  }
                  onClick={handleSubmitQuiz}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  تحقق واجمع نقاط المشاهدة
                </button>
              ) : (
                <div className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  تم تسجيل نتيجة الاستوديو في رصيدك!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
