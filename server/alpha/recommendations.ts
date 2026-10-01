import type { SustainabilityFactor } from '../../assessmentModel';
import type { AlphaAction, AlphaLanguage } from '../../alpha/types';

type Slot = 'today' | 'week' | 'support';
type Entry = {
  id: string; factor: SustainabilityFactor; weakItemIds: number[]; workContexts: string[]; slot: Slot;
  en: { title: string; body: string }; ru: { title: string; body: string };
};

const catalog: Entry[] = [
  { id:'alpha-workload-dev-wip', factor:'workloadBalance', weakItemIds:[2,3,4], workContexts:['software_development'], slot:'today',
    en:{title:'Name the work already in progress',body:'List current work in progress and choose one item that can wait, shrink, or move.'},
    ru:{title:'Зафиксируйте работу в процессе',body:'Перечислите текущие задачи и выберите одну, которую можно отложить, сократить или перенести.'}},
  { id:'alpha-workload-sales-pipeline', factor:'workloadBalance', weakItemIds:[2,3,4], workContexts:['sales'], slot:'today',
    en:{title:'Separate must-win work from pipeline noise',body:'Mark today’s must-win opportunities and explicitly defer lower-value pipeline activity.'},
    ru:{title:'Отделите ключевые сделки от шума',body:'Отметьте главные возможности на сегодня и явно отложите менее ценную активность.'}},
  { id:'alpha-workload-today-general', factor:'workloadBalance', weakItemIds:[], workContexts:['general'], slot:'today',
    en:{title:'Reduce today’s active load',body:'Choose one task to defer, delegate, or reduce in scope before adding anything new.'},
    ru:{title:'Снизьте активную нагрузку сегодня',body:'Выберите одну задачу, которую можно отложить, делегировать или сократить до добавления новой.'}},
  { id:'alpha-workload-week-general', factor:'workloadBalance', weakItemIds:[], workContexts:['general','software_development','sales'], slot:'week',
    en:{title:'Run a one-week capacity experiment',body:'For seven days, cap simultaneous priorities and note what changes in rush, overtime, and unfinished work.'},
    ru:{title:'Проведите недельный эксперимент с нагрузкой',body:'На семь дней ограничьте число одновременных приоритетов и отмечайте изменения в спешке, переработках и незавершённой работе.'}},
  { id:'alpha-workload-support-general', factor:'workloadBalance', weakItemIds:[], workContexts:['general','software_development','sales'], slot:'support',
    en:{title:'Make the trade-off explicit',body:'Discuss which priority should move when new work arrives instead of silently absorbing it.'},
    ru:{title:'Сделайте компромисс явным',body:'Обсудите, какой приоритет должен сдвинуться при появлении новой работы, вместо того чтобы молча брать всё на себя.'}},
  { id:'alpha-recovery-today-general', factor:'recovery', weakItemIds:[], workContexts:['general','software_development','sales'], slot:'today',
    en:{title:'Create one real recovery boundary',body:'Protect one uninterrupted break or a clear end-of-day boundary today.'},
    ru:{title:'Создайте одну реальную границу восстановления',body:'Сегодня защитите один непрерывный перерыв или чёткую границу окончания рабочего дня.'}},
  { id:'alpha-recovery-week-general', factor:'recovery', weakItemIds:[], workContexts:['general','software_development','sales'], slot:'week',
    en:{title:'Test a seven-day shutdown routine',body:'Use the same short work-closing ritual for a week and notice whether work carries into the evening less.'},
    ru:{title:'Проверьте недельный ритуал завершения работы',body:'Неделю используйте один короткий ритуал завершения дня и отмечайте, меньше ли работа переносится в вечер.'}},
  { id:'alpha-recovery-support-general', factor:'recovery', weakItemIds:[], workContexts:['general','software_development','sales'], slot:'support',
    en:{title:'Discuss recovery constraints',body:'Raise recurring late work, interruptions, or scheduling patterns that make recovery difficult.'},
    ru:{title:'Обсудите ограничения для восстановления',body:'Поднимите повторяющиеся переработки, прерывания или особенности графика, которые мешают восстанавливаться.'}},
  { id:'alpha-control-today-general', factor:'controlClarity', weakItemIds:[], workContexts:['general','software_development','sales'], slot:'today',
    en:{title:'Choose the priority rule',body:'Write down what wins today if two priorities conflict, and what can wait.'},
    ru:{title:'Определите правило приоритета',body:'Запишите, что сегодня важнее при конфликте двух приоритетов и что может подождать.'}},
  { id:'alpha-control-week-general', factor:'controlClarity', weakItemIds:[], workContexts:['general','software_development','sales'], slot:'week',
    en:{title:'Track unresolved priority conflicts',body:'For one week, note each conflict you cannot resolve yourself and what decision was missing.'},
    ru:{title:'Отслеживайте неразрешённые конфликты приоритетов',body:'Неделю отмечайте каждый конфликт, который не можете разрешить сами, и какого решения не хватало.'}},
  { id:'alpha-control-support-general', factor:'controlClarity', weakItemIds:[], workContexts:['general','software_development','sales'], slot:'support',
    en:{title:'Ask for a decision, not more effort',body:'Bring one unresolved trade-off to your manager or team and ask which outcome takes precedence.'},
    ru:{title:'Запросите решение, а не больше усилий',body:'Вынесите один неразрешённый компромисс на обсуждение с руководителем или командой и уточните, какой результат важнее.'}}
];

export const selectAlphaRecommendations = (factor: SustainabilityFactor, weakIds: number[], context: string, language: AlphaLanguage) => {
  const slots: Slot[] = ['today','week','support'];
  const selected = slots.map(slot => {
    const candidates = catalog.filter(e => e.factor === factor && e.slot === slot).map(entry => {
      const contextMatch = entry.workContexts.includes(context);
      const weakItemMatch = entry.weakItemIds.some(id => weakIds.includes(id));
      let rank = 0;
      if (contextMatch && weakItemMatch) rank = 3;
      else if (contextMatch && entry.weakItemIds.length === 0) rank = 2;
      else if (entry.workContexts.includes('general') && entry.weakItemIds.length === 0) rank = 1;
      return {entry,rank};
    }).filter(x=>x.rank>0).sort((a,b)=>b.rank-a.rank || a.entry.id.localeCompare(b.entry.id));
    if (!candidates[0]) throw new Error('Missing deterministic recommendation fallback');
    return candidates[0].entry;
  });
  const localize = (e: Entry): AlphaAction => ({id:e.id,...e[language]});
  return { today:localize(selected[0]), week:localize(selected[1]), support:localize(selected[2]) };
};

export const insightFor = (factor: SustainabilityFactor, language: AlphaLanguage) => {
  const copy = {
    workloadBalance:{en:'Your largest weighted pressure is workload balance. Focus first on reducing simultaneous demand.',ru:'Наибольшее взвешенное давление сейчас связано с балансом нагрузки. Сначала стоит уменьшить объём одновременных требований.'},
    recovery:{en:'Your largest weighted pressure is recovery. Focus first on creating enough separation between work and recovery.',ru:'Наибольшее взвешенное давление сейчас связано с восстановлением. Сначала стоит увеличить дистанцию между работой и восстановлением.'},
    controlClarity:{en:'Your largest weighted pressure is control and clarity. Focus first on making priorities and trade-offs explicit.',ru:'Наибольшее взвешенное давление сейчас связано с контролем и ясностью. Сначала стоит сделать приоритеты и компромиссы явными.'}
  } as const;
  return copy[factor][language];
};