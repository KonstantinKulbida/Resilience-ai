import type { AppLanguage } from '../types.js';
import type {
  ResultAction,
  SustainabilityFactor,
} from '../assessmentModel.js';
import type { DeterministicAssessmentScores } from './assessmentScoring.js';

type ActionSlot = 'today' | 'week' | 'support';

export type AssessmentGuidanceMode =
  | 'perfect'
  | 'protect'
  | 'watch'
  | 'pressure';

type ActionDefinition = {
  id: string;
  factor: SustainabilityFactor;
  slot: ActionSlot;
  en: { title: string; body: string };
  ru: { title: string; body: string };
};

type BilingualAction = {
  id: string;
  en: { title: string; body: string };
  ru: { title: string; body: string };
};

type BilingualActionSet = Record<ActionSlot, BilingualAction>;

type ActionSet = {
  today: ResultAction;
  week: ResultAction;
  support: ResultAction;
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

const PERFECT_ACTIONS: BilingualActionSet = {
  today: {
    id: 'maintenance_notice',
    en: {
      title: 'Notice what is working.',
      body: 'Identify one condition helping you work sustainably today — manageable workload, clear priorities, or enough recovery — and avoid disrupting it unnecessarily.',
    },
    ru: {
      title: 'Отметьте, что сейчас работает.',
      body: 'Выберите одно условие, которое помогает вам сохранять устойчивость сегодня — управляемую нагрузку, ясные приоритеты или возможность восстанавливаться — и постарайтесь его не нарушать.',
    },
  },
  week: {
    id: 'maintenance_protect',
    en: {
      title: 'Protect the current balance.',
      body: 'Keep one working habit or boundary in place this week that is already helping you maintain workload, recovery, and control.',
    },
    ru: {
      title: 'Сохраните текущий баланс.',
      body: 'Защитите на этой неделе одну рабочую привычку или границу, которая уже помогает вам поддерживать нагрузку, восстановление и контроль.',
    },
  },
  support: {
    id: 'maintenance_recheck',
    en: {
      title: 'Re-check if conditions change.',
      body: 'If workload, recovery, or control changes noticeably, retake the assessment and respond early rather than waiting for strain to build.',
    },
    ru: {
      title: 'Вернитесь к оценке, если условия изменятся.',
      body: 'Если заметно изменятся нагрузка, восстановление или контроль над работой, пройдите оценку снова и отреагируйте на изменения до того, как накопится напряжение.',
    },
  },
};

const PROTECT_ACTIONS: Record<SustainabilityFactor, BilingualActionSet> = {
  workloadBalance: {
    today: {
      id: 'protect_workload_today',
      en: {
        title: 'Protect what is already working.',
        body: 'Keep one boundary or prioritisation habit today that is helping your workload stay manageable.',
      },
      ru: {
        title: 'Сохраните то, что уже работает.',
        body: 'Сохраните сегодня одну границу или привычку приоритизации, которая помогает удерживать нагрузку управляемой.',
      },
    },
    week: {
      id: 'protect_workload_week',
      en: {
        title: 'Watch for workload creep.',
        body: 'Notice whether new requests, deadlines, or interruptions begin to erode the capacity you currently have.',
      },
      ru: {
        title: 'Следите за постепенным ростом нагрузки.',
        body: 'Обратите внимание, не начинают ли новые запросы, сроки или переключения постепенно съедать текущий запас времени.',
      },
    },
    support: {
      id: 'protect_workload_recheck',
      en: {
        title: 'Re-check if capacity changes.',
        body: 'Retake the assessment if work becomes harder to absorb or if previously manageable priorities begin to compete.',
      },
      ru: {
        title: 'Перепроверьте состояние, если запас снизится.',
        body: 'Пройдите оценку снова, если справляться с работой станет заметно труднее или управляемые сейчас приоритеты начнут конфликтовать.',
      },
    },
  },

  recovery: {
    today: {
      id: 'protect_recovery_today',
      en: {
        title: 'Keep one recovery habit intact.',
        body: 'Protect one break, stopping point, or recovery routine that is already helping you recharge.',
      },
      ru: {
        title: 'Сохраните одну работающую привычку восстановления.',
        body: 'Защитите один перерыв, время завершения работы или другой способ восстановления, который уже помогает вам возвращать силы.',
      },
    },
    week: {
      id: 'protect_recovery_week',
      en: {
        title: 'Watch for recovery getting squeezed.',
        body: 'Notice whether busier days start consuming breaks, evenings, or the space you normally use to recover.',
      },
      ru: {
        title: 'Следите, чтобы восстановление не начало сжиматься.',
        body: 'Обратите внимание, не начинают ли более загруженные дни забирать перерывы, вечера или другое время, которое обычно помогает восстановиться.',
      },
    },
    support: {
      id: 'protect_recovery_recheck',
      en: {
        title: 'Re-check if recovery starts slipping.',
        body: 'Retake the assessment if tiredness begins carrying over or switching off from work becomes noticeably harder.',
      },
      ru: {
        title: 'Перепроверьте состояние, если восстановление ухудшится.',
        body: 'Пройдите оценку снова, если усталость начнёт переноситься на следующий день или отключаться от работы станет заметно труднее.',
      },
    },
  },

  controlClarity: {
    today: {
      id: 'protect_control_today',
      en: {
        title: 'Keep priorities explicit.',
        body: 'Preserve the clarity you currently have by keeping the most important outcome visible when new requests arrive.',
      },
      ru: {
        title: 'Сохраняйте ясность приоритетов.',
        body: 'Поддерживайте текущую ясность, оставляя самый важный результат видимым, когда появляются новые запросы.',
      },
    },
    week: {
      id: 'protect_control_week',
      en: {
        title: 'Watch for ambiguity creeping in.',
        body: 'Notice whether ownership, priorities, or decision boundaries become less clear as work changes.',
      },
      ru: {
        title: 'Следите, чтобы неопределённость не накапливалась.',
        body: 'Обратите внимание, не становятся ли ответственность, приоритеты или границы решений менее ясными по мере изменения работы.',
      },
    },
    support: {
      id: 'protect_control_recheck',
      en: {
        title: 'Re-check if clarity drops.',
        body: 'Retake the assessment if priorities begin conflicting or your ability to influence the work becomes noticeably smaller.',
      },
      ru: {
        title: 'Перепроверьте состояние, если ясность снизится.',
        body: 'Пройдите оценку снова, если приоритеты начнут конфликтовать или возможность влиять на работу заметно уменьшится.',
      },
    },
  },
};

const WATCH_ACTIONS: Record<SustainabilityFactor, BilingualActionSet> = {
  workloadBalance: {
    today: {
      id: 'watch_workload_today',
      en: {
        title: 'Make one priority explicit.',
        body: 'Choose the most important outcome for today so limited capacity does not get spread across too many competing tasks.',
      },
      ru: {
        title: 'Сделайте один приоритет явным.',
        body: 'Выберите самый важный результат на сегодня, чтобы ограниченный запас времени не распылялся между слишком большим количеством конкурирующих задач.',
      },
    },
    week: {
      id: 'watch_workload_week',
      en: {
        title: 'Check where capacity is tightening.',
        body: 'Look for one recurring source of workload pressure and decide what could be simplified, delayed, or protected.',
      },
      ru: {
        title: 'Посмотрите, где начинает сжиматься запас.',
        body: 'Найдите один повторяющийся источник давления и решите, что можно упростить, перенести или защитить.',
      },
    },
    support: {
      id: 'watch_workload_recheck',
      en: {
        title: 'Act if the trend continues.',
        body: 'If workload becomes less manageable over the next several days, raise priorities or capacity before the pressure becomes persistent.',
      },
      ru: {
        title: 'Действуйте, если тенденция сохранится.',
        body: 'Если в ближайшие дни нагрузка станет менее управляемой, обсудите приоритеты или доступный ресурс до того, как давление станет постоянным.',
      },
    },
  },

  recovery: {
    today: {
      id: 'watch_recovery_today',
      en: {
        title: 'Protect one real break.',
        body: 'Create one period today with no work input so recovery does not depend entirely on the end of the day.',
      },
      ru: {
        title: 'Защитите один настоящий перерыв.',
        body: 'Создайте сегодня один период без рабочих стимулов, чтобы восстановление не зависело только от конца рабочего дня.',
      },
    },
    week: {
      id: 'watch_recovery_week',
      en: {
        title: 'Make recovery more reliable.',
        body: 'Choose one repeatable boundary this week that helps prevent work pressure from carrying into the next day.',
      },
      ru: {
        title: 'Сделайте восстановление более надёжным.',
        body: 'Выберите на этой неделе одну повторяемую границу, которая помогает не переносить рабочее напряжение на следующий день.',
      },
    },
    support: {
      id: 'watch_recovery_recheck',
      en: {
        title: 'Act if recovery keeps declining.',
        body: 'If tiredness increasingly carries over despite rest, revisit workload or work boundaries rather than simply pushing through.',
      },
      ru: {
        title: 'Действуйте, если восстановление продолжит ухудшаться.',
        body: 'Если усталость всё чаще сохраняется несмотря на отдых, вернитесь к нагрузке или рабочим границам вместо того, чтобы просто продолжать через силу.',
      },
    },
  },

  controlClarity: {
    today: {
      id: 'watch_control_today',
      en: {
        title: 'Clarify one uncertain priority.',
        body: 'Pick one unclear expectation or competing request and identify what decision would make the work easier to navigate.',
      },
      ru: {
        title: 'Уточните один неопределённый приоритет.',
        body: 'Выберите одно неясное ожидание или конкурирующий запрос и определите, какое решение сделало бы работу понятнее.',
      },
    },
    week: {
      id: 'watch_control_week',
      en: {
        title: 'Tighten one decision boundary.',
        body: 'Clarify one area where ownership, priority, or decision rights have begun to feel less clear.',
      },
      ru: {
        title: 'Уточните одну границу решений.',
        body: 'Проясните одну область, где ответственность, приоритет или право принимать решения начали становиться менее понятными.',
      },
    },
    support: {
      id: 'watch_control_recheck',
      en: {
        title: 'Act if ambiguity persists.',
        body: 'If unclear priorities or limited control continue, raise the specific decision or ownership gap before it becomes a recurring source of friction.',
      },
      ru: {
        title: 'Действуйте, если неопределённость сохраняется.',
        body: 'Если неясные приоритеты или недостаток контроля сохраняются, отдельно поднимите конкретный вопрос о решении или ответственности до того, как он станет постоянным источником трения.',
      },
    },
  },
};

const localizeActionSet = (
  actionSet: BilingualActionSet,
  language: AppLanguage
): ActionSet => {
  const localize = (action: BilingualAction): ResultAction => ({
    id: action.id,
    title: action[language].title,
    body: action[language].body,
  });

  return {
    today: localize(actionSet.today),
    week: localize(actionSet.week),
    support: localize(actionSet.support),
  };
};

export const getAllowedActionIds = (
  factor: SustainabilityFactor,
  slot: ActionSlot
): string[] =>
  ACTIONS.filter(
    (action) =>
      action.factor === factor &&
      action.slot === slot
  ).map((action) => action.id);

export const isAllowedActionId = (
  factor: SustainabilityFactor,
  slot: ActionSlot,
  id: string
): boolean =>
  getAllowedActionIds(factor, slot).includes(id);

export const resolveAction = (
  id: string,
  language: AppLanguage
): ResultAction => {
  const action = ACTIONS.find(
    (item) => item.id === id
  );

  if (!action) {
    throw new Error(
      `Unknown assessment action: ${id}`
    );
  }

  const copy = action[language];

  return {
    id: action.id,
    title: copy.title,
    body: copy.body,
  };
};

export const getDefaultActionIds = (
  factor: SustainabilityFactor
): Record<ActionSlot, string> =>
  DEFAULT_ACTION_IDS[factor];

export const isPerfectSustainabilityProfile = (
  scores: DeterministicAssessmentScores
): boolean =>
  scores.factors.workloadBalance.score === 100 &&
  scores.factors.recovery.score === 100 &&
  scores.factors.controlClarity.score === 100;

export const getAssessmentGuidanceMode = (
  scores: DeterministicAssessmentScores
): AssessmentGuidanceMode => {
  if (isPerfectSustainabilityProfile(scores)) {
    return 'perfect';
  }

  const status =
    scores.factors[scores.weakestFactor].status;

  if (status === 'green') {
    return 'protect';
  }

  if (status === 'stable') {
    return 'watch';
  }

  return 'pressure';
};

export const getNonPressureActions = (
  scores: DeterministicAssessmentScores,
  language: AppLanguage
): ActionSet => {
  const mode = getAssessmentGuidanceMode(scores);

  if (mode === 'perfect') {
    return localizeActionSet(
      PERFECT_ACTIONS,
      language
    );
  }

  if (mode === 'protect') {
    return localizeActionSet(
      PROTECT_ACTIONS[scores.weakestFactor],
      language
    );
  }

  if (mode === 'watch') {
    return localizeActionSet(
      WATCH_ACTIONS[scores.weakestFactor],
      language
    );
  }

  throw new Error(
    'getNonPressureActions called for a pressure profile'
  );
};

export const buildFallbackInsight = (
  scores: DeterministicAssessmentScores,
  language: AppLanguage
): string => {
  const mode = getAssessmentGuidanceMode(scores);

  if (mode === 'perfect') {
    return language === 'ru'
      ? 'Все три фактора сейчас находятся в сильной зоне. Здесь не нужно искать проблему для исправления — полезнее сохранить условия, которые позволяют рабочему режиму оставаться устойчивым.'
      : 'All three factors are currently strong. There is no problem to fix right now — the useful next step is to protect the conditions that are keeping your work sustainable.';
  }

  if (scores.weakestFactor === 'workloadBalance') {
    if (language === 'ru') {
      if (mode === 'protect') {
        return 'Баланс нагрузки остаётся в сильной зоне, хотя сейчас это наиболее чувствительная часть профиля. Полезнее сохранить работающие границы и следить, чтобы новые требования постепенно не съедали текущий запас.';
      }

      if (mode === 'watch') {
        return 'Баланс нагрузки в целом остаётся устойчивым, но уже показывает некоторое напряжение. Сейчас полезно отследить, где начинает сокращаться запас времени и внимания, и скорректировать это до накопления давления.';
      }

      return 'Сейчас основная зона давления — рабочая нагрузка. Самый полезный первый шаг — сократить конкурирующие требования, а не пытаться вместить в себя ещё больше.';
    }

    if (mode === 'protect') {
      return 'Workload balance remains in the green zone, although it is currently the most sensitive part of the profile. Protect the boundaries that are working and watch for new demands gradually reducing your available capacity.';
    }

    if (mode === 'watch') {
      return 'Workload balance is still broadly stable, but some strain is starting to appear. The useful next step is to notice where capacity is tightening and adjust before the pressure becomes persistent.';
    }

    return 'Workload balance is the main pressure point right now. The most useful first step is to reduce competing demands rather than asking yourself to absorb more.';
  }

  if (scores.weakestFactor === 'recovery') {
    if (language === 'ru') {
      if (mode === 'protect') {
        return 'Восстановление остаётся в сильной зоне, хотя сейчас это наиболее чувствительная часть профиля. Полезно сохранить работающие паузы и границы, чтобы более загруженные дни постепенно их не вытеснили.';
      }

      if (mode === 'watch') {
        return 'Восстановление в целом остаётся устойчивым, но уже показывает некоторое напряжение. Полезно сделать паузы и границы более надёжными до того, как усталость начнёт переноситься изо дня в день.';
      }

      return 'Сейчас сильнее всего проседает восстановление. Первым шагом стоит создать реальное пространство между периодами нагрузки, а не просто добавлять ещё одну задачу в список заботы о себе.';
    }

    if (mode === 'protect') {
      return 'Recovery remains in the green zone, although it is currently the most sensitive part of the profile. Protect the breaks and boundaries that are already working so busier days do not gradually squeeze them out.';
    }

    if (mode === 'watch') {
      return 'Recovery is still broadly stable, but some strain is starting to appear. Making breaks and boundaries more reliable now can help prevent tiredness from carrying over day to day.';
    }

    return 'Recovery is the main pressure point right now. The first step is to create real space between periods of effort rather than adding another self-care task.';
  }

  if (language === 'ru') {
    if (mode === 'protect') {
      return 'Контроль и ясность остаются в сильной зоне, хотя сейчас это наиболее чувствительная часть профиля. Полезно сохранить ясные приоритеты и границы решений, пока они работают хорошо.';
    }

    if (mode === 'watch') {
      return 'Контроль и ясность в целом остаются устойчивыми, но уже появляется некоторое трение. Сейчас полезно убрать одну конкретную неопределённость в приоритетах, ответственности или решениях.';
    }

    return 'Сейчас основная зона напряжения — контроль и ясность в работе. Полезнее всего сначала убрать неопределённость в приоритетах, ожиданиях и границах решений.';
  }

  if (mode === 'protect') {
    return 'Control & clarity remains in the green zone, although it is currently the most sensitive part of the profile. Protect the clear priorities and decision boundaries that are already working well.';
  }

  if (mode === 'watch') {
    return 'Control & clarity is still broadly stable, but some friction is starting to appear. Clarifying one specific uncertainty around priorities, ownership, or decisions can prevent that friction from growing.';
  }

  return 'Control & clarity is the main pressure point right now. The most useful first step is to reduce uncertainty around priorities, expectations, and decision boundaries.';
};