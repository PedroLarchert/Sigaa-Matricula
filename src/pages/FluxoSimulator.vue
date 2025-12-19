<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-text">
            <h1 class="animated-gradient-text">SIGAAFluxo</h1>
          </div>
          <div class="custom-select-wrapper">
            <select id="courseSelect" v-model="selectedCourse" @change="changeCourse">
              <option value="">Selecione seu curso</option>
              <option value="SI">Sistemas de Informação</option>
              <option value="CC">Ciência da Computação</option>
              <option value="EC">Engenharia de Computação</option>
            </select>
            <div class="custom-select" :class="{ open: showCourseSelect }">
              <div class="custom-select__trigger" @click="showCourseSelect = !showCourseSelect">
                <span>{{ courseLabel }}</span>
                <div class="arrow"></div>
              </div>
              <div class="custom-options">
                <span class="custom-option" :class="{ selected: !selectedCourse }" @click="selectCourseOption('')" data-value="">Selecione seu curso</span>
                <span class="custom-option" :class="{ selected: selectedCourse === 'SI' }" @click="selectCourseOption('SI')" data-value="SI">Sistemas de Informação</span>
                <span class="custom-option" :class="{ selected: selectedCourse === 'CC' }" @click="selectCourseOption('CC')" data-value="CC">Ciência da Computação</span>
                <span class="custom-option" :class="{ selected: selectedCourse === 'EC' }" @click="selectCourseOption('EC')" data-value="EC">Engenharia de Computação</span>
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button class="header-action-btn" id="lightModeToggle" @click="toggleDarkMode" :aria-label="darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'">
            <i class="fas" :class="darkMode ? 'fa-sun' : 'fa-moon'"></i>
          </button>
          <button class="header-action-btn" id="backToGrade" @click="goBackToGrade" aria-label="Voltar para Grade" title="Voltar para Grade">
            <i class="fas fa-th-large"></i>
          </button>
          <button class="header-action-btn" id="resetFlow" @click="resetFlowConfirm" aria-label="Resetar Fluxo" title="Resetar Fluxo">
            <i class="fas fa-undo"></i>
          </button>
          <button class="header-action-btn" id="importBtn" @click="openImportModal" aria-label="Importar Fluxo" title="Importar Fluxo">
            <i class="fas fa-file-import"></i>
          </button>
          <button class="header-action-btn" id="exportBtn" @click="openExportModal" aria-label="Exportar Fluxo" title="Exportar Fluxo">
            <i class="fas fa-file-download"></i>
          </button>
        </div>
      </div>
    </header>

    <div class="progress-bar-container" v-if="selectedCourse">
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <span class="progress-bar-text">{{ progressPercentage }}% concluído</span>
    </div>

    <main class="flow-container" id="flowContainer" v-if="selectedCourse">
      <div class="instructions-container">
        <h4 class="instructions">
          Para ver os pré-requisitos, passe o mouse sobre uma disciplina bloqueada 🔒.<br>
          Clique na disciplina para marcar como "Passei", "Cursando" ou "Reprovei" e acompanhar sua evolução.
        </h4>
      </div>

      <svg id="arrowSvg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; opacity: 0;"></svg>

      <div class="grid" id="gridContainer" ref="gridContainer">
        <div v-for="period in periods" :key="period" class="column" :data-period="period">
          <div class="col-header">
            {{ period }}
            <button class="period-btn" @click="openPeriodModal(period)" :title="'Configurar ' + period">⚙️</button>
            <button class="add-discipline-btn" @click="openAddDisciplineModal(period)" :title="'Adicionar disciplina'">＋</button>
          </div>
          <div v-for="discipline in getDisciplinesForPeriod(period)" :key="discipline" 
               class="node" 
               :data-id="discipline"
               :data-name="getDisciplineLabel(discipline)"
               :data-retake="isCustomDiscipline(discipline)"
               :title="getDisciplineClasses(discipline).includes('locked') ? `${getDisciplineLabel(discipline)} 🔒 Bloqueada - complete os pré-requisitos` : (isCustomDiscipline(discipline) ? `${getDisciplineLabel(discipline)} (Repetição)` : getDisciplineLabel(discipline))"
               :class="getDisciplineClasses(discipline)"
               @mouseenter="highlightDiscipline(discipline)"
               @mouseleave="clearHighlight"
               @click="openDisciplineModal(discipline)">
            <span v-if="getDisciplineClasses(discipline).includes('locked')" class="lock-icon" title="Bloqueada - complete os pré-requisitos">🔒</span>
            <span v-else-if="isCustomDiscipline(discipline)" class="retake-badge-small" title="Esta é uma repetição da disciplina">↻</span>
            {{ getDisciplineLabel(discipline).length > 20 ? getDisciplineLabel(discipline).slice(0, 18) + '…' : getDisciplineLabel(discipline) }}
          </div>
        </div>
      </div>
    </main>

    <div class="legend-container" v-if="selectedCourse">
      <div class="legend-item"><span class="legend-color passed"></span> Aprovado</div>
      <div class="legend-item"><span class="legend-color inprogress"></span> Cursando</div>
      <div class="legend-item"><span class="legend-color failed"></span> Reprovado</div>
      <div class="legend-item"><span class="legend-color locked"></span> Bloqueado</div>
      <div class="legend-item"><span class="legend-color retake-badge"></span> Repetição (segue os status acima)</div>
    </div>

    <!-- FAB (Mobile) -->
    <button class="fab" id="fab" @click="toggleFabModal">
      <i class="fas fa-bars"></i>
    </button>

    <!-- Modals -->
    <!-- Welcome Modal -->
    <div class="modal" id="welcomeModal" :class="{ open: showWelcomeModal }">
      <div class="modal-content">
        <h2>Bem-vindo ao SIGAAFluxo!</h2>
        <p>Selecione seu curso para começar:</p>
        <div class="btn-group">
          <button class="btn btn-course" data-course="SI" @click="selectCourseFromModal('SI')">Sistemas de Informação</button>
          <button class="btn btn-course" data-course="CC" @click="selectCourseFromModal('CC')">Ciência da Computação</button>
          <button class="btn btn-course" data-course="EC" @click="selectCourseFromModal('EC')">Engenharia de Computação</button>
        </div>
      </div>
    </div>

    <!-- Discipline Status Modal -->
    <div class="modal" id="modal" :class="{ open: showStatusModal }">
      <div class="modal-content">
        <p id="modalText">{{ modalText }}</p>
        <div class="btn-group">
          <button class="btn btn-pass" @click="handleStatusChange('passed')">Passei</button>
          <button class="btn btn-inprogress" @click="handleStatusChange('inprogress')">Cursando</button>
          <button class="btn btn-fail" @click="handleStatusChange('failed')">Reprovei</button>
          <button class="btn btn-clear" @click="handleStatusChange('clear')">Limpar</button>
          <button v-if="isCustomDiscipline(currentDiscipline)" class="btn btn-delete" @click="handleStatusChange('delete')">Deletar</button>
          <button class="btn btn-cancel" @click="closeStatusModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Period Modal -->
    <div class="modal" id="periodModal" :class="{ open: showPeriodModal }">
      <div class="modal-content">
        <p id="periodModalText">{{ periodModalText }}</p>
        <div class="btn-group">
          <button class="btn btn-pass" @click="handlePeriodChange('approved')">Aprovar Período</button>
          <button class="btn btn-clear" @click="handlePeriodChange('clear')">Limpar Período</button>
          <button class="btn btn-cancel" @click="closePeriodModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Add Discipline Modal -->
    <div class="modal" id="addDisciplineModal" :class="{ open: showAddModal }">
      <div class="modal-content">
        <h3>Adicionar Disciplina em {{ currentPeriod }}</h3>
        <p>Digite o nome da disciplina ou escolha uma disponível:</p>
        <input type="text" v-model="newDisciplineName" id="customDisciplineName" placeholder="Nome da disciplina" @keydown.enter="addCustomDiscipline" />
        <div v-if="newDisciplineName" class="discipline-suggestions">
          <div v-for="disc in getAvailableDisciplines().filter(d => d.name.toLowerCase().includes(newDisciplineName.toLowerCase())).slice(0, 5)" 
               :key="disc.name"
               class="suggestion-item"
               :class="{ available: !disc.hasPrereqs, locked: disc.hasPrereqs }"
               @click="newDisciplineName = disc.name">
            <span class="discipline-name">{{ disc.name }}</span>
            <span v-if="disc.period !== currentPeriod" class="period-badge">{{ disc.period }}</span>
            <span v-if="disc.missingPrereqs.length > 0" class="missing-prereqs">Faltam: {{ disc.missingPrereqs.join(', ') }}</span>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" @click="addCustomDiscipline">Adicionar</button>
          <button class="btn btn-cancel" @click="closeAddModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div class="modal" id="importModal" :class="{ open: showImportModal }">
      <div class="modal-content">
        <h3>Importar Fluxo</h3>
        <p>Escolha um arquivo JSON para importar:</p>
        <div class="btn-group">
          <button class="btn btn-primary" @click="triggerFileInput">
            <i class="fas fa-file-upload"></i> Selecionar Arquivo
          </button>
          <button class="btn btn-cancel" @click="closeImportModal">Cancelar</button>
        </div>
        <input type="file" ref="importFileInput" @change="handleFileImport" accept=".json" style="display: none" />
      </div>
    </div>

    <!-- Export Modal -->
    <div class="modal" id="exportModal" :class="{ open: showExportModal }">
      <div class="modal-content">
        <h3>Exportar Fluxo</h3>
        <p>Baixe seu fluxo em formato JSON:</p>
        <div class="btn-group">
          <button class="btn btn-primary" @click="downloadJSON">
            <i class="fas fa-download"></i> Baixar JSON
          </button>
          <button class="btn btn-cancel" @click="closeExportModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div class="modal" id="confirmModal" :class="{ open: showConfirmModal }">
      <div class="modal-content">
        <p id="confirmMessage">{{ confirmMessage }}</p>
        <div class="btn-group">
          <button class="btn btn-primary" id="confirmYes" @click="confirmAction">Sim</button>
          <button class="btn btn-cancel" id="confirmNo" @click="cancelConfirm">Não</button>
        </div>
      </div>
    </div>

    <!-- FAB Actions Modal -->
    <div class="modal" id="fabActionsModal" :class="{ open: showFabModal }">
      <div class="modal-content">
        <h3>Ações</h3>
        <div class="btn-group">
          <button class="btn btn-primary" @click="fabReset">
            <i class="fas fa-undo"></i> Resetar
          </button>
          <button class="btn btn-primary" @click="fabBackToGrade">
            <i class="fas fa-th-large"></i> Voltar para Grade
          </button>
          <button class="btn btn-cancel" @click="closeFabModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Confetti Container -->
    <div id="confetti"></div>

    <!-- Toast Container -->
    <div id="toastContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFluxoSimulator } from '../composables/useFluxoSimulator'

const router = useRouter()
const fluxoComposable = useFluxoSimulator()
const {
  curriculum,
  prerequisites,
  status,
  customDisciplines,
  periodCompletionStatus,
  currentCourse,
  darkMode,
  toggleDarkMode,
  resetFlow,
  persist,
  isCustomDiscipline,
  getOriginalDisciplines
} = fluxoComposable

const ARROW_COLORS = ['#e6194B', '#3cb44b', '#f58231', '#4363d8', '#f032e6', '#46f0f0', '#911eb4', '#fabebe', '#e6beff']

// Refs
const showCourseSelect = ref(false)
const selectedCourse = ref(currentCourse.value)
const showWelcomeModal = ref(false)
const showStatusModal = ref(false)
const showPeriodModal = ref(false)
const showAddModal = ref(false)
const showConfirmModal = ref(false)
const showFabModal = ref(false)
const showImportModal = ref(false)
const showExportModal = ref(false)

const currentDiscipline = ref('')
const currentPeriod = ref('')
const newDisciplineName = ref('')
const modalText = ref('')
const periodModalText = ref('')
const confirmMessage = ref('')
const confirmCallback = ref<(() => void) | null>(null)

const gridContainer = ref<HTMLElement | null>(null)
const importFileInput = ref<HTMLInputElement | null>(null)

// Computed
const courseLabel = computed(() => {
  if (!selectedCourse.value) return 'Selecione seu curso'
  const labels: Record<string, string> = {
    SI: 'Sistemas de Informação',
    CC: 'Ciência da Computação',
    EC: 'Engenharia de Computação'
  }
  return labels[selectedCourse.value] || 'Selecione seu curso'
})

const periods = computed(() => {
  if (!selectedCourse.value || !curriculum[selectedCourse.value]) return []
  return Object.keys(curriculum[selectedCourse.value])
})

const progressPercentage = computed(() => {
  if (!selectedCourse.value) return 0
  const allDisciplines = getOriginalDisciplines()
  const passedCount = allDisciplines.filter(d => status.value[d] === 'passed').length
  const totalCount = allDisciplines.length
  if (totalCount === 0) return 0
  return Math.round((passedCount / totalCount) * 100)
})

const currentPrereqs = computed(() => {
  if (!selectedCourse.value) return {}
  return prerequisites[selectedCourse.value] || {}
})

// Functions
const getDisciplinesForPeriod = (period: string): string[] => {
  if (!selectedCourse.value) return []
  const curr = curriculum[selectedCourse.value]
  const baseDisciplines = (curr as any)[period] || []
  const customDisc = customDisciplines.value[selectedCourse.value]?.[period] || []
  const customDisciplineIds = customDisc.map((d: any) => d.id || d.name || '')
  return [...baseDisciplines, ...customDisciplineIds]
}

const getDisciplineLabel = (id: string): string => {
  if (!selectedCourse.value) return id
  const courseCustoms = customDisciplines.value[selectedCourse.value]
  if (!courseCustoms) return id
  
  for (const period of Object.keys(courseCustoms)) {
    const found = courseCustoms[period].find((d: any) => d.id === id)
    if (found) return found.name || found.id
  }
  return id
}

const getDisciplineClasses = (discipline: string): string[] => {
  const classes: string[] = []

  // For custom instances, compute classes using logical name while keeping instance-specific status
  if (isCustomDiscipline(discipline)) {
    const stat = status.value[discipline]
    if (stat) {
      classes.push(stat)
    } else {
      const logicalName = getDisciplineLabel(discipline)
      const prereqs = currentPrereqs.value[logicalName] || []
      const isLocked = prereqs.some(req => status.value[req] !== 'passed')
      if (isLocked) classes.push('locked')
    }
    return classes
  }

  const stat = status.value[discipline]
  if (stat) {
    classes.push(stat)
  } else {
    const prereqs = currentPrereqs.value[discipline] || []
    const isLocked = prereqs.some(req => status.value[req] !== 'passed')
    if (isLocked) classes.push('locked')
  }

  return classes
}

const changeCourse = () => {
  if (selectedCourse.value) {
    localStorage.setItem('simfluxo_course', selectedCourse.value)
    currentCourse.value = selectedCourse.value
    revalidateAllStates()
    nextTick(() => {
      drawArrows(ARROW_COLORS)
      adjustFluxScale()
    })
  }
}

const selectCourseOption = (course: string) => {
  selectedCourse.value = course
  showCourseSelect.value = false
  changeCourse()
}

const selectCourseFromModal = (course: string) => {
  selectedCourse.value = course
  showWelcomeModal.value = false
  changeCourse()
}

const openDisciplineModal = (discipline: string) => {
  const classes = getDisciplineClasses(discipline)
  if (classes.includes('locked')) return
  
  currentDiscipline.value = discipline
  modalText.value = `Marcar status para "${getDisciplineLabel(discipline)}":`
  showStatusModal.value = true
}

const closeStatusModal = () => {
  showStatusModal.value = false
}

const handleStatusChange = (action: string) => {
  const id = currentDiscipline.value
  
  if (isCustomDiscipline(id)) {
    if (action === 'delete') {
      deleteCustomDiscipline(id)
      return
    }
    if (action === 'clear') {
      delete status.value[id]
    } else {
      status.value[id] = action
    }
  } else {
    if (action === 'clear') {
      delete status.value[id]
    } else {
      status.value[id] = action
    }
  }
  
  persist()
  closeStatusModal()
  revalidateAllStates()
  
  nextTick(() => {
    drawArrows(ARROW_COLORS)
    checkAndTriggerConfetti(findPeriodForDiscipline(id))
  })
}

const openPeriodModal = (period: string) => {
  currentPeriod.value = period
  periodModalText.value = `Configurar período ${period}`
  showPeriodModal.value = true
}

const closePeriodModal = () => {
  showPeriodModal.value = false
}

const handlePeriodChange = (action: string) => {
  const period = currentPeriod.value
  const disciplines = getDisciplinesForPeriod(period)
  
  disciplines.forEach(d => {
    if (isCustomDiscipline(d)) return
    
    if (action === 'approved') {
      status.value[d] = 'passed'
    } else if (action === 'clear') {
      delete status.value[d]
    }
  })
  
  persist()
  closePeriodModal()
  revalidateAllStates()
  
  nextTick(() => {
    drawArrows(ARROW_COLORS)
    if (action === 'approved') {
      checkAndTriggerConfetti(period)
    }
  })
}

const openAddDisciplineModal = (period: string) => {
  currentPeriod.value = period
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newDisciplineName.value = ''
}

const checkPrerequisitesMet = (disciplineName: string): boolean => {
  const prereqs = currentPrereqs.value[disciplineName] || []
  if (prereqs.length === 0) return true
  return prereqs.every(req => status.value[req] === 'passed')
}

const getAvailableDisciplines = (): Array<{ name: string; period: string; hasPrereqs: boolean; missingPrereqs: string[] }> => {
  if (!selectedCourse.value) return []
  
  const curr = curriculum[selectedCourse.value]
  const available: Array<{ name: string; period: string; hasPrereqs: boolean; missingPrereqs: string[] }> = []
  
  for (const period of Object.keys(curr)) {
    const disciplines = (curr as any)[period] || []
    for (const discipline of disciplines) {
      // Allow retakes even if a custom instance exists elsewhere
      const prereqs = currentPrereqs.value[discipline] || []
      const missingPrereqs = prereqs.filter(req => status.value[req] !== 'passed')
      const hasPrereqs = missingPrereqs.length === 0
      
      available.push({
        name: discipline,
        period,
        hasPrereqs,
        missingPrereqs
      })
    }
  }
  
  return available
}

const addCustomDiscipline = () => {
  const name = newDisciplineName.value.trim()
  if (!name) {
    showToast('O nome da disciplina não pode ser vazio.', 'error')
    return
  }
  
  // Check if it's a valid discipline from curriculum
  const availableDisciplines = getAvailableDisciplines()
  const disciplineInfo = availableDisciplines.find(d => d.name === name)
  
  if (!disciplineInfo) {
    showToast('Disciplina não encontrada no currículo.', 'error')
    return
  }
  
  // Check prerequisites
  if (!disciplineInfo.hasPrereqs) {
    const missingList = disciplineInfo.missingPrereqs.join(', ')
    showToast(`Pré-requisitos não atendidos: ${missingList}`, 'warning')
    return
  }
  
  if (!customDisciplines.value[selectedCourse.value]) {
    customDisciplines.value[selectedCourse.value] = {}
  }
  if (!customDisciplines.value[selectedCourse.value][currentPeriod.value]) {
    customDisciplines.value[selectedCourse.value][currentPeriod.value] = []
  }
  
  // Create unique ID for this instance so each instance has independent status
  const uniqueId = `custom_${currentPeriod.value}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  customDisciplines.value[selectedCourse.value][currentPeriod.value].push({
    id: uniqueId,
    name: name
  })
  persist()
  closeAddModal()
  showToast(`Disciplina "${name}" adicionada com sucesso em ${currentPeriod.value}!`, 'success')
}

const deleteCustomDiscipline = (disciplineId: string) => {
  if (!selectedCourse.value) return
  
  const courseCustoms = customDisciplines.value[selectedCourse.value]
  if (!courseCustoms) return
  
  // Find which period the discipline is in
  for (const period of Object.keys(courseCustoms)) {
    const index = courseCustoms[period].findIndex((d: any) => d.id === disciplineId)
    if (index > -1) {
      courseCustoms[period].splice(index, 1)
      if (courseCustoms[period].length === 0) {
        delete courseCustoms[period]
      }
      break
    }
  }
  
  // Also delete any status associated with this discipline
  delete status.value[disciplineId]
  
  persist()
  closeStatusModal()
  showToast('Disciplina removida com sucesso!', 'success')
}

const downloadJSON = () => {
  const dataToExport = {
    status: status.value,
    customDisciplines: customDisciplines.value,
    periodCompletionStatus: periodCompletionStatus.value,
    course: selectedCourse.value
  }
  
  const dataStr = JSON.stringify(dataToExport)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  const link = document.createElement('a')
  link.setAttribute('href', dataUri)
  link.setAttribute('download', 'meu_fluxo.json')
  link.click()
  closeExportModal()
}

const openImportModal = () => {
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
}

const openExportModal = () => {
  showExportModal.value = true
}

const closeExportModal = () => {
  showExportModal.value = false
}

const triggerFileInput = () => {
  importFileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (!data || !data.course) throw new Error('Formato inválido')
      
      showConfirm('Isso substituirá seu fluxo atual. Deseja continuar?', () => {
        status.value = data.status || {}
        customDisciplines.value = data.customDisciplines || {}
        periodCompletionStatus.value = data.periodCompletionStatus || {}
        selectedCourse.value = data.course
        currentCourse.value = data.course
        localStorage.setItem('simfluxo_course', data.course)
        persist()
        revalidateAllStates()
        nextTick(() => drawArrows(ARROW_COLORS))
        showToast('Fluxo importado com sucesso!', 'success')
        closeImportModal()
      })
    } catch (error) {
      showToast('Erro: O arquivo selecionado não é válido.', 'error')
    } finally {
      target.value = ''
    }
  }
  reader.readAsText(file)
}

const showConfirm = (message: string, callback: () => void) => {
  confirmMessage.value = message
  confirmCallback.value = callback
  showConfirmModal.value = true
}

const confirmAction = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
  showConfirmModal.value = false
  confirmCallback.value = null
}

const cancelConfirm = () => {
  showConfirmModal.value = false
  confirmCallback.value = null
}

const resetFlowConfirm = () => {
  showConfirm('Deseja realmente resetar todo o progresso do seu curso, incluindo disciplinas personalizadas?', () => {
    resetFlow()
    revalidateAllStates()
    nextTick(() => drawArrows(ARROW_COLORS))
    showToast('Fluxo resetado com sucesso!', 'success')
  })
}

const goBackToGrade = () => {
  router.push('/')
}

const toggleFabModal = () => {
  showFabModal.value = !showFabModal.value
}

const closeFabModal = () => {
  showFabModal.value = false
}

const fabReset = () => {
  closeFabModal()
  resetFlowConfirm()
}

const fabBackToGrade = () => {
  goBackToGrade()
}

const showToast = (message: string, type: string) => {
  const container = document.getElementById('toastContainer')
  if (!container) return
  
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.textContent = message
  container.appendChild(toast)
  
  setTimeout(() => toast.remove(), 3000)
}

const revalidateAllStates = () => {
  const allDisciplines = getOriginalDisciplines()
  let changed = true

  while (changed) {
    changed = false
    // Validate original disciplines
    for (const discipline of allDisciplines) {
      const currentStatus = status.value[discipline]
      if (currentStatus === 'passed' || currentStatus === 'inprogress' || currentStatus === 'failed') {
        const reqs = currentPrereqs.value[discipline] || []
        const hasUnpassedReq = reqs.some(req => status.value[req] !== 'passed')
        if (hasUnpassedReq) {
          delete status.value[discipline]
          changed = true
        }
      }
    }

    // Validate custom instances against logical prereqs
    const courseCustoms = customDisciplines.value[selectedCourse.value]
    if (courseCustoms) {
      for (const period of Object.keys(courseCustoms)) {
        for (const inst of courseCustoms[period] as any[]) {
          const id = inst.id
          const label = inst.name
          const currentStatus = status.value[id]
          if (currentStatus === 'passed' || currentStatus === 'inprogress' || currentStatus === 'failed') {
            const reqs = currentPrereqs.value[label] || []
            const hasUnpassedReq = reqs.some(req => status.value[req] !== 'passed')
            if (hasUnpassedReq) {
              delete status.value[id]
              changed = true
            }
          }
        }
      }
    }
  }

  persist()
}

const highlightDiscipline = (discipline: string) => {
  document.querySelectorAll('.node').forEach(n => n.classList.add('dimmed'))

  // Resolve logical name for prereq/dependent graph
  const logicalName = getDisciplineLabel(discipline)

  const prereqList = currentPrereqs.value[logicalName] || []
  const dependents = Object.keys(currentPrereqs.value).filter(t => (currentPrereqs.value[t] || []).includes(logicalName))
  const involved = new Set([logicalName, ...prereqList, ...dependents])

  document.querySelectorAll('.node').forEach(n => {
    const name = (n as HTMLElement).dataset.name
    if (name && involved.has(name)) n.classList.add('highlighted')
  })

  drawRelevantArrows(discipline, prereqList, dependents)
}

const clearHighlight = () => {
  document.querySelectorAll('.node').forEach(n => n.classList.remove('dimmed', 'highlighted'))
  const svg = document.getElementById('arrowSvg')
  if (svg) (svg as any).style.opacity = '0'
}

const drawArrows = (colorPalette: string[]) => {
  const svg = document.getElementById('arrowSvg')
  if (!svg) return
  
  svg.innerHTML = ''
  const ns = 'http://www.w3.org/2000/svg'
  const defs = document.createElementNS(ns, 'defs')
  
  const defaultColor = !darkMode.value ? '#555' : '#aaa'
  const defaultMarker = document.createElementNS(ns, 'marker')
  defaultMarker.setAttribute('id', 'arrowhead-default')
  defaultMarker.setAttribute('viewBox', '0 0 6 6')
  defaultMarker.setAttribute('markerWidth', '6')
  defaultMarker.setAttribute('markerHeight', '6')
  defaultMarker.setAttribute('refX', '5')
  defaultMarker.setAttribute('refY', '3')
  defaultMarker.setAttribute('orient', 'auto')
  
  const mPathDefault = document.createElementNS(ns, 'path')
  mPathDefault.setAttribute('d', 'M0,0 L0,6 L6,3 z')
  mPathDefault.setAttribute('fill', defaultColor)
  defaultMarker.appendChild(mPathDefault)
  defs.appendChild(defaultMarker)
  
  colorPalette.forEach((color, index) => {
    const marker = document.createElementNS(ns, 'marker')
    marker.setAttribute('id', `arrowhead-color-${index}`)
    marker.setAttribute('viewBox', '0 0 6 6')
    marker.setAttribute('markerWidth', '6')
    marker.setAttribute('markerHeight', '6')
    marker.setAttribute('refX', '5')
    marker.setAttribute('refY', '3')
    marker.setAttribute('orient', 'auto')
    
    const mPath = document.createElementNS(ns, 'path')
    mPath.setAttribute('d', 'M0,0 L0,6 L6,3 z')
    mPath.setAttribute('fill', color)
    marker.appendChild(mPath)
    defs.appendChild(marker)
  })
  
  svg.appendChild(defs)
  ;(svg as any).style.opacity = '0'
}

const drawRelevantArrows = (id: string, prereqList: string[], dependents: string[]) => {
  drawArrows(ARROW_COLORS)
  const svg = document.getElementById('arrowSvg')
  if (!svg) return
  
  ;(svg as any).style.opacity = '1'
  const defaultColor = !darkMode.value ? '#555' : '#aaa'
  
  prereqList.forEach(p => drawEdge(p, id, defaultColor, 'default'))
  dependents.forEach((d, index) => {
    const color = ARROW_COLORS[index % ARROW_COLORS.length]
    drawEdge(id, d, color, `color-${index % ARROW_COLORS.length}`)
  })
}

const drawEdge = (src: string, tgt: string, color: string, markerIndex: string) => {
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.getElementById('arrowSvg')
  const flowContainer = document.getElementById('flowContainer')
  if (!svg || !flowContainer) return
  
  const contRect = flowContainer.getBoundingClientRect()
  // Resolve possible multiple matches by ID or by logical name
  const fromCandidates = (
    Array.from(document.querySelectorAll(`.node[data-id="${src}"]`)) as HTMLElement[]
  ).concat(
    Array.from(document.querySelectorAll(`.node[data-name="${src}"]`)) as HTMLElement[]
  )
  const toCandidates = (
    Array.from(document.querySelectorAll(`.node[data-id="${tgt}"]`)) as HTMLElement[]
  ).concat(
    Array.from(document.querySelectorAll(`.node[data-name="${tgt}"]`)) as HTMLElement[]
  )

  if (fromCandidates.length === 0 || toCandidates.length === 0) return

  // Draw edges between each pair
  fromCandidates.forEach(from => {
    toCandidates.forEach(to => {
      const r1 = from.getBoundingClientRect()
      const r2 = to.getBoundingClientRect()
      const x1 = r1.right - contRect.left + flowContainer.scrollLeft
      const y1 = r1.top - contRect.top + r1.height / 2 + flowContainer.scrollTop
      const x2 = r2.left - contRect.left + flowContainer.scrollLeft
      const y2 = r2.top - contRect.top + r2.height / 2 + flowContainer.scrollTop
      const midX = (x1 + x2) / 2
      const path = document.createElementNS(ns, 'path')
      path.setAttribute('d', `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', color)
      path.setAttribute('stroke-width', '2')
      path.setAttribute('stroke-opacity', '0.8')
      path.setAttribute('marker-end', `url(#arrowhead-${markerIndex})`)
      svg.appendChild(path)
    })
  })
}

const adjustFluxScale = () => {
  const container = document.querySelector('.flow-container')
  const grid = document.querySelector('.grid')
  
  if (window.innerWidth > 768 && grid && (grid as HTMLElement).scrollWidth > 0) {
    const containerWidth = (container as HTMLElement).clientWidth
    const gridWidth = (grid as HTMLElement).scrollWidth
    
    if (gridWidth > containerWidth) {
      const targetWidth = containerWidth - 24
      const scale = targetWidth / gridWidth
      ;(grid as HTMLElement).style.transform = `scale(${scale})`
    } else {
      ;(grid as HTMLElement).style.transform = ''
    }
  } else if (grid) {
    ;(grid as HTMLElement).style.transform = ''
  }
}

const checkAndTriggerConfetti = (modifiedPeriod: string) => {
  if (!selectedCourse.value) return
  
  const allPeriods = Object.keys(curriculum[selectedCourse.value])
  
  allPeriods.forEach(p => {
    if (!periodCompletionStatus.value[p] || p === modifiedPeriod) {
      const periodDisciplines = getOriginalDisciplines().filter(d => {
        const curr = curriculum[selectedCourse.value]
        return (curr as any)[p]?.includes(d)
      })
      
      const periodTotal = periodDisciplines.length
      const periodPassed = periodDisciplines.filter(d => status.value[d] === 'passed').length
      
      if (periodTotal > 0 && periodPassed > 0 && periodPassed === periodTotal) {
        if (!periodCompletionStatus.value[p]) {
          triggerConfetti(false)
          showToast(`Período ${p} 100% concluído!`, 'success')
        }
        periodCompletionStatus.value[p] = true
      } else {
        periodCompletionStatus.value[p] = false
      }
    }
  })
  
  localStorage.setItem('simfluxo_period_completion', JSON.stringify(periodCompletionStatus.value))
  
  // Check for 100% completion
  if (progressPercentage.value === 100) {
    triggerConfetti(true)
  }
}

const triggerConfetti = (isFinal: boolean = false) => {
  const confettiContainer = document.getElementById('confetti')
  if (!confettiContainer) return
  
  confettiContainer.innerHTML = ''
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722']
  const count = isFinal ? 150 : 50
  const duration = isFinal ? 4000 : 2000
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    if (isFinal) confetti.classList.add('intense')
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.left = `${Math.random() * 100}vw`
    confetti.style.animationDelay = `${Math.random() * 0.5}s`
    confettiContainer.appendChild(confetti)
  }
  
  setTimeout(() => {
    confettiContainer.innerHTML = ''
  }, duration)
}

const updateDarkModeClass = () => {
  if (darkMode.value) {
    document.body.classList.remove('light-mode')
  } else {
    document.body.classList.add('light-mode')
  }
}

const findPeriodForDiscipline = (discipline: string): string => {
  if (!selectedCourse.value) return ''
  const curr = curriculum[selectedCourse.value]
  // Base curriculum
  for (const period of Object.keys(curr)) {
    if ((curr as any)[period].includes(discipline)) return period
  }
  // Custom instances by ID
  const courseCustoms = customDisciplines.value[selectedCourse.value]
  if (courseCustoms) {
    for (const period of Object.keys(courseCustoms)) {
      const found = courseCustoms[period].some((d: any) => d.id === discipline)
      if (found) return period
    }
  }
  return ''
}

// Lifecycle
// Migration: Convert old custom disciplines format (plain strings) to new format ({id, name})
const migrateCustomDisciplinesFormat = () => {
  for (const course of Object.keys(customDisciplines.value)) {
    const courseData = customDisciplines.value[course]
    for (const period of Object.keys(courseData)) {
      const items = courseData[period]
      // Check if items are strings (old format) or objects (new format)
      if (Array.isArray(items) && items.length > 0 && typeof items[0] === 'string') {
        // Convert old format to new format
        customDisciplines.value[course][period] = items.map((name: string) => ({
          id: `custom_${period}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: name
        }))
      }
    }
  }
  persist()
}

onMounted(() => {
  // Sync dark mode class on mount
  updateDarkModeClass()
  
  const savedCourse = localStorage.getItem('simfluxo_course')
  if (savedCourse) {
    selectedCourse.value = savedCourse
    currentCourse.value = savedCourse
  } else {
    showWelcomeModal.value = true
  }
  
  // Migrate old custom disciplines format if needed
  migrateCustomDisciplinesFormat()
  
  // Check for URL import
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('id')) {
    importFromURL(window.location.href)
    window.history.replaceState({}, document.title, window.location.pathname)
  }
  
  nextTick(() => {
    revalidateAllStates()
    drawArrows(ARROW_COLORS)
    adjustFluxScale()
    
    window.addEventListener('resize', () => {
      drawArrows(ARROW_COLORS)
      revalidateAllStates()
      adjustFluxScale()
    })
  })
})

watch(darkMode, () => {
  updateDarkModeClass()
  nextTick(() => {
    drawArrows(ARROW_COLORS)
  })
})
</script>

<style scoped>
.fab {
  display: none;
}

@media (max-width: 768px) {
  .fab {
    display: flex;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--roxo-principal);
    color: white;
    border: none;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    z-index: 1000;
  }
  
  .fab:hover {
    background: var(--roxo-hover);
  }
  
  .fab.active {
    transform: rotate(45deg);
  }
}

#arrowSvg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.scan-modal-content video {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  margin: 1rem 0;
}

#qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
  margin: 1rem 0;
}
</style>
