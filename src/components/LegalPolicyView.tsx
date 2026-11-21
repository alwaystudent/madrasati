import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  Cloud,
  FileCheck2,
  Lock,
  Scale,
  Server,
  Shield,
  Volume2,
} from 'lucide-react';

interface LegalPolicyViewProps {
  initialTab?: 'privacy' | 'terms';
  onBack?: () => void;
}

export const LegalPolicyView: React.FC<LegalPolicyViewProps> = ({
  initialTab = 'privacy',
  onBack,
}) => {
  const [tab, setTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border-2 border-sky-100 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
              <Shield className="w-4 h-4" aria-hidden="true" />
              الشفافية وحماية المتعلّم · متوافق مع الخدمات المرتبطة بالمنصة
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              سياسة الخصوصية وشروط الاستخدام
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              آخر تحديث: 2026 · تغطّي خدمات Google Firebase وGoogle Drive وVercel وGoogle Gemini API ووضع العمل بدون إنترنت (PWA).
            </p>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
              العودة إلى المنصة
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setTab('privacy')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
              tab === 'privacy'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            سياسة الخصوصية وحماية البيانات
          </button>
          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
              tab === 'terms'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" aria-hidden="true" />
            شروط الاستخدام والمنافسة الشريفة
          </button>
        </div>
      </div>

      {tab === 'privacy' ? (
        <div className="space-y-5">
          {/* Core Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                  <Cloud className="w-4 h-4 text-sky-700" aria-hidden="true" />
                </div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  1. Google Firebase (المصادقة وقاعدة البيانات)
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                عند اختيار التلميذ أو الوليّ تسجيل الدخول بحساب Google عبر <strong>Firebase Authentication</strong>، يتم حفظ بيانات الملفات الدراسية (الاسم المختار، السنة الدراسية، الولاية، الدروس المكتملة، النقاط، وتقارير التقدّم) داخل قاعدة بيانات <strong>Cloud Firestore</strong> ضمن نطاق معزول خاص بالحساب فقط ولا يمكن لأي مستخدم آخر قراءتها.
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>الوضع المحلي يعمل دون تسجيل دخول عبر التخزين المحلي في المتصفح (localStorage).</li>
                <li>تطبّق المنصة مزامنة مجمّعة ذكية لتقليل عمليات القراءة والكتابة وحماية الحصة السحابية.</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Server className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                </div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  2. استضافة Vercel والوظائف الخادمة
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                تُستضاف واجهة المنصة ومسار المحادثة التعليمية الآمن عبر بنية <strong>Vercel</strong> السحابية. لا تستخدم المنصة أي ملفات تعريف ارتباط إعلانية أو أدوات تتبّع تجارية أو بيع بيانات لطرف ثالث.
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>يُخزّن المحتوى الثابت (الوسائط والبرمجيات) مؤقتاً في شبكة CDN لتقليل استهلاك الخادم.</li>
                <li>تعالج مسارات الخادم طلبات الشرح لحظياً دون الاحتفاظ بسجلّات دائمة لهوية التلميذ.</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-amber-700" aria-hidden="true" />
                </div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  3. واجهة Google Gemini API (المعلّم الذكي)
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                تُستعمل واجهة <strong>Google Gemini API</strong> حصرياً داخل مساحة الدرس لمساعدة التلميذ على فهم المفاهيم الدراسية بأسلوب تربوي مبسّط عبر وسيط خادم محمي بمفاتيح خاصة.
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>يُرسل نص الدرس والسؤال التعليمي فقط دون إرسال البريد الإلكتروني أو أي معلومات شخصية.</li>
                <li>تُخزّن الأسئلة المتكررة مؤقتاً في جلسة المتصفّح لتجنّب إعادة استدعاء الخادم.</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                  <Volume2 className="w-4 h-4 text-indigo-700" aria-hidden="true" />
                </div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  4. النطق الصوتي وحماية خصوصية الطفل في الصدارة
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                يعمل النطق الصوتي لدروس الفرنسية محلياً بالكامل عبر تقنية المتصفّح (Web Speech API) دون تسجيل صوت التلميذ أو إرساله لأي خادم. كما تلتزم لوحة الصدارة بمبدأ انعدام البيانات الشخصية (Zero-PII).
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>لا تظهر لوحة الصدارة البريد الإلكتروني أو أرقام الهواتف أو العناوين الدقيقة أبداً.</li>
                <li>تقتصر المنافسة على التلاميذ في نفس السنة الدراسية وبالاسم المستعار والولاية فقط.</li>
              </ul>
            </div>
          </div>

          {/* Control & Deletion Rights + Google Drive Offline Backup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                5. Google Drive والعمل بدون إنترنت (PWA)
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                عند تفعيل ميزة النسخ الاحتياطي عبر <strong>Google Drive</strong>، تقتصر الصلاحية حصراً على نطاق <code>drive.file</code> للوصول إلى ملف النسخة الاحتياطية الذي تنشئه <strong>أكاديمية عزيز</strong> فقط، ولا تطّلع المنصة على بقية ملفاتك، ويُحفظ رمز الدخول مؤقتاً في ذاكرة الجلسة فقط دون كتابته في أي مخزن دائم. كما يخزّن تطبيق الويب التقدّمي (PWA) الدروس والأنشطة محلياً على جهازك لتعمل بالكامل دون إنترنت.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                6. حقوق الوليّ والتلميذ في الوصول والتصدير والحذف
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                يمتلك الوليّ أو صاحب الحساب السيطرة الكاملة على بيانات التلاميذ المسجّلين: يمكن تصدير تقارير التقدّم بصيغتي CSV وPDF أو حفظ نسخة احتياطية كاملة على Google Drive في أي وقت، كما يمكن حذف أي ملف تلميذ من الحساب السحابي فيتم فوراً حذف سجلاته وإزالة ظهوره من لوحة الصدارة.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <FileCheck2 className="w-5 h-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              ضوابط استخدام منصة أكاديمية عزيز
            </h2>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">
                1. الغرض التربوي والمحتوى التعليمي
              </h3>
              <p>
                المنصة مخصّصة لدعم تلاميذ التعليم الابتدائي بالجمهورية التونسية (السنوات الثالثة والرابعة والخامسة والسادسة) وفق المحاور الرسمية لعام 2026، وتعمل كوسيلة مساندة ومرافقة للمراجعة والتدريب الذاتي.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">
                2. الإشراف العائلي وحماية القاصرين
              </h3>
              <p>
                يتم استخدام ميزة الحفظ السحابي والمشاركة في لوحة الصدارة عبر حساب Google بإشراف الوليّ أو المربّي. يُمنع إدخال أي معطيات شخصية حساسة (كالاسم العائلي الكامل، رقم الهاتف، أو عنوان السكن) في خانة «اسم التلميذ».
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">
                3. ميثاق التنافس الشريف في لوحة الصدارة والتحدّيات
              </h3>
              <p>
                تهدف «لوحة الصدارة» و«تحدّي الزملاء» إلى تحفيز التلاميذ على المثابرة والمراجعة بروح رياضية شريفة داخل نفس القسم الدراسي. يُمنع استخدام أي أدوات آلية أو محاولة التلاعب بالنتائج أو إرسال طلبات متكررة تهدف لإرهاق خوادم Firebase أو Vercel.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">
                4. حدود المعلّم الذكي والاستعمال الرشيد
              </h3>
              <p>
                يقدّم المعلّم الذكي شروحات وتوجيهات تربوية مبسّطة مرتبطة بالدرس، ويجب استخدامه في السياق الدراسي فقط مع احترام ضوابط الاستخدام العادل لعدد الأسئلة اليومية لضمان استمرارية الخدمة المجانية لجميع التلاميذ.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">
                5. التعديلات وتوافر الخدمة
              </h3>
              <p>
                قد تُحدّث هذه السياسة والشروط دورياً لمواكبة التحسينات التقنية والتربوية أو سياسات الخدمات السحابية المرتبطة (Firebase، Vercel، Google Gemini)، ويُعدّ الاستمرار في استخدام المنصة موافقةً على النسخة المحدّثة.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
