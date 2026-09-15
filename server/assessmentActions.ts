import type { AppLanguage } from '../types.js';
import type {
  ResultAction,
  SustainabilityFactor,
} from '../assessmentModel.js';
import type { DeterministicAssessmentScores } from './assessmentScoring.js';

type ActionSlot = 'today' | 'week' | 'support';

type ActionDefinition = {
  id: string;
  factor: SustainabilityFactor;
  slot: ActionSlot;
  en: { title: string; body: string };
  ru: { title: string; body: string };
};

const ACTIONS: ActionDefinition[] = [
  {
    id: 'workload_tradeoff',
    factor: 'workloadBalance',
    slot: 'today',
    en: {
      title: 'Make one trade-off explicit.',
      body: 'Choose one task that can be delayed, reduced, or dropped instead of trying to absorb everything.',
    },
    ru: {
      title: 'Явно выберите, от чего отказаться.',
      body: 'Определите одну задачу, которую можно перенести, сократить или убрать, вместо того чтобы пытаться вместить всё.',
    },
  },
  {
    id: 'workload_protect_focus',
    factor: 'workloadBalance',
    slot: 'today',
    en: {
      title: 'Protect one block for important work.',
      body: 'Set aside one uninterrupted block today for the task that matters most and move non-urgent requests around it.',
    },
    ru: {
      title: 'Защитите один блок для важной работы.',
      body: 'Выделите сегодня один непрерывный отрезок времени на самую важную задачу и перенесите несрочные запросы вокруг него.',
    },
  },
  {
    id: 'workload_priority_reset',
    factor: 'workloadBalance',
    slot: 'week',
    en: {
      title: 'Reset priorities with your manager.',
      body: 'Agree on what matters most — and what will not be done if capacity does not change.',
    },
    ru: {
      title: 'Сверьте приоритеты с руководителем.',
      body: 'Договоритесь, что сейчас действительно важно — и что не будет сделано, если объём доступного времени не изменится.',
    },
  },
  {
    id: 'workload_capacity_review',
    factor: 'workloadBalance',
    slot: 'week',
    en: {
      title: 'Review where capacity is being lost.',
      body: 'Look at recurring work, interruptions, and deadlines together and identify one source of load that can be changed.',
    },
    ru: {
      title: 'Посмотрите, куда уходит рабочая ёмкость.',
      body: 'Разберите повторяющиеся задачи, переключения и сроки и найдите хотя бы один источник нагрузки, который можно изменить.',
    },
  },
  {
    id: 'workload_support_review',
    factor: 'workloadBalance',
    slot: 'support',
    en: {
      title: 'Ask for a workload review.',
      body: 'If the pressure remains unmanageable after reprioritising, ask your manager to review workload, deadlines, or available resources with you.',
    },
    ru: {
      title: 'Запросите отдельный разбор нагрузки.',
      body: 'Если после пересмотра приоритетов нагрузка всё ещё остаётся чрезмерной, обсудите с руководителем объём работы, сроки и доступные ресурсы.',
    },
  },
  {
    id: 'recovery_window',
    factor: 'recovery',
    slot: 'today',
    en: {
      title: 'Protect one recovery window.',
      body: 'Create 10–15 minutes today with no work input: no messages, meetings, or task switching.',
    },
    ru: {
      title: 'Защитите один короткий период восстановления.',
      body: 'Выделите сегодня 10–15 минут без рабочих сообщений, встреч и переключения между задачами.',
    },
  },
  {
    id: 'recovery_end_day',
    factor: 'recovery',
    slot: 'today',
    en: {
      title: 'Create a clear end to the workday.',
      body: 'Pick a realistic stopping point today and avoid adding new work after it unless something is genuinely urgent.',
    },
    ru: {
      title: 'Обозначьте чёткий конец рабочего дня.',
      body: 'Выберите реалистичное время завершения работы сегодня и не добавляйте после него новые задачи, если они действительно не срочные.',
    },
  },
  {
    id: 'recovery_boundary',
    factor: 'recovery',
    slot: 'week',
    en: {
      title: 'Create one reliable boundary around work.',
      body: 'That could be a protected lunch, a real break between demanding tasks, or a clear end-of-day cutoff.',
    },
    ru: {
      title: 'Создайте одну устойчивую границу вокруг работы.',
      body: 'Например, полноценный обеденный перерыв, паузу между сложными задачами или чёткое время окончания рабочего дня.',
    },
  },
  {
    id: 'recovery_calendar',
    factor: 'recovery',
    slot: 'week',
    en: {
      title: 'Put recovery into the calendar.',
      body: 'Protect one repeatable gap between demanding meetings or tasks so recovery does not depend on spare time appearing by accident.',
    },
    ru: {
      title: 'Поставьте восстановление в календарь.',
      body: 'Защитите повторяющийся промежуток между сложными встречами или задачами, чтобы восстановление не зависело от случайно появившегося свободного времени.',
    },
  },
  {
    id: 'recovery_support',
    factor: 'recovery',
    slot: 'support',
    en: {
      title: 'Raise the recovery constraint.',
      body: 'If work regularly prevents you from recovering, raise it with your manager or use the support options available in your organisation.',
    },
    ru: {
      title: 'Поднимите вопрос о возможности восстанавливаться.',
      body: 'Если работа регулярно не оставляет возможности восстановиться, обсудите это с руководителем или воспользуйтесь доступными в компании вариантами поддержки.',
    },
  },
  {
    id: 'control_top_three',
    factor: 'controlClarity',
    slot: 'today',
    en: {
      title: 'Clarify what matters most.',
      body: 'Write down the three outcomes that matter most right now and flag anything that feels unclear or conflicting.',
    },
    ru: {
      title: 'Уточните, что сейчас действительно важно.',
      body: 'Запишите три главных результата, которых от вас ждут сейчас, и отметьте всё, что остаётся непонятным или противоречивым.',
    },
  },
  {
    id: 'control_flag_conflicts',
    factor: 'controlClarity',
    slot: 'today',
    en: {
      title: 'Name one unresolved conflict.',
      body: 'Pick one place where priorities, expectations, or ownership conflict and write down the decision you need from someone else.',
    },
    ru: {
      title: 'Назовите один нерешённый конфликт.',
      body: 'Выберите одно место, где конфликтуют приоритеты, ожидания или ответственность, и сформулируйте, какое решение вам нужно от другого человека.',
    },
  },
  {
    id: 'control_align',
    factor: 'controlClarity',
    slot: 'week',
    en: {
      title: 'Align on priorities and decision rights.',
      body: 'Ask your manager what takes priority, what you can decide yourself, and what “good enough” looks like.',
    },
    ru: {
      title: 'Согласуйте приоритеты и границы решений.',
      body: 'Уточните у руководителя, что имеет приоритет, какие решения вы можете принимать самостоятельно и какой результат считается достаточным.',
    },
  },
  {
    id: 'control_definition',
    factor: 'controlClarity',
    slot: 'week',
    en: {
      title: 'Define what a good result looks like.',
      body: 'Choose one important piece of work and align on the expected outcome, deadline, and who has the final decision.',
    },
    ru: {
      title: 'Зафиксируйте, как выглядит хороший результат.',
      body: 'Выберите одну важную задачу и согласуйте ожидаемый результат, срок и того, кто принимает финальное решение.',
    },
  },
  {
    id: 'control_support',
    factor: 'controlClarity',
    slot: 'support',
    en: {
      title: 'Ask for role or workload clarification.',
      body: 'If priorities remain unclear or you still lack enough control to do the work, ask for a focused conversation about expectations, ownership, and workload.',
    },
    ru: {
      title: 'Запросите уточнение роли или нагрузки.',
      body: 'Если приоритеты по-прежнему неясны или вам не хватает контроля над работой, отдельно обсудите ожидания, ответственность и нагрузку.',
    },
  },
];

const DEFAULT_ACTION_IDS: Record<
  SustainabilityFactor,
  Record<ActionSlot, string>
> = {
  workloadBalance: {
    today: 'workload_tradeoff',
    week: 'workload_priority_reset',
    support: 'workload_support_review',
  },
  recovery: {
    today: 'recovery_window',
    week: 'recovery_boundary',
    support: 'recovery_support',
  },
  controlClarity: {
    today: 'control_top_three',
    week: 'control_align',
    support: 'control_support',
  },
};

export const getAllowedActionIds = (
  factor: SustainabilityFactor,
  slot: ActionSlot
): string[] =>
  ACTIONS.filter((action) => action.factor === factor && action.slot === slot).map(
    (action) => action.id
  );

export const isAllowedActionId = (
  factor: SustainabilityFactor,
  slot: ActionSlot,
  id: string
): boolean => getAllowedActionIds(factor, slot).includes(id);

export const resolveAction = (
  id: string,
  language: AppLanguage
): ResultAction => {
  const action = ACTIONS.find((item) => item.id === id);
  if (!action) throw new Error(`Unknown assessment action: ${id}`);
  const copy = action[language];
  return { id: action.id, title: copy.title, body: copy.body };
};

export const getDefaultActionIds = (
  factor: SustainabilityFactor
): Record<ActionSlot, string> => DEFAULT_ACTION_IDS[factor];

export const buildFallbackInsight = (
  scores: DeterministicAssessmentScores,
  language: AppLanguage
): string => {
  const stable = scores.factors[scores.weakestFactor].score >= 65;

  if (scores.weakestFactor === 'workloadBalance') {
    if (language === 'ru') {
      return stable
        ? 'Баланс нагрузки — самая уязвимая часть текущего профиля, хотя в целом она пока остаётся устойчивой. Явные приоритеты помогут не дать этой зоне просесть.'
        : 'Сейчас основная зона давления — рабочая нагрузка. Самый полезный первый шаг — сократить конкурирующие требования, а не пытаться вместить в себя ещё больше.';
    }
    return stable
      ? 'Workload balance is the least strong part of your current profile, although it is still relatively stable. Keeping priorities explicit will help protect it.'
      : 'Workload balance is the main pressure point right now. The most useful first step is to reduce competing demands rather than asking yourself to absorb more.';
  }

  if (scores.weakestFactor === 'recovery') {
    if (language === 'ru') {
      return stable
        ? 'Восстановление — самая уязвимая часть текущего профиля, хотя в целом она пока остаётся устойчивой. Полезно заранее защищать время на паузы, а не оставлять их на остаточный принцип.'
        : 'Сейчас сильнее всего проседает восстановление. Первым шагом стоит создать реальное пространство между периодами нагрузки, а не просто добавлять ещё одну задачу в список заботы о себе.';
    }
    return stable
      ? 'Recovery is the least strong part of your current profile, although it is still relatively stable. Protecting recovery time in advance will help keep it from slipping.'
      : 'Recovery is the main pressure point right now. The first step is to create real space between periods of effort rather than adding another self-care task.';
  }

  if (language === 'ru') {
    return stable
      ? 'Контроль и ясность — самая уязвимая часть текущего профиля, хотя в целом она пока остаётся устойчивой. Чёткие приоритеты и границы решений помогут снизить лишнее трение.'
      : 'Сейчас основная зона напряжения — контроль и ясность в работе. Полезнее всего сначала убрать неопределённость в приоритетах, ожиданиях и границах решений.';
  }
  return stable
    ? 'Control & clarity is the least strong part of your current profile, although it is still relatively stable. Clear priorities and decision boundaries will help reduce friction.'
    : 'Control & clarity is the main pressure point right now. The most useful first step is to reduce uncertainty around priorities, expectations, and decision boundaries.';
};
