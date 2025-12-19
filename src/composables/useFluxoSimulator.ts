import { ref } from 'vue'

const STORAGE_KEY = 'simfluxo_status'
const COURSE_KEY = 'simfluxo_course'
const THEME_KEY = 'simfluxo_dark_mode'
const CUSTOM_DISCIPLINES_KEY = 'simfluxo_custom_disciplines'
const PERIOD_COMPLETION_KEY = 'simfluxo_period_completion'

export type DisciplineStatus = 'passed' | 'inprogress' | 'failed' | 'not-completed' | 'locked' | 'custom'

export interface CurriculumData {
  [key: string]: string[]
}

export const curriculum = {
  SI: {
    P1: ['Seminários', 'Cálculo A', 'PF', 'Vetores', 'ADM'],
    P2: ['Cálculo B', 'FEM', 'OSM', 'PI', 'IES'],
    P3: ['Arquitetura', 'Estatística', 'LPC', 'Estrutura de Dados', 'POO'],
    P4: ['MTPC', 'SO', 'PAA', 'Grafos', 'Sociologia'],
    P5: ['Redes', 'LFC', 'BD', 'TGS', 'ES1'],
    P6: ['Lab. de Redes', 'SD', 'SAD', 'IA', 'ES2'],
    P7: ['Empreendedorismo', 'GSI', 'Teste de Software'],
    P8: ['GDP', 'QST', 'EST'],
    P9: ['POC1', 'TCC1'],
    P10: ['POC2', 'TCC2', 'Estágio']
  },
  CC: {
    P1: ['Seminários', 'Cálculo A', 'PF', 'Vetores', 'FEM'],
    P2: ['PI', 'Cálculo B', 'LPC', 'Física 1', 'Lab de Física 1', 'Algebra Linear'],
    P3: ['POO', 'Cálculo C', 'Estrutura de Dados', 'LFC', 'FSD', 'PSD'],
    P4: ['Grafos', 'PAA', 'Arquitetura', 'Embarcados', 'MTPC', 'Estatística'],
    P5: ['PPC', 'ES1', 'BD', 'Redes', 'SO', 'IES'],
    P6: ['IA', 'ES2', 'PIMG', 'IHC', 'Lab. de Redes', 'SD'],
    P7: ['Compiladores', 'POC1'],
    P8: ['TCC1', 'POC2'],
    P9: ['Estágio', 'TCC2']
  },
  EC: {
    P1: ['Seminários', 'Cálculo A', 'PF', 'Vetores', 'FEM', 'IES'],
    P2: ['PI', 'Cálculo B', 'LPC', 'Física 1', 'Lab de Física 1', 'Algebra Linear'],
    P3: ['POO', 'Cálculo C', 'Estrutura de Dados', 'MTPC', 'Física 3', 'FSD', 'PSD'],
    P4: ['PAA', 'Arquitetura', 'Embarcados', 'Estatística', 'LFC', 'Intr. à Instrumentação', 'Cálculo D', 'Eq. Diferenciais 1'],
    P5: ['Grafos', 'ES1', 'Redes', 'SO', 'A. de Sistemas Lineares', 'Circuitos 1'],
    P6: ['IA', 'BD', 'ES2', 'Lab. de Redes', 'SD', 'PPC', 'Eletrônica 1'],
    P7: ['IHS', 'Cálculo Numérico 1', 'Controle'],
    P8: ['Compiladores', 'POC1', 'P. Digital de Sinais'],
    P9: ['POC2', 'TCC1'],
    P10: ['Estágio', 'TCC2']
  }
} as const

export const prerequisites = {
  SI: {
    'Cálculo B': ['Cálculo A'], 'OSM': ['ADM'], 'Arquitetura': ['PI'], 'POO': ['PI'],
    'LPC': ['FEM'], 'Estrutura de Dados': ['Cálculo B', 'PF', 'PI'], 'MTPC': ['Seminários'],
    'SO': ['Arquitetura', 'Estrutura de Dados'], 'PAA': ['Estrutura de Dados', 'FEM'],
    'Grafos': ['Estrutura de Dados', 'LPC'], 'Sociologia': ['ADM'], 'Redes': ['Arquitetura'],
    'LFC': ['LPC', 'PF'], 'BD': ['Estrutura de Dados'], 'TGS': ['OSM'], 'ES1': ['POO'],
    'Lab. de Redes': ['Redes'], 'SD': ['Redes', 'SO', 'POO'], 'SAD': ['BD', 'ES1'],
    'IA': ['Estatística', 'Grafos'], 'ES2': ['ES1'], 'Empreendedorismo': ['OSM'],
    'GSI': ['TGS'], 'Teste de Software': ['ES2'], 'GDP': ['ES1'], 'QST': ['ES2'],
    'EST': ['ES2'], 'POC1': ['Redes', 'BD', 'ES1'], 'TCC1': ['Redes', 'BD', 'MTPC', 'ES1'],
    'POC2': ['POC1'], 'TCC2': ['TCC1'], 'Estágio': ['Redes', 'BD', 'ES1']
  },
  CC: {
    'LPC': ['FEM'], 'Física 1': ['Cálculo A', 'Vetores'], 'Lab de Física 1': ['Cálculo A'],
    'Algebra Linear': ['Vetores'], 'Cálculo B': ['Cálculo A'], 'POO': ['PI'],
    'Estrutura de Dados': ['Cálculo B', 'PF', 'PI'], 'LFC': ['LPC', 'PF'],
    'FSD': ['PI', 'FEM'], 'PSD': ['PI', 'FEM'], 'Cálculo C': ['Cálculo B'],
    'Grafos': ['Estrutura de Dados', 'LPC'], 'PAA': ['Estrutura de Dados', 'FEM'],
    'Arquitetura': ['PI'], 'Embarcados': ['PI'], 'MTPC': ['Seminários'],
    'PPC': ['Arquitetura', 'Estrutura de Dados'], 'ES1': ['POO'], 'BD': ['Estrutura de Dados'],
    'Redes': ['Arquitetura'], 'SO': ['Arquitetura', 'Estrutura de Dados'],
    'IA': ['Estatística', 'Grafos'], 'PIMG': ['PI', 'Vetores'], 'ES2': ['ES1'],
    'IHC': ['POO'], 'Lab. de Redes': ['Redes'], 'SD': ['Redes', 'SO', 'POO'],
    'Compiladores': ['LFC', 'POO'], 'POC1': ['Redes', 'BD', 'ES1'], 'POC2': ['POC1'],
    'TCC1': ['Redes', 'BD', 'MTPC', 'ES1'], 'TCC2': ['TCC1'], 'Estágio': ['Redes', 'BD', 'ES1']
  },
  EC: {
    'Cálculo B': ['Cálculo A'], 'Cálculo C': ['Cálculo B'], 'Cálculo D': ['Cálculo C'],
    'Eq. Diferenciais 1': ['Cálculo B'], 'Algebra Linear': ['Vetores'],
    'Cálculo Numérico 1': ['PI'], 'LPC': ['FEM'], 'MTPC': ['Seminários'],
    'Estrutura de Dados': ['Cálculo B', 'PF', 'PI'], 'POO': ['PI'],
    'PSD': ['PI', 'FEM'], 'FSD': ['PI', 'FEM'], 'LFC': ['LPC', 'PF'],
    'Arquitetura': ['PI'], 'PAA': ['Estrutura de Dados', 'FEM'], 'Embarcados': ['PI'],
    'ES1': ['POO'], 'Grafos': ['Estrutura de Dados', 'LPC'],
    'SO': ['Arquitetura', 'Estrutura de Dados'], 'Redes': ['Arquitetura'],
    'ES2': ['ES1'], 'IA': ['Estatística', 'Grafos'],
    'PPC': ['Arquitetura', 'Estrutura de Dados'], 'SD': ['Redes', 'SO', 'POO'],
    'BD': ['Estrutura de Dados'], 'Lab. de Redes': ['Redes'], 'IHS': ['Arquitetura'],
    'Compiladores': ['LFC', 'POO'], 'POC1': ['Redes', 'BD', 'ES1'],
    'TCC1': ['Redes', 'BD', 'MTPC', 'ES1'], 'POC2': ['POC1'], 'TCC2': ['TCC1'],
    'Estágio': ['Redes', 'BD', 'ES1'], 'Física 1': ['Cálculo A', 'Vetores'],
    'Lab de Física 1': ['Cálculo A'], 'Física 3': ['Física 1'],
    'Intr. à Instrumentação': ['Lab de Física 1'],
    'A. de Sistemas Lineares': ['Eq. Diferenciais 1', 'Cálculo D'],
    'Circuitos 1': ['Eq. Diferenciais 1', 'Física 3'],
    'Eletrônica 1': ['Circuitos 1', 'Intr. à Instrumentação'],
    'Controle': ['A. de Sistemas Lineares'],
    'P. Digital de Sinais': ['A. de Sistemas Lineares']
  }
} as const

export function useFluxoSimulator() {
  const status = ref<{ [key: string]: DisciplineStatus }>({})
  const customDisciplines = ref<{ [course: string]: { [period: string]: Array<{ id: string; name: string }> } }>({})
  const periodCompletionStatus = ref<{ [key: string]: boolean }>({})
  const currentCourse = ref<keyof typeof curriculum>('SI')
  const darkMode = ref(true)

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status.value))
    localStorage.setItem(COURSE_KEY, currentCourse.value)
    localStorage.setItem(THEME_KEY, JSON.stringify(darkMode.value))
    localStorage.setItem(CUSTOM_DISCIPLINES_KEY, JSON.stringify(customDisciplines.value))
    localStorage.setItem(PERIOD_COMPLETION_KEY, JSON.stringify(periodCompletionStatus.value))
  }

  const load = () => {
    const savedDarkMode = localStorage.getItem(THEME_KEY)
    if (savedDarkMode !== null) {
      darkMode.value = JSON.parse(savedDarkMode)
    }
    status.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    customDisciplines.value = JSON.parse(localStorage.getItem(CUSTOM_DISCIPLINES_KEY) || '{}')
    periodCompletionStatus.value = JSON.parse(localStorage.getItem(PERIOD_COMPLETION_KEY) || '{}')
    
    const savedCourse = localStorage.getItem(COURSE_KEY)
    if (savedCourse) {
      currentCourse.value = savedCourse as keyof typeof curriculum
    }
  }

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    persist()
  }

  const resetFlow = () => {
    status.value = {}
    customDisciplines.value = {}
    periodCompletionStatus.value = {}
    persist()
  }

  const isCustomDiscipline = (identifier: string): boolean => {
    if (!currentCourse.value || !customDisciplines.value[currentCourse.value]) return false
    const courseCustoms = customDisciplines.value[currentCourse.value]
    if (!courseCustoms) return false
     return Object.values(courseCustoms).flat().some((d: any) => d.id === identifier)
  }

  const getOriginalDisciplines = (): string[] => {
    if (!currentCourse.value || !curriculum[currentCourse.value]) return []
    const curr = curriculum[currentCourse.value]
    // Return only base curriculum discipline names
    return Object.values(curr).flat()
  }

  return {
    curriculum,
    prerequisites,
    status,
    customDisciplines,
    periodCompletionStatus,
    currentCourse,
    darkMode,
    persist,
    load,
    toggleDarkMode,
    resetFlow,
    isCustomDiscipline,
    getOriginalDisciplines
  }
}
