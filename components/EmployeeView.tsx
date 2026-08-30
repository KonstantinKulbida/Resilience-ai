import React, { useEffect, useState } from 'react';
import { CheckCircle, Brain, Wind, ArrowLeft, Video, FileText, TrendingUp, AlertTriangle, Zap, Thermometer, Clock, BookOpen, Sparkles, ChevronRight, RefreshCw, Calendar, Info, Lock, Lightbulb, PenTool, Edit3, Target, BarChart2, Save, X, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine, Legend } from 'recharts';
import { getPersonalizedAdvice, analyzeAssessment } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface EmployeeViewProps {
  activeTab: string;
  selectedModuleId: number | null;
  onModuleSelect: (moduleId: number) => void;
  onModuleBack: () => void;
}

// --- LOCALIZED DEMO CONTENT ---
const getFullProgram = (t: (en: string, ru: string) => string) => [
  {
    month: t('Month 1: Awareness & Resources', 'Месяц 1: Осознанность и Ресурсы'),
    weeks: [
      { id: 1, title: t('Week 1: Stress physiology', 'Неделя 1: Физиология стресса'), completed: true, modules: [{ id: 101, title: t('How burnout works', 'Механизмы выгорания'), type: 'therapy', duration: t('15 min', '15 мин'), completed: true }, { id: 102, title: t('4-7-8 breathing', 'Дыхание 4-7-8'), type: 'somatic', duration: t('10 min', '10 мин'), completed: true }] },
      { id: 2, title: t('Week 2: Restoring energy', 'Неделя 2: Восстановление энергии'), completed: true, modules: [{ id: 103, title: t('Energy audit', 'Аудит энергии'), type: 'therapy', duration: t('20 min', '20 мин'), completed: true }, { id: 104, title: t('Progressive relaxation', 'Прогрессивная релаксация'), type: 'somatic', duration: t('15 min', '15 мин'), completed: true }] },
      { id: 3, title: t('Week 3: Boundaries & saying no', "Неделя 3: Границы и 'Нет'"), completed: true, modules: [{ id: 105, title: t('Setting boundaries', 'Установка границ'), type: 'therapy', duration: t('25 min', '25 мин'), completed: true }] },
      { id: 4, title: t('Week 4: Sleep & recovery', 'Неделя 4: Сон и отдых'), completed: false, active: true, modules: [{ id: 106, title: t('Sleep hygiene', 'Гигиена сна'), type: 'therapy', duration: t('15 min', '15 мин'), completed: true }, { id: 107, title: t('Yoga nidra', 'Йога-нидра'), type: 'somatic', duration: t('30 min', '30 мин'), completed: false }] },
    ]
  },
  {
    month: t('Month 2: Working with thoughts', 'Месяц 2: Работа с мышлением'),
    weeks: [
      { id: 5, title: t('Week 5: Thinking traps', 'Неделя 5: Ловушки мышления'), completed: false, modules: [{ id: 201, title: t('Cognitive distortions', 'Когнитивные искажения'), type: 'therapy', duration: t('20 min', '20 мин'), completed: false }] },
      { id: 6, title: t('Week 6: Perfectionism', 'Неделя 6: Перфекционизм'), completed: false, modules: [{ id: 202, title: t('Impostor syndrome', 'Синдром самозванца'), type: 'therapy', duration: t('25 min', '25 мин'), completed: false }] },
      { id: 7, title: t('Week 7: Emotional intelligence', 'Неделя 7: Эмоциональный интеллект'), completed: false, modules: [{ id: 203, title: t('Working with anger', 'Работа с гневом'), type: 'therapy', duration: t('20 min', '20 мин'), completed: false }, { id: 204, title: t('Shaking practice', 'Тряска (Shaking)'), type: 'somatic', duration: t('5 min', '5 мин'), completed: false }] },
      { id: 8, title: t('Week 8: Values & meaning', 'Неделя 8: Ценности и смыслы'), completed: false, modules: [{ id: 205, title: t('Finding meaning', 'Поиск смыслов'), type: 'therapy', duration: t('30 min', '30 мин'), completed: false }] },
    ]
  },
  {
    month: t('Month 3: Resilience & the future', 'Месяц 3: Устойчивость и Будущее'),
    weeks: [
      { id: 9, title: t('Week 9: Communication', 'Неделя 9: Коммуникация'), completed: false, modules: [{ id: 301, title: t('Nonviolent communication', 'Ненасильственное общение'), type: 'therapy', duration: t('20 min', '20 мин'), completed: false }] },
      { id: 10, title: t('Week 10: Conflict', 'Неделя 10: Конфликты'), completed: false, modules: [{ id: 302, title: t('Conflict resolution', 'Разрешение конфликтов'), type: 'therapy', duration: t('20 min', '20 мин'), completed: false }] },
      { id: 11, title: t('Week 11: Self-compassion', 'Неделя 11: Самосострадание'), completed: false, modules: [{ id: 303, title: t('Loving-kindness practice', 'Практика Loving Kindness'), type: 'somatic', duration: t('15 min', '15 мин'), completed: false }] },
      { id: 12, title: t('Week 12: Resilience plan', 'Неделя 12: План устойчивости'), completed: false, modules: [{ id: 304, title: t('Personal resilience plan', 'Итоговый план'), type: 'therapy', duration: t('40 min', '40 мин'), completed: false }] },
    ]
  }
];

const getFirstAidKits = (t: (en: string, ru: string) => string) => [
  { id: 1, title: t('Box breathing', 'Дыхание по квадрату'), desc: t('A quick reset for acute anxiety', 'Мгновенное снятие острой тревоги'), time: t('2 min', '2 мин'), color: 'bg-blue-500', icon: Wind },
  { id: 2, title: t('5-4-3-2-1 grounding', 'Заземление 5-4-3-2-1'), desc: t('Reconnect with the present during panic', 'Возвращение в реальность при панике'), time: t('5 min', '5 мин'), color: 'bg-emerald-500', icon: Zap },
  { id: 3, title: t('Cold reset', 'Холодная перезагрузка'), desc: t('Use a brief cold stimulus to help downshift', 'Активация нырятельного рефлекса'), time: t('1 min', '1 мин'), color: 'bg-cyan-500', icon: Thermometer },
  { id: 4, title: t('STOP technique', "Техника 'СТОП'"), desc: t('Interrupt a spiraling thought loop', 'Остановка навязчивых мыслей'), time: t('3 min', '3 мин'), color: 'bg-rose-500', icon: AlertTriangle },
];

const getInsights = (t: (en: string, ru: string) => string) => [
  { id: 1, category: 'insight', categoryLabel: t('Insight', 'Инсайт'), title: t('My main trigger', 'Мой главный триггер'), content: t('I noticed I get overwhelmed when work crosses into my personal time. My next step: mute notifications after 7 PM.', 'Я понял, что срываюсь, когда нарушают мои границы в нерабочее время. Решение: отключать уведомления после 19:00.'), date: t('Oct 12', '12 Окт') },
  { id: 2, category: 'technique', categoryLabel: t('Technique', 'Техника'), title: t('4-7-8 breathing', 'Дыхание 4-7-8'), content: t('Inhale for 4, hold for 7, exhale for 8. Use it before bed as a short wind-down practice.', 'Вдох на 4, задержка на 7, выдох на 8. Делать перед сном для быстрого засыпания.'), date: t('Oct 5', '05 Окт') },
  { id: 3, category: 'quote', categoryLabel: t('Reflection', 'Цитата'), title: t('On perfectionism', 'О перфекционизме'), content: t('Done is better than perfect. Mistakes are part of learning, not proof of failure.', 'Сделанное лучше идеального. Ошибки — это часть процесса роста, а не провал.'), date: t('Sep 28', '28 Сен') },
];

const getDemoNotes = (t: (en: string, ru: string) => string) => [
  { id: 1, date: t('Oct 22', '22 Окт'), text: t("It was hard to focus after a client meeting today. The grounding practice helped me reconnect with what I was feeling.", "Сегодня было сложно сосредоточиться после встречи с клиентом. Практика 'Заземление' помогла вернуться в тело.") },
  { id: 2, date: t('Oct 19', '19 Окт'), text: t('I noticed I sleep better when I put my phone away an hour before bed.', 'Заметил, что стал лучше спать после отказа от телефона за час до сна.') },
  { id: 3, date: t('Oct 15', '15 Окт'), text: t("Important reminder: I don't have to reply to every email immediately.", 'Важная мысль: я не обязан отвечать на письма мгновенно.') },
];

const getMoodOptions = (t: (en: string, ru: string) => string) => [
  { id: 'fatigue', label: t('Fatigued', 'Усталость'), emoji: '😫', color: 'bg-slate-500', positive: false },
  { id: 'anxiety', label: t('Anxious', 'Тревога'), emoji: '😰', color: 'bg-orange-500', positive: false },
  { id: 'irritation', label: t('Irritated', 'Раздражение'), emoji: '😠', color: 'bg-red-500', positive: false },
  { id: 'apathy', label: t('Apathetic', 'Апатия'), emoji: '😐', color: 'bg-gray-400', positive: false },
  { id: 'inspiration', label: t('Inspired', 'Вдохновение'), emoji: '🤩', color: 'bg-yellow-500', positive: true },
  { id: 'calm', label: t('Calm', 'Спокойствие'), emoji: '😌', color: 'bg-emerald-500', positive: true },
];

const getSymptomTags = (t: (en: string, ru: string) => string) => ({
  fatigue: [t('Hard to get moving', 'Нет сил встать'), t('Brain fog', 'Туман в голове'), t('Physical weakness', 'Физическая слабость')],
  anxiety: [t('Racing heartbeat', 'Сердцебиение'), t('Intrusive thoughts', 'Навязчивые мысли'), t('Worry about the future', 'Страх будущего')],
  irritation: [t('Colleagues get on my nerves', 'Бесят коллеги'), t('Everything feels harder than usual', 'Все валится из рук'), t('I feel like snapping', 'Хочется кричать')],
  apathy: [t("I don't want to do anything", 'Ничего не хочу'), t('Nothing feels meaningful', 'Смысла нет'), t('Every day feels the same', 'День сурка')],
  inspiration: [t('A new project', 'Новый проект'), t('A great team', 'Классная команда'), t('Creative flow', 'Творческий поток'), t('A recent win', 'Успех')],
  calm: [t('Good sleep', 'Хороший сон'), t('Healthy boundaries', 'Соблюдение границ'), t('A walk', 'Прогулка'), t('Quiet time', 'Тишина')],
});

const CustomTooltip = ({ active, payload, label, stressLabel = 'Stress', productivityLabel = 'Resource' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md p-3 border border-white/60 rounded-xl shadow-xl text-xs">
        <p className="font-bold text-slate-900 mb-1">{label}</p>
        <div className="space-y-0.5">
          <p className="text-slate-500">{stressLabel}: <span className="font-medium text-slate-900">{payload[0]?.value}%</span></p>
          <p className="text-slate-500">{productivityLabel}: <span className="font-medium text-slate-900">{payload[1]?.value}%</span></p>
        </div>
      </div>
    );
  }
  return null;
};

// Helper for needle in Gauge
const RADIAN = Math.PI / 180;
const Needle = ({ value, cx, cy, iR, oR, color }: any) => {
  const totalAngle = 180; // semicircle
  const angle = 180 - (value / 100) * totalAngle;
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * angle);
  const cos = Math.cos(-RADIAN * angle);
  const r = 5;
  const x0 = cx;
  const y0 = cy;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <g>
      <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />
      <path d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} fill={color} stroke="none" />
    </g>
  );
};

const EmployeeView: React.FC<EmployeeViewProps> = ({ activeTab, selectedModuleId, onModuleSelect, onModuleBack }) => {
  const { language, t, locale } = useLanguage();
  const fullProgram = getFullProgram(t);
  const firstAidKits = getFirstAidKits(t);
  const insights = getInsights(t);
  const demoNotes = getDemoNotes(t);
  const moodOptions = getMoodOptions(t);
  const symptomTags = getSymptomTags(t);
  // Check-in State
  const [checkInStep, setCheckInStep] = useState(0); 
  const [moodData, setMoodData] = useState({ mood: '', symptom: '', duration: '', stress: 5 });
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isCustomSymptomInput, setIsCustomSymptomInput] = useState(false);
  
  // Assessment State
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<AIAnalysisResult | null>(null);

  // Notes State
  const [userNotes, setUserNotes] = useState<Array<{ id: number; date: string; text: string }>>([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    // AI copy is language-specific; clear generated output when the user switches locale.
    setAiAdvice(null);
    setAssessmentResult(null);
  }, [language]);

  const questions = [
    { id: 1, text: t('I feel emotionally drained', 'Я чувствую себя эмоционально опустошенным(ой)') },
    { id: 2, text: t('It is hard to get up and start work in the morning', 'По утрам мне тяжело вставать и браться за работу') },
    { id: 3, text: t('I feel that I am working too much', 'Мне кажется, я слишком много работаю') },
    { id: 4, text: t('I feel burned out by my work', 'Я чувствую, что выгораю на работе') },
    { id: 5, text: t('I have become more emotionally distant from people lately', 'В последнее время я стал(а) более черствым(ой) к людям') },
    { id: 6, text: t('I feel disappointed with my work', 'Я чувствую, что моя работа меня разочаровывает') },
    { id: 7, text: t('I feel full of energy', 'Я полон(полна) энергии') },
    { id: 8, text: t('I handle my work tasks effectively', 'Я легко справляюсь с профессиональными задачами') },
    { id: 9, text: t('I feel that my work is meaningful', 'Я чувствую, что делаю полезное дело') },
    { id: 10, text: t('I feel indifferent to what happens to some colleagues', 'Меня не волнует, что происходит с некоторыми коллегами') },
    { id: 11, text: t('I want to withdraw and avoid seeing people', 'Мне хочется уединиться и никого не видеть') },
    { id: 12, text: t('I feel confident that I can handle what is ahead', 'Я чувствую уверенность, что у меня все получится') },
  ];

  const handleMoodSelect = (mood: string) => {
    const selectedMood = moodOptions.find((item) => item.id === mood);
    const isPositive = selectedMood?.positive ?? false;
    setMoodData(prev => ({ 
      ...prev, 
      mood, 
      stress: isPositive ? 2 : 7 // Default stress lower for positive moods
    }));
    setCheckInStep(1);
    setIsCustomSymptomInput(false);
  };

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    const selectedMood = moodOptions.find((item) => item.id === moodData.mood);
    const fullPromptContext = t(
      `My current state: ${selectedMood?.label || moodData.mood}. Details/symptoms: ${moodData.symptom}. Duration: ${moodData.duration}.`,
      `Мое состояние: ${selectedMood?.label || moodData.mood}. Детали/Симптомы: ${moodData.symptom}. Длительность: ${moodData.duration}.`
    );
    const advice = await getPersonalizedAdvice(fullPromptContext, moodData.stress, language);
    setAiAdvice(advice);
    setLoadingAdvice(false);
  };

  const handleAssessmentSubmit = async () => {
    if (Object.keys(assessmentAnswers).length < questions.length) {
      alert(t('Please answer all questions.', 'Пожалуйста, ответьте на все вопросы.'));
      return;
    }
    setLoadingAdvice(true);
    const result = await analyzeAssessment(assessmentAnswers as any, language);
    setAssessmentResult(result);
    setLoadingAdvice(false);
    if (!result) {
      alert(t('The AI interpretation is temporarily unavailable. Your answers were not lost — please try again.', 'AI-интерпретация временно недоступна. Ваши ответы не потеряны — попробуйте ещё раз.'));
    }
  };

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: Date.now(),
      date: new Date().toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
      text: newNoteText
    };
    setUserNotes([newNote, ...userNotes]);
    setNewNoteText('');
    setIsCreatingNote(false);
  };

  const resetCheckIn = () => {
    setCheckInStep(0);
    setMoodData({ mood: '', symptom: '', duration: '', stress: 5 });
    setAiAdvice(null);
    setIsCustomSymptomInput(false);
  };

  // --- RENDERERS ---

  if (activeTab === 'assessment') {
    return (
      <div key="assessment" className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-10 animate-enter">
        {!assessmentResult ? (
          <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-5 sm:p-8 border border-white/50 shadow-lg shadow-indigo-500/5 max-w-4xl mx-auto">
             <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{t('Wellbeing self-assessment', 'Самооценка состояния')}</h2>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-700 text-sm font-medium mb-1">
                    {t('Please rate how you have been feeling over the ', 'Пожалуйста, оцените свое состояние за ')}<span className="font-bold text-blue-700">{t('past 2 weeks', 'последние 2 недели')}</span>.
                  </p>
                  <p className="text-xs text-slate-500 mb-2">{t('This self-assessment helps track wellbeing trends. It is not a medical diagnosis.', 'Это self-assessment для отслеживания wellbeing, а не медицинская диагностика.')}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="w-6 h-6 rounded-lg border border-slate-300 bg-white flex items-center justify-center font-bold">1</span>
                      <span>{t('Never / Very rarely', 'Никогда / Очень редко')}</span>
                    </div>
                    <div className="hidden sm:block h-px w-8 bg-slate-300"></div>
                    <div className="flex items-center gap-1">
                      <span className="w-6 h-6 rounded-lg border border-slate-900 bg-slate-900 text-white flex items-center justify-center font-bold">5</span>
                      <span>{t('Very often / Every day', 'Очень часто / Каждый день')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {questions.map((q) => (
                <div key={q.id} className="pb-6 border-b border-black/5 last:border-0 last:pb-0">
                  <p className="font-medium text-slate-800 mb-4 text-base sm:text-lg">{q.text}</p>
                  <div className="grid grid-cols-5 gap-2 sm:flex sm:gap-3">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAssessmentAnswers(prev => ({ ...prev, [q.id]: val }))}
                        className={`w-full sm:w-12 h-11 sm:h-12 rounded-xl sm:rounded-2xl text-base font-semibold transition-all duration-300 ${
                          assessmentAnswers[q.id] === val 
                            ? 'bg-slate-900 text-white shadow-lg scale-110' 
                            : 'bg-white/50 text-slate-500 border border-white/60 hover:bg-white hover:scale-105'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button 
                onClick={handleAssessmentSubmit}
                disabled={loadingAdvice}
                className="mt-8 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl text-base font-medium w-full flex justify-center items-center transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {loadingAdvice ? t('Analyzing...', 'Анализ...') : t('View results', 'Получить результат')}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 gap-4">
               <div>
                 <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('Assessment results', 'Результаты оценки состояния')}</h2>
                 <p className="text-slate-500 text-sm">{t('Date', 'Дата')}: {new Date().toLocaleDateString(locale)}</p>
               </div>
               <div className="flex gap-3">
                 <button 
                    onClick={() => setAssessmentResult(null)}
                    className="text-slate-500 hover:text-slate-900 text-sm font-bold flex items-center transition-colors bg-white/50 px-4 py-2 rounded-xl border border-white/50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('Retake', 'Заново')}
                  </button>
               </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Overall Score Card - GAUGE STYLE */}
              <div className="lg:col-span-1 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-8 border border-white/50 shadow-lg shadow-indigo-500/5 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                 <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">{t('Overall burnout risk', 'Общий риск выгорания')}</h3>
                 <div className="relative w-full h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          dataKey="value"
                          startAngle={180}
                          endAngle={0}
                          data={[{ value: 33 }, { value: 33 }, { value: 34 }]}
                          cx="50%"
                          cy="70%"
                          innerRadius={80}
                          outerRadius={110}
                          fill="#8884d8"
                          paddingAngle={2}
                        >
                          <Cell fill="#10b981" stroke="none" />
                          <Cell fill="#f59e0b" stroke="none" />
                          <Cell fill="#ef4444" stroke="none" />
                        </Pie>
                        {/* Needle */}
                        <text x="50%" y="20%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 text-3xl font-bold">
                           {/* Invisible text for spacing */}
                        </text>
                        {assessmentResult && (
                           <Pie 
                             dataKey="value" 
                             startAngle={180} 
                             endAngle={0} 
                             data={[{value: assessmentResult.burnoutPercentage}]} 
                             cx="50%" 
                             cy="70%" 
                             innerRadius={0} 
                             outerRadius={0} 
                           >
                              {/* Custom Needle Rendering */}
                              {/* This is a hacky way to inject the needle since Pie doesn't support it directly */}
                           </Pie>
                        )}
                        <Needle value={assessmentResult.burnoutPercentage} cx="50%" cy="70%" iR={80} oR={110} color="#1e293b" />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-4 flex flex-col items-center">
                       <span className="text-5xl font-bold text-slate-900">{assessmentResult.burnoutPercentage}%</span>
                       <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full mt-2 ${
                         assessmentResult.burnoutPercentage > 60 ? 'bg-red-100 text-red-700' : 
                         assessmentResult.burnoutPercentage > 30 ? 'bg-amber-100 text-amber-700' : 
                         'bg-emerald-100 text-emerald-700'
                       }`}>
                         {assessmentResult.burnoutPercentage > 60 ? t('High risk', 'Высокий риск') : assessmentResult.burnoutPercentage > 30 ? t('Moderate risk', 'Средний риск') : t('Low risk', 'Низкий риск')}
                       </span>
                    </div>
                 </div>
              </div>

              {/* Trend Chart - VISUAL UPGRADE */}
              <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-8 border border-white/50 shadow-lg shadow-indigo-500/5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    {t('Wellbeing trend', 'Динамика состояния')}
                  </h3>
                  <div className="hidden sm:flex gap-4 text-xs font-medium bg-white/30 px-3 py-1 rounded-lg text-slate-500">
                    <span>{t('Illustrative history • synthetic data', 'Пример истории • synthetic data')}</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: t('1 mo ago', 'Месяц назад'), stress: 88, productivity: 40 },
                        { name: t('2 wks ago', '2 нед. назад'), stress: 75, productivity: 55 },
                        { name: t('1 wk ago', 'Неделю назад'), stress: 65, productivity: 68 },
                        { 
                          name: t('Now', 'Сейчас'),
                          stress: assessmentResult.metrics.exhaustion, 
                          productivity: 100 - assessmentResult.metrics.inefficacy 
                        },
                      ]}
                      margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                         <linearGradient id="colorStressEm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProdEm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
                      <Tooltip content={<CustomTooltip stressLabel={t('Stress', 'Стресс')} productivityLabel={t('Resource', 'Эффект.')} />} cursor={{stroke: 'rgba(0,0,0,0.1)', strokeWidth: 2}}/>
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <ReferenceLine y={50} label={t('Balance zone', 'Зона баланса')} stroke="#94a3b8" strokeDasharray="3 3" />
                      <Area 
                        type="monotone" 
                        dataKey="stress" 
                        name={t('Stress level', 'Уровень стресса')}
                        stroke="#ef4444" 
                        fill="url(#colorStressEm)" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#ef4444' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="productivity" 
                        name={t('Resource / effectiveness', 'Ресурс / Эффективность')}
                        stroke="#10b981" 
                        fill="url(#colorProdEm)" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: t('Exhaustion', 'Истощение'), val: assessmentResult.metrics.exhaustion, color: 'red', icon: Thermometer },
                { label: t('Cynicism', 'Цинизм'), val: assessmentResult.metrics.cynicism, color: 'orange', icon: AlertTriangle },
                { label: t('Inefficacy', 'Неэффективность'), val: assessmentResult.metrics.inefficacy, color: 'blue', icon: BarChart2 },
              ].map((m) => (
                <div key={m.label} className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
                   <div className={`absolute top-0 right-0 p-4 opacity-10 text-${m.color}-500 group-hover:opacity-20 transition-opacity`}>
                      <m.icon className="w-20 h-20" />
                   </div>
                   <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                     <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider">{m.label}</h4>
                     <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/60 text-slate-400 uppercase tracking-wider">
                        {t('Current snapshot', 'Текущий срез')}
                     </span>
                   </div>
                   
                   <div className="flex items-end gap-2 mb-3">
                      <span className="text-4xl font-bold text-slate-900">{m.val}%</span>
                   </div>
                   <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-${m.color}-500 transition-all duration-1000 ease-out`} style={{ width: `${m.val}%` }}></div>
                   </div>
                </div>
              ))}
            </div>

            {/* Analysis & Recommendations */}
            <div className="grid lg:grid-cols-5 gap-6">
               {/* Analysis Text - 2 Cols */}
               <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl p-5 sm:p-8 rounded-[2rem] border border-white/50 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
                        <Brain className="w-6 h-6" />
                     </div>
                     <h3 className="font-bold text-lg text-slate-900">{t('AI interpretation', 'Анализ состояния')}</h3>
                  </div>
                  <div className="space-y-6 flex-1">
                     <p className="text-slate-700 leading-relaxed font-medium">
                        {assessmentResult.summary}
                     </p>
                     <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                           <Briefcase className="w-4 h-4 text-indigo-600" />
                           <p className="text-xs text-indigo-900 font-bold uppercase tracking-wider">{t('Possible work impact', 'Влияние на работу')}</p>
                        </div>
                        <p className="text-slate-700 text-sm">{assessmentResult.productivityImpact}</p>
                     </div>
                  </div>
               </div>

               {/* Actionable Recommendations - 3 Cols - CARD GRID */}
               <div className="lg:col-span-3 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 backdrop-blur-xl p-5 sm:p-8 rounded-[2rem] border border-emerald-100/50 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                           <Target className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-emerald-900">{t('Your action plan', 'Ваш план действий')}</h3>
                           <p className="text-emerald-700/60 text-xs font-bold uppercase">{t('AI recommendations', 'Рекомендации AI')}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {assessmentResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white/80 p-5 rounded-2xl border border-emerald-100/50 hover:shadow-md transition-all group flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                           <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                              {t('Step', 'Шаг')} {idx + 1}
                           </span>
                           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">AI</span>
                        </div>
                        <p className="text-slate-800 text-sm font-semibold leading-relaxed mb-4 flex-1">
                           {rec}
                        </p>
                        <div className="mt-auto pt-3 border-t border-emerald-50">
                           <span className="text-xs text-slate-400 font-medium">{t('Personalized from your current assessment profile', 'Персонализировано по результатам текущей диагностики')}</span>
                        </div>
                      </div>
                    ))}
                    {/* Placeholder for visual balance if odd number */}
                    {assessmentResult.recommendations.length % 2 !== 0 && (
                       <div className="bg-emerald-50/30 border-2 border-dashed border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-emerald-600/50 p-4">
                          <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs font-bold">{t("You're building momentum", 'Вы на верном пути!')}</span>
                       </div>
                    )}
                  </div>
               </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'first_aid') {
    return (
      <div key="first_aid" className="space-y-6 max-w-5xl pb-10 animate-enter">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('Quick stress relief', 'Скорая помощь при стрессе')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {firstAidKits.map((kit) => (
             <div key={kit.id} className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] shadow-lg shadow-indigo-500/5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${kit.color} flex items-center justify-center text-white shadow-lg`}>
                    <kit.icon className="w-6 h-6" />
                  </div>
                  <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-slate-500 flex items-center border border-white/60">
                    <Clock className="w-3 h-3 mr-1" />
                    {kit.time}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{kit.title}</h3>
                <p className="text-slate-500 mb-6">{kit.desc}</p>
                <div className="w-full py-3 bg-white/40 rounded-xl text-slate-500 font-semibold text-sm border border-white/50 text-center">
                  {t('Demo practice card', 'Демо-карточка практики')}
                </div>
             </div>
          ))}
        </div>
      </div>
    )
  }

  // --- insights TAB (Previously in Summary) ---
  if (activeTab === 'insights') {
    return (
      <div key="insights" className="space-y-6 max-w-4xl pb-10 animate-enter">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('Practice insights', 'Инсайты из практики')}</h2>
        <p className="text-slate-500 -mt-4">{t('Key takeaways and techniques saved from completed modules.', 'Ключевые выводы и техники, сохраненные из пройденных модулей.')}</p>
        <div className="space-y-4">
          {insights.map((item) => (
             <div key={item.id} className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Lightbulb className="w-24 h-24 text-slate-900" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    item.category === 'insight' ? 'bg-purple-100/50 text-purple-700' :
                    item.category === 'technique' ? 'bg-emerald-100/50 text-emerald-700' :
                    'bg-amber-100/50 text-amber-700'
                  }`}>{item.categoryLabel}</span>
                  <span className="text-slate-400 text-xs font-medium">{item.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-2xl">{item.content}</p>
             </div>
          ))}
        </div>
      </div>
    )
  }

  // --- NOTES TAB (New User Journal) ---
  if (activeTab === 'notes') {
    return (
      <div key="notes" className="space-y-6 max-w-4xl pb-10 animate-enter">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
           <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('My notes', 'Мои заметки')}</h2>
           <button 
             onClick={() => setIsCreatingNote(true)}
             disabled={isCreatingNote}
             className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <PenTool className="w-4 h-4" />
             {t('New note', 'Новая заметка')}
           </button>
        </div>

        {/* Note Editor */}
        {isCreatingNote && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-lg animate-enter">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-900">{t('New entry', 'Новая запись')}</h3>
               <button onClick={() => setIsCreatingNote(false)} className="text-slate-400 hover:text-slate-600">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <textarea 
               autoFocus
               value={newNoteText}
               onChange={(e) => setNewNoteText(e.target.value)}
               placeholder={t("What's on your mind?", 'О чем вы думаете сейчас?')}
               className="w-full h-32 bg-white/50 border border-white/50 rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none mb-4"
             />
             <div className="flex justify-end gap-3">
               <button 
                 onClick={() => setIsCreatingNote(false)}
                 className="px-4 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors"
               >
                 {t('Cancel', 'Отмена')}
               </button>
               <button 
                 onClick={handleSaveNote}
                 className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
               >
                 <Save className="w-4 h-4" />
                 {t('Save', 'Сохранить')}
               </button>
             </div>
          </div>
        )}
        
        <div className="grid gap-6">
          {[...userNotes, ...demoNotes].map((note) => (
            <div key={note.id} className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] shadow-sm group">
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center text-slate-400 border border-white/60 flex-shrink-0">
                    <Edit3 className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{note.date}</p>
                    <p className="text-slate-800 font-medium leading-relaxed">{note.text}</p>
                 </div>
               </div>
            </div>
          ))}
          {/* Empty State Placeholder */}
          {userNotes.length === 0 && demoNotes.length === 0 && (
            <div className="border-2 border-dashed border-slate-300/50 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center text-slate-400">
               <BookOpen className="w-8 h-8 mb-2 opacity-50" />
               <p className="text-sm">{t('Capture thoughts and observations as you move through the program.', 'Записывайте здесь свои мысли и наблюдения в ходе прохождения программы')}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- FULL PROGRAM TAB (Was Practices) ---
  if (activeTab === 'program' && !selectedModuleId) {
     return (
        <div key="program_tree" className="space-y-8 max-w-5xl pb-10 animate-enter">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('Full resilience program', 'Вся программа курса')}</h2>
          <div className="space-y-8">
            {fullProgram.map((monthBlock, mIdx) => (
              <div key={mIdx}>
                 <div className="flex items-center gap-2 mb-4 pl-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{monthBlock.month}</h4>
                 </div>
                 <div className="space-y-4">
                    {monthBlock.weeks.map((week) => (
                      <div 
                        key={week.id} 
                        className={`backdrop-blur-xl border rounded-[2rem] p-6 shadow-sm transition-all ${
                          week.completed 
                            ? 'bg-emerald-50/40 border-emerald-100/50 opacity-90' 
                            : week.active 
                              ? 'bg-white/60 border-teal-200 shadow-xl ring-1 ring-teal-100'
                              : 'bg-white/20 border-white/30 opacity-60 grayscale-[0.5]'
                        }`}
                      >
                         <div className="flex justify-between items-center mb-4">
                           <h5 className={`font-bold text-lg flex items-center gap-2 ${week.completed ? 'text-emerald-900' : 'text-slate-900'}`}>
                             {week.completed ? (
                               <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                 <CheckCircle className="w-4 h-4" />
                               </div>
                             ) : (
                               <div className={`w-2 h-2 rounded-full ${week.active ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`}></div>
                             )}
                             {week.title}
                           </h5>
                           {!week.completed && !week.active && (
                             <Lock className="w-4 h-4 text-slate-400" />
                           )}
                         </div>

                         <div className="grid md:grid-cols-2 gap-4">
                           {week.modules.map((mod) => (
                             <div 
                               key={mod.id}
                               onClick={() => (week.completed || week.active) && onModuleSelect(mod.id)}
                               className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                                 (week.completed || week.active) ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-not-allowed'
                               } ${
                                 mod.completed 
                                   ? 'bg-white/60 border-emerald-100' 
                                   : 'bg-white/40 border-white/40'
                               }`}
                             >
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                      mod.type === 'therapy' ? 'text-blue-600 bg-blue-100/50' : 'text-purple-600 bg-purple-100/50'
                                    }`}>
                                      {mod.type === 'therapy' ? t('Mind', 'Психо') : t('Body', 'Тело')}
                                    </span>
                                  </div>
                                  <div className="font-bold text-sm text-slate-800">{mod.title}</div>
                               </div>
                               {(week.completed || week.active) && (
                                 mod.completed 
                                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                               )}
                             </div>
                           ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
     );
  }

  // --- MY PROGRESS TAB (Was Program - Current Week Focused) ---
  if (activeTab === 'progress' && !selectedModuleId) {
    // Current Week Hardcoded (Week 4)
    const currentWeekData = fullProgram[0].weeks[3];

    const isPositiveMood = moodOptions.find((item) => item.id === moodData.mood)?.positive ?? false;
    const tagsToDisplay = symptomTags[moodData.mood as keyof typeof symptomTags] || [];

    return (
      <div key="progress" className="space-y-8 max-w-5xl pb-10 animate-enter">
        {/* AI Check-in Wizard */}
        <section className="bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden min-h-[300px] flex flex-col justify-center">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-3xl mx-auto">
            {aiAdvice ? (
               <div className="animate-fade-in text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 mb-6">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4">{t('AI recommendation', 'Рекомендация AI')}</h3>
                  <p className="text-lg text-slate-200 leading-relaxed mb-8">{aiAdvice}</p>
                  <button 
                    onClick={resetCheckIn}
                    className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center mx-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('New check-in', 'Новый чекин')}
                  </button>
               </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                     {checkInStep === 0 && t('How are you feeling?', 'Как вы себя чувствуете?')}
                     {checkInStep === 1 && (isPositiveMood ? t('What is helping you feel this way?', 'Что помогает вам чувствовать себя так?') : t('What is bothering you most?', 'Что беспокоит сильнее всего?'))}
                     {checkInStep === 2 && t('How long has this been going on?', 'Как долго это длится?')}
                     {checkInStep === 3 && t('Stress level', 'Уровень стресса')}
                   </h2>
                   <div className="text-xs text-slate-500 font-bold bg-white/10 px-3 py-1 rounded-full">
                     {t('Step', 'Шаг')} {checkInStep + 1} {t('of', 'из')} 4
                   </div>
                </div>

                {/* STEP 0: MOOD SELECTION */}
                {checkInStep === 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-enter">
                    {moodOptions.map((m) => (
                      <button 
                        key={m.label}
                        onClick={() => handleMoodSelect(m.id)}
                        className="bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 rounded-2xl p-4 text-left transition-all group"
                      >
                        <span className="text-2xl mb-2 block">{m.emoji}</span>
                        <span className="font-bold text-sm text-slate-200 group-hover:text-white">{m.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* STEP 1: SYMPTOM TAGS / DETAILS */}
                {checkInStep === 1 && (
                  <div className="animate-enter">
                    {isCustomSymptomInput ? (
                       <div className="space-y-4">
                          <textarea 
                             autoFocus
                             className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 h-32"
                             placeholder={t('Tell us a little more...', 'Опишите подробнее...')}
                             value={moodData.symptom}
                             onChange={(e) => setMoodData(prev => ({ ...prev, symptom: e.target.value }))}
                          />
                          <button 
                            onClick={() => setCheckInStep(2)}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2 rounded-xl font-bold transition-colors"
                          >
                            {t('Continue', 'Продолжить')}
                          </button>
                       </div>
                    ) : (
                      <>
                        <p className="text-slate-400 mb-4 text-sm">{t('Choose the description that fits best:', 'Выберите наиболее точное описание:')}</p>
                        <div className="flex flex-wrap gap-3">
                          {tagsToDisplay.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => {
                                 setMoodData(prev => ({ ...prev, symptom: tag }));
                                 setCheckInStep(2);
                              }}
                              className="bg-white/5 hover:bg-teal-500/20 border border-white/10 hover:border-teal-500/50 rounded-xl px-5 py-3 text-sm font-medium transition-all"
                            >
                              {tag}
                            </button>
                          ))}
                          <button
                             onClick={() => setIsCustomSymptomInput(true)}
                             className="bg-transparent text-slate-400 hover:text-white px-5 py-3 text-sm font-medium transition-all"
                          >
                            {isPositiveMood ? t('Something else...', 'Что-то еще...') : t('Other...', 'Другое...')}
                          </button>
                        </div>
                      </>
                    )}
                     <button onClick={() => setCheckInStep(0)} className="mt-8 text-xs text-slate-500 hover:text-white flex items-center">
                        <ArrowLeft className="w-3 h-3 mr-1" /> {t('Back', 'Назад')}
                     </button>
                  </div>
                )}

                {/* STEP 2: DURATION */}
                {checkInStep === 2 && (
                  <div className="animate-enter">
                     <div className="grid gap-3">
                       {[t('Just started', 'Только что началось'), t('All day', 'Весь день'), t('Several days', 'Несколько дней'), t('For quite a while', 'Уже долгое время')].map((dur) => (
                         <button
                           key={dur}
                           onClick={() => {
                              setMoodData(prev => ({ ...prev, duration: dur }));
                              setCheckInStep(3);
                           }}
                           className="w-full text-left bg-white/5 hover:bg-white/15 border border-white/10 px-5 py-3 rounded-xl text-sm font-medium"
                         >
                           {dur}
                         </button>
                       ))}
                     </div>
                     <button onClick={() => { setCheckInStep(1); setIsCustomSymptomInput(false); }} className="mt-6 text-xs text-slate-500 hover:text-white flex items-center">
                        <ArrowLeft className="w-3 h-3 mr-1" /> {t('Back', 'Назад')}
                     </button>
                  </div>
                )}

                {/* STEP 3: STRESS SLIDER & SUBMIT */}
                {checkInStep === 3 && (
                  <div className="animate-enter">
                    <div className="mb-8">
                      <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
                        <span>{t('1 - Relaxed', '1 - Расслаблен')}</span>
                        <span className="text-teal-400 text-lg">{moodData.stress}</span>
                        <span>{t('10 - Panic', '10 - Паника')}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="10" 
                        value={moodData.stress}
                        onChange={(e) => setMoodData(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
                        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                      <p className="text-center text-slate-400 text-xs mt-3">{t('Move the slider to rate your current stress level', 'Передвиньте ползунок, чтобы оценить уровень стресса')}</p>
                    </div>

                    <button 
                      onClick={handleGetAdvice}
                      disabled={loadingAdvice}
                      className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-base hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      {loadingAdvice ? (
                        <>{t('Thinking...', 'Думаю...')}</>
                      ) : (
                        <>
                          {t('Ask AI for support', 'Попросить AI о поддержке')} <Sparkles className="w-4 h-4 text-teal-600" />
                        </>
                      )}
                    </button>
                     <button onClick={() => setCheckInStep(2)} className="mt-6 text-xs text-slate-500 hover:text-white flex items-center justify-center w-full">
                        {t('Back', 'Назад')}
                     </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Current Week Program (Focused View) */}
        <section>
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg sm:text-xl font-bold text-slate-900 px-2 flex items-start sm:items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                {t('Current week', 'Текущая неделя')}: {currentWeekData.title}
             </h3>
             <span className="text-xs font-bold bg-white/40 px-3 py-1 rounded-full text-slate-500 border border-white/50">{t('Week 4 of 12', '4 из 12 недель')}</span>
          </div>
          
          <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-5 sm:p-8 shadow-xl shadow-indigo-500/10">
             
             {/* Realistic Progress Bar */}
             <div className="mb-8">
               <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                 <span>{t('Weekly progress', 'Прогресс недели')}</span>
                 <span className="text-teal-600">65%</span>
               </div>
               <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden shadow-inner border border-white/30">
                 <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full w-[65%] rounded-full shadow-lg relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                 </div>
               </div>
               <p className="text-xs text-slate-500 mt-2 font-medium">{t('Good progress — 2 modules remaining.', 'Отличная работа! Осталось 2 модуля.')}</p>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
               {currentWeekData.modules.map((mod) => (
                 <div 
                   key={mod.id}
                   onClick={() => onModuleSelect(mod.id)}
                   className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                     mod.completed 
                       ? 'bg-emerald-50/50 border-emerald-100' 
                       : 'bg-white/80 border-white/60 hover:bg-white hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 ring-2 ring-transparent hover:ring-teal-200'
                   }`}
                 >
                   <div className="relative z-10">
                     <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                       <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-bold ${
                         mod.type === 'therapy' ? 'bg-blue-500/10 text-blue-700' : 'bg-emerald-500/10 text-emerald-700'
                       }`}>
                         {mod.type === 'therapy' ? t('Mind', 'Психотерапия') : t('Body', 'Тело')}
                       </span>
                       {mod.completed && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                     </div>
                     <h4 className={`font-bold text-xl mb-3 transition-colors ${mod.completed ? 'text-slate-500' : 'text-slate-900'}`}>
                       {mod.title}
                     </h4>
                     
                     {mod.completed ? (
                        <p className="text-sm text-emerald-600 font-bold mb-6 flex items-center">
                           <CheckCircle className="w-4 h-4 mr-2" />
                           {t('Completed', 'Пройдено')}
                        </p>
                     ) : (
                        <p className="text-sm text-slate-500 mb-6 flex items-center group-hover:text-teal-600 transition-colors">
                           {t('Open to continue', 'Нажмите, чтобы продолжить')} <ChevronRight className="w-4 h-4 ml-1" />
                        </p>
                     )}
                     
                     <div className="flex items-center text-xs text-slate-400 font-medium">
                       <Clock className="w-4 h-4 mr-1.5" />
                       {mod.duration}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </section>
      </div>
    );
  }

  // --- MODULE VIEW (Shared) ---
  if (selectedModuleId) {
    // Flatten logic for simple search
    const allModules = fullProgram.flatMap(m => m.weeks.flatMap(w => w.modules));
    const module = allModules.find(m => m.id === selectedModuleId);
    
    const activeModule = module;

    if (!activeModule) return null;

    return (
      <div key="module" className="max-w-4xl mx-auto pb-10 animate-enter">
        <button 
          onClick={onModuleBack} 
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-6 text-sm font-bold bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 inline-flex"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back', 'Назад')}
        </button>
        
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-2xl shadow-indigo-500/5 overflow-hidden min-w-0">
          <div className="bg-slate-900 aspect-video w-full flex items-center justify-center relative">
             <div className="absolute inset-0 bg-black/20"></div>
             <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold z-10">
               Demo learning content
             </div>
             <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-white z-10">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg mb-3 inline-block">
                  {activeModule.type === 'therapy' ? t('Mind skills', 'Психотерапия') : t('Body practice', 'Телесная практика')}
                </span>
                <h1 className="text-xl sm:text-3xl font-bold">{activeModule.title}</h1>
             </div>
          </div>
          
          <div className="p-5 sm:p-10">
             <div className="prose prose-lg prose-slate max-w-none mb-10">
               <p className="leading-relaxed opacity-90">{t('This module helps the employee recognize early stress signals, identify personal triggers, and choose one short self-regulation technique to practice during the week.', 'В этом модуле пользователь знакомится с ранними признаками стресса, фиксирует собственные триггеры и выбирает одну короткую технику саморегуляции для практики в течение недели.')}</p>
             </div>
             
             <div className="grid gap-4">
               <div className="flex items-center p-4 rounded-2xl bg-white/50 border border-white/60">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 mr-4">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-base font-semibold text-slate-900">{t('Core lesson', 'Основной урок')} <span className="text-xs text-slate-400 font-medium">• demo content</span></span>
               </div>
               <div className="flex items-center p-4 rounded-2xl bg-white/50 border border-white/60">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600 mr-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-base font-semibold text-slate-900">{t('Key takeaways', 'Ключевые тезисы')} <span className="text-xs text-slate-400 font-medium">• demo content</span></span>
               </div>
             </div>

             <div className="w-full mt-10 bg-white/40 text-slate-500 py-4 rounded-2xl text-sm font-semibold text-center border border-white/50">
               {t('Module progress is not persisted in the portfolio demo', 'В portfolio demo прогресс модуля не сохраняется')}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};

export default EmployeeView;