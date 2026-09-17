import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { analyzeAssessment } from '../services/geminiService';
import {
  ASSESSMENT_QUESTIONS,
  type SustainabilityFactor,
  type SustainabilityStatus,
  type WorkSustainabilityResult,
} from '../assessmentModel';
import { useLanguage } from '../i18n/LanguageContext';

const FACTORS: SustainabilityFactor[] = [
  'workloadBalance',
  'recovery',
  'controlClarity',
];

const AssessmentViewV1: React.FC = () => {
  const { language, t, locale } = useLanguage();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<WorkSustainabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultStep, setResultStep] = useState<1 | 2 | 3 | 4>(1);

  const topRef = useRef<HTMLDivElement>(null);
  const driversRef = useRef<HTMLElement>(null);
  const insightRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
    setResultStep(1);
  }, [language]);

  useEffect(() => {
    if (!result) return;

    const frame = window.requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [result]);

  useEffect(() => {
    if (!result || resultStep === 1) return;

    const target =
      resultStep === 2
        ? driversRef
        : resultStep === 3
          ? insightRef
          : actionsRef;

    const frame = window.requestAnimationFrame(() => {
      target.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [result, resultStep]);

  const questions = useMemo(
    () =>
      ASSESSMENT_QUESTIONS.map((question) => ({
        ...question,
        text: language === 'ru' ? question.ru : question.en,
      })),
    [language]
  );

  const statusFromScore = (score: number): SustainabilityStatus => {
    if (score >= 80) return 'green';
    if (score >= 65) return 'stable';
    if (score >= 45) return 'needs_attention';
    return 'at_risk';
  };

  const overallStatusLabel = (status: SustainabilityStatus) => {
    const labels: Record<SustainabilityStatus, string> = {
      green: t('Green zone', 'Зелёная зона'),
      stable: t('Stable', 'Устойчиво'),
      needs_attention: t('Needs attention', 'Требует внимания'),
      at_risk: t('At risk', 'Зона риска'),
    };

    return labels[status];
  };

  const factorStatusLabel = (status: SustainabilityStatus) => {
    const labels: Record<SustainabilityStatus, string> = {
      green: t('Green zone', 'Зелёная зона'),
      stable: t('Stable', 'Устойчиво'),
      needs_attention: t('Needs attention', 'Требует внимания'),
      at_risk: t('At risk', 'Зона риска'),
    };

    return labels[status];
  };

  const statusClasses = (status: SustainabilityStatus) => {
    const classes: Record<SustainabilityStatus, string> = {
      green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      stable: 'bg-sky-100 text-sky-700 border-sky-200',
      needs_attention: 'bg-amber-100 text-amber-800 border-amber-200',
      at_risk: 'bg-rose-100 text-rose-700 border-rose-200',
    };

    return classes[status];
  };

  const factorLabel = (factor: SustainabilityFactor) => {
    const labels: Record<SustainabilityFactor, string> = {
      workloadBalance: t('Workload balance', 'Баланс нагрузки'),
      recovery: t('Recovery', 'Восстановление'),
      controlClarity: t('Control & clarity', 'Контроль и ясность'),
    };

    return labels[factor];
  };

  const heroCopy = (status: SustainabilityStatus) => {
    const copy: Record<SustainabilityStatus, string> = {
      green: t(
        'Your current work setup looks sustainable overall.',
        'Сейчас ваш рабочий режим в целом выглядит устойчивым.'
      ),
      stable: t(
        'Your current work setup looks mostly sustainable, with a few pressure points worth watching.',
        'Сейчас ваш рабочий режим в целом устойчив, но есть несколько зон напряжения, за которыми стоит следить.'
      ),
      needs_attention: t(
        'Your current work setup is under strain and may become hard to sustain without changes.',
        'Сейчас в вашем рабочем режиме уже есть заметное напряжение. Без изменений поддерживать его может стать сложно.'
      ),
      at_risk: t(
        'Your current work setup may be difficult to sustain without meaningful changes. Start with the factor that is pulling the score down most.',
        'Сейчас ваш рабочий режим трудно поддерживать без заметных изменений. Начните с фактора, который сильнее всего снижает результат.'
      ),
    };

    return copy[status];
  };

  const factorDescription = (
    factor: SustainabilityFactor,
    status: SustainabilityStatus
  ) => {
    const copy: Record<
      SustainabilityFactor,
      Record<SustainabilityStatus, [string, string]>
    > = {
      workloadBalance: {
        green: [
          'Your workload feels manageable within the time and energy you have.',
          'Текущая нагрузка в целом соответствует времени и энергии, которые у вас есть.',
        ],
        stable: [
          'Your workload is mostly manageable, although pressure may build at times.',
          'В основном нагрузка остаётся управляемой, хотя временами напряжение возрастает.',
        ],
        needs_attention: [
          'Your workload is regularly stretching your available time or energy.',
          'Рабочая нагрузка регулярно требует больше времени или энергии, чем у вас есть.',
        ],
        at_risk: [
          'Your workload is consistently exceeding what feels manageable.',
          'Рабочая нагрузка регулярно превышает уровень, с которым вам комфортно справляться.',
        ],
      },

      recovery: {
        green: [
          'You’re getting enough space to recover between periods of effort.',
          'У вас достаточно времени и пространства, чтобы восстанавливаться между периодами интенсивной работы.',
        ],
        stable: [
          'You’re recovering reasonably well, but not consistently.',
          'В целом вы успеваете восстанавливаться, хотя это получается не всегда.',
        ],
        needs_attention: [
          'Recovery is limited, so work pressure may be carrying over from day to day.',
          'Времени на восстановление не всегда хватает, поэтому рабочее напряжение может переноситься изо дня в день.',
        ],
        at_risk: [
          'You have very little room to recover, making sustained effort harder.',
          'Возможностей для восстановления сейчас очень мало, поэтому поддерживать рабочий темп становится сложнее.',
        ],
      },

      controlClarity: {
        green: [
          'You generally know what matters and have enough control over how to get it done.',
          'Вы в целом понимаете, что сейчас важно, и можете достаточно свободно решать, как выполнить работу.',
        ],
        stable: [
          'You have reasonable clarity and control, with some friction or uncertainty.',
          'В целом вам понятны приоритеты и зона ответственности, хотя иногда возникают неопределённость или ограничения.',
        ],
        needs_attention: [
          'Limited control or unclear priorities are making work harder to navigate.',
          'Недостаток контроля или неясные приоритеты заметно усложняют работу.',
        ],
        at_risk: [
          'Low control or persistent uncertainty is making your work difficult to manage sustainably.',
          'Недостаток контроля или постоянная неопределённость мешают выстроить устойчивый рабочий режим.',
        ],
      },
    };

    return t(copy[factor][status][0], copy[factor][status][1]);
  };

  const submitAssessment = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError(
        t(
          'Please answer all questions.',
          'Пожалуйста, ответьте на все вопросы.'
        )
      );
      return;
    }

    setLoading(true);
    setError(null);

    const nextResult = await analyzeAssessment(
      answers as Record<string, number>,
      language
    );

    setLoading(false);

    if (!nextResult) {
      setError(
        t(
          'Your result could not be calculated right now. Your answers are still here — please try again.',
          'Сейчас не удалось рассчитать результат. Ваши ответы сохранились на экране — попробуйте ещё раз.'
        )
      );
      return;
    }

    setResultStep(1);
    setResult(nextResult);
  };

  const retake = () => {
    setAnswers({});
    setResult(null);
    setError(null);
    setResultStep(1);

    window.requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const goToPeopleDemo = () => {
    window.history.pushState(
      { resilience: true },
      '',
      '/hr/dashboard'
    );

    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (!result) {
    return (
      <div
        ref={topRef}
        className="max-w-4xl mx-auto pb-10 animate-enter"
      >
        <section className="bg-white/50 backdrop-blur-xl rounded-[2rem] p-5 sm:p-8 border border-white/60 shadow-lg shadow-indigo-500/5">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {t(
                'Work Sustainability assessment',
                'Оценка устойчивости рабочего режима'
              )}
            </h2>

            <p className="text-slate-600 max-w-2xl leading-relaxed">
              {t(
                'Thinking about the past 2 weeks, how true has each statement been for you?',
                'Вспомните последние 2 недели. Насколько каждое утверждение было верно для вас?'
              )}
            </p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>
                  <strong className="text-slate-900">1</strong> —{' '}
                  {t('Not at all true', 'Совсем не похоже на меня')}
                </span>

                <span>
                  <strong className="text-slate-900">5</strong> —{' '}
                  {t('Very true', 'Полностью похоже на меня')}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {t(
                  'This is a custom, non-clinical work-sustainability check, not a medical diagnosis.',
                  'Это пользовательская не-клиническая оценка рабочего режима, а не медицинская диагностика.'
                )}
              </p>
            </div>
          </div>

          <div className="space-y-7">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="pb-6 border-b border-slate-200/70 last:border-0 last:pb-0"
              >
                <div className="flex gap-3 mb-4">
                  <span className="text-xs font-bold text-slate-400 pt-1">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <p className="font-medium text-slate-800 text-base sm:text-lg leading-relaxed">
                    {question.text}
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-2 sm:flex sm:gap-3 sm:pl-8">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${question.text}: ${value}`}
                      onClick={() => {
                        setAnswers((previous) => ({
                          ...previous,
                          [question.id]: value,
                        }));
                        setError(null);
                      }}
                      className={`w-full sm:w-12 h-11 sm:h-12 rounded-xl sm:rounded-2xl text-base font-semibold transition-all duration-200 ${
                        answers[question.id] === value
                          ? 'bg-slate-900 text-white shadow-lg scale-105'
                          : 'bg-white/70 text-slate-600 border border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertTriangle className="w-5 h-5 flex-none mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={submitAssessment}
            disabled={loading}
            className="mt-8 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl text-base font-medium w-full flex justify-center items-center transition-all shadow-xl"
          >
            {loading
              ? t(
                  'Calculating your result…',
                  'Рассчитываем ваш результат…'
                )
              : t('View my result', 'Посмотреть результат')}
          </button>
        </section>
      </div>
    );
  }

  const displayStatus = statusFromScore(result.score);
  const displayWeakestFactor = result.weakestFactor;

  return (
    <div
      ref={topRef}
      className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-10 animate-enter"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {t('Assessment result', 'Результат оценки')} ·{' '}
            {new Date().toLocaleDateString(locale)}
          </p>
        </div>

        <button
          type="button"
          onClick={retake}
          className="self-start sm:self-auto text-slate-600 hover:text-slate-900 text-sm font-bold flex items-center bg-white/60 px-4 py-2 rounded-xl border border-white/70"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('Retake', 'Пройти заново')}
        </button>
      </div>

      <section className="bg-white/60 backdrop-blur-xl text-slate-900 rounded-[2.5rem] p-6 sm:p-10 border border-white/75 shadow-xl shadow-indigo-500/10 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-200/25" />

        <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 lg:items-end">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-3">
              {t(
                'Your Work Sustainability',
                'Насколько устойчив ваш рабочий режим'
              )}
            </p>

            <div className="flex flex-wrap items-end gap-4 mb-4">
              <span className="text-6xl sm:text-7xl font-bold tracking-tight text-slate-950">
                {result.score}
              </span>

              <span className="text-xl text-slate-400 mb-2">
                / 100
              </span>

              <span
                className={`mb-2 px-3 py-1.5 rounded-full border text-sm font-bold ${statusClasses(
                  displayStatus
                )}`}
              >
                {overallStatusLabel(displayStatus)}
              </span>
            </div>

            <p className="text-lg sm:text-xl font-semibold text-slate-900 max-w-3xl leading-relaxed">
              {heroCopy(displayStatus)}
            </p>

            <p className="mt-4 text-sm text-slate-500 max-w-2xl">
              {t(
                'Based on how your workload, recovery, and control & clarity are working together right now.',
                'Результат показывает, как сейчас сочетаются ваша нагрузка, восстановление, контроль и ясность в работе.'
              )}
            </p>
          </div>

          <div className="w-full lg:w-44">
            <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-700"
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-slate-500 max-w-2xl">
            <Lock className="w-4 h-4 flex-none mt-0.5 sm:mt-0" />

            <span>
              {t(
                'Private to you · HR only sees aggregated team data after 5+ responses.',
                'Видите только вы · HR получает только агрегированные данные после 5+ ответов.'
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setResultStep(2)}
            className="self-start sm:self-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
          >
            {t(
              'See what shapes your score',
              'Посмотреть, из чего складывается результат'
            )}
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {resultStep >= 2 && (
        <section ref={driversRef} className="scroll-mt-6">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t(
                'What’s shaping your score',
                'Что влияет на ваш результат'
              )}
            </h2>

            <p className="text-slate-500 mt-1">
              {t(
                'These three factors make up your Work Sustainability score.',
                'Из этих трёх факторов складывается ваш показатель Work Sustainability.'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {FACTORS.map((factor) => {
              const factorResult = result.factors[factor];
              const factorStatus = statusFromScore(factorResult.score);

              return (
                <article
                  key={factor}
                  className={`bg-white/55 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 border shadow-sm transition-all ${
                    factor === displayWeakestFactor
                      ? 'border-rose-200/90 bg-white/75 ring-2 ring-rose-100 shadow-md'
                      : 'border-white/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {factorLabel(factor)}
                      </h3>

                      {factor === displayWeakestFactor && (
                        <span className="mt-1.5 inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700 border border-rose-100">
                          {t(
                            'Main pressure point',
                            'Главная зона напряжения'
                          )}
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusClasses(
                        factorStatus
                      )}`}
                    >
                      {factorStatusLabel(factorStatus)}
                    </span>
                  </div>

                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-bold text-slate-900">
                      {factorResult.score}
                    </span>

                    <span className="text-sm text-slate-400 mb-1">
                      / 100
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-slate-800 transition-all duration-700"
                      style={{ width: `${factorResult.score}%` }}
                    />
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {factorDescription(factor, factorStatus)}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setResultStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 border border-white/80 shadow-sm transition hover:bg-white hover:text-slate-950"
            >
              {t(
                'What matters most right now',
                'Что сейчас важнее всего'
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {resultStep >= 3 && (
        <section
          ref={insightRef}
          className="scroll-mt-6 bg-indigo-50/70 border border-indigo-100 rounded-[2rem] p-5 sm:p-7"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-none">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                {t(
                  'Personalized insight',
                  'Персональный вывод'
                )}
              </p>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                {t(
                  'What matters most right now',
                  'Что сейчас важнее всего'
                )}
              </h2>

              <p className="text-slate-700 leading-relaxed max-w-4xl">
                {result.insight}
              </p>

              <button
                type="button"
                onClick={() => setResultStep(4)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 transition hover:bg-indigo-700"
              >
                {t(
                  'See what you can do',
                  'Посмотреть, что можно сделать'
                )}
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {resultStep >= 4 && (
        <>
          <section
            ref={actionsRef}
            className="scroll-mt-6"
          >
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {t(
                  'What to do next',
                  'Что делать дальше'
                )}
              </h2>

              <p className="text-slate-500 mt-1">
                {t(
                  `Your primary pressure factor is ${factorLabel(
                    displayWeakestFactor
                  )}. Start there.`,
                  `Главная зона давления сейчас — «${factorLabel(
                    displayWeakestFactor
                  )}». Начните с неё.`
                )}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  label: t('Today', 'Сегодня'),
                  action: result.actions.today,
                  icon: CheckCircle,
                },
                {
                  label: t(
                    'This week',
                    'На этой неделе'
                  ),
                  action: result.actions.week,
                  icon: RefreshCw,
                },
                {
                  label: t(
                    'Get support',
                    'Получить поддержку'
                  ),
                  action: result.actions.support,
                  icon: AlertTriangle,
                },
              ].map(({ label, action, icon: Icon }) => (
                <article
                  key={label}
                  className="bg-white/55 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 border border-white/70 shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4 text-slate-700" />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {label}
                  </p>

                  <h3 className="font-bold text-slate-900 mb-2">
                    {action.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {action.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white/55 backdrop-blur-xl rounded-[2rem] p-5 sm:p-7 border border-white/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-none">
                <Lock className="w-5 h-5 text-slate-700" />
              </div>

              <div className="max-w-4xl">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  {t(
                    'Your privacy',
                    'Ваша конфиденциальность'
                  )}
                </h2>

                <p className="font-semibold text-slate-800 mb-3">
                  {t(
                    'Your individual result is private to you.',
                    'Ваш индивидуальный результат видите только вы.'
                  )}
                </p>

                <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                  <p>
                    {t(
                      'In a company workspace, your answers and result are stored in your personal history so you can track changes over time.',
                      'В рабочем пространстве компании ваши ответы и результат сохраняются в личной истории, чтобы вы могли отслеживать изменения со временем.'
                    )}
                  </p>

                  <p>
                    {t(
                      'HR does not see your individual answers or individual result.',
                      'HR не видит ваши индивидуальные ответы или индивидуальный результат.'
                    )}
                  </p>

                  <p>
                    {t(
                      'HR only receives aggregated team-level signals after at least 5 people have responded. If fewer than 5 people respond, no team result is shown.',
                      'HR получает только агрегированные данные по команде после того, как ответили как минимум 5 человек. Если ответов меньше пяти, результат команды не отображается.'
                    )}
                  </p>

                  <p className="pt-2 text-xs text-slate-400">
                    {t(
                      'Prototype note: this public demo does not persist personal assessment history.',
                      'Примечание для прототипа: публичная демо-версия не сохраняет персональную историю оценок.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 text-white rounded-[2rem] p-5 sm:p-7 shadow-xl shadow-slate-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300 mb-2">
                  {t(
                    'Continue the demo',
                    'Продолжить демо'
                  )}
                </p>

                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  {t(
                    'Now see the People side.',
                    'Теперь посмотрите на продукт со стороны People-команды.'
                  )}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {t(
                    'You’ve completed the employee experience. Now see how the same model is presented from the People side, using privacy-safe aggregated synthetic team data and an organisational action loop.',
                    'Вы прошли путь сотрудника. Теперь посмотрите, как та же модель представлена со стороны People-команды — через приватные агрегированные синтетические данные команды и цикл организационных действий.'
                  )}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  {t(
                    'Demo transition only • Employees do not have access to the People dashboard.',
                    'Только переход внутри демо • Сотрудники не имеют доступа к People dashboard.'
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={goToPeopleDemo}
                className="group inline-flex min-h-12 flex-shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                {t(
                  'View the aggregated People demo',
                  'Посмотреть агрегированное People-демо'
                )}

                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AssessmentViewV1;