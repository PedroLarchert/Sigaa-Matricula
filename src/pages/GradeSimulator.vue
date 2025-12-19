<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <button class="header-action-btn" @click="toggleSidebar"><i class="fas fa-bars"></i></button>
          <div class="header-text"><h1 class="animated-gradient-text">Simulador de Grade</h1></div>
        </div>
        <div class="header-right">
          <button class="simfluxo-header-btn" @click="router.push('/fluxo')">
            <i class="fas fa-sitemap"></i><span>SIGAAFluxo</span>
          </button>
          <button class="header-action-btn" @click="toggleDarkMode">
            <i class="fas" :class="darkMode ? 'fa-sun' : 'fa-moon'"></i>
          </button>
        </div>
      </div>
    </header>

    <div class="container">
      <section class="form-card" :class="{ open: sidebarOpen }">
        <button class="close-button" @click="toggleSidebar">×</button>
        <h2>Adicionar</h2>
        <label>Nome da Disciplina</label>
        <input type="text" v-model="formData.nome" placeholder="Ex: Redes de Computadores">
        <label>Nome do Professor</label>
        <input type="text" v-model="formData.professor" placeholder="Ex: Leobino">
        <label>Código de Horário</label>
        <input type="text" v-model="formData.codigo" placeholder="Ex: 24T12" @input="formData.codigo = formData.codigo.toUpperCase()">
        <p class="info">Para horários alternados, separe com espaço. Ex: 24T12 35M34</p>
        <div class="buttons">
          <button @click="addDisciplineClick"><i class="fas fa-plus"></i> Adicionar Disciplina</button>
          <button @click="activityModalOpen = true"><i class="fas fa-tasks"></i> Adicionar Atividade</button>
          <button @click="saveAsImage"><i class="fas fa-camera"></i> Salvar Imagem</button>
          <div class="import-export-buttons">
            <button @click="importModalOpen = true"><i class="fas fa-upload"></i> Importar</button>
            <button @click="openExportModal"><i class="fas fa-download"></i> Exportar</button>
          </div>
          <input type="file" ref="fileInput" @change="importFromFile" accept=".json" style="display: none;">
          <button @click="clearAllClick" class="danger"><i class="fas fa-trash-alt"></i> Limpar Tudo</button>
        </div>
      </section>

      <section class="timetable-container">
        <div class="timetable" ref="timetableRef">
          <div class="header-cell"></div>
          <div v-for="dia in dias.slice(1)" :key="dia" class="header-cell">{{ dia }}</div>
          
          <template v-for="(horario, hIdx) in horarios" :key="`row-${hIdx}`">
            <div class="time-cell">{{ horario }}</div>
            <div 
              v-for="dIdx in 6" 
              :key="`cell-${dIdx}-${hIdx}`"
              class="cell"
              :class="getCellClass(dIdx - 1, hIdx)"
              @click="openEditModal(`${dIdx - 1}-${hIdx}`)">
              <template v-if="occupiedSlots[`${dIdx - 1}-${hIdx}`]">
                <strong>{{ abbrev(occupiedSlots[`${dIdx - 1}-${hIdx}`].disciplina, 20) }}</strong>
                <small v-if="!occupiedSlots[`${dIdx - 1}-${hIdx}`].isActivity">
                  {{ abbrev(occupiedSlots[`${dIdx - 1}-${hIdx}`].professor, 20) }}
                </small>
              </template>
            </div>
          </template>
        </div>
      </section>
    </div>

    <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="toggleSidebar"></div>

    <!-- Modals -->
    <div class="modal" :class="{ open: editModalOpen }">
      <div class="modal-content">
        <button class="modal-close" @click="editModalOpen = false">×</button>
        <h3>{{ editModalTitle }}</h3>
        <label>{{ editNameLabel }}</label>
        <input type="text" v-model="editData.nome">
        <div v-if="!editData.isActivity">
          <label>Nome do Professor</label>
          <input type="text" v-model="editData.professor">
        </div>
        <label>Código de Horário</label>
        <input type="text" v-model="editData.codigo">
        <div class="modal-buttons">
          <button @click="saveEdit">Salvar</button>
          <button @click="deleteCurrentDiscipline" class="danger">Excluir</button>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ open: activityModalOpen }">
      <div class="modal-content">
        <button class="modal-close" @click="activityModalOpen = false">×</button>
        <h3>Adicionar Atividade</h3>
        <label>Tipo de Atividade</label>
        <select v-model="activityData.type">
          <option value="pibic">PIBIC</option>
          <option value="pibiti">PIBITI</option>
          <option value="estagio">Estágio</option>
          <option value="monitoria">Monitoria</option>
          <option value="outro">Outro...</option>
        </select>
        <div v-if="activityData.type === 'outro'">
          <label>Nome Personalizado</label>
          <input type="text" v-model="activityData.customName">
        </div>
        <label>Código de Horário</label>
        <input type="text" v-model="activityData.codigo" placeholder="Ex: 24T12">
        <div class="modal-buttons">
          <button @click="saveActivity">Salvar</button>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ open: exportModalOpen }">
      <div class="modal-content">
        <button class="modal-close" @click="exportModalOpen = false">×</button>
        <h3>Exportar Grade</h3>
        <div class="modal-buttons">
          <button @click="downloadJSON"><i class="fas fa-file-download"></i> Baixar Arquivo</button>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ open: importModalOpen }">
      <div class="modal-content">
        <button class="modal-close" @click="importModalOpen = false">×</button>
        <h3>Importar Grade</h3>
        <div class="import-options-buttons">
          <button @click="triggerFileInput"><i class="fas fa-file-upload"></i> Carregar Arquivo</button>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ open: maxModalOpen }">
      <div class="modal-content">
        <p>😟 Você já adicionou 6 disciplinas. Tem certeza que deseja adicionar mais?</p>
        <div class="modal-buttons">
          <button @click="confirmMax">Sim, adicionar</button>
          <button @click="maxModalOpen = false" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ open: confirmModalOpen }">
      <div class="modal-content">
        <p>{{ confirmMessage }}</p>
        <div class="modal-buttons">
          <button @click="confirmYes" class="danger">Sim</button>
          <button @click="confirmNo" class="btn-cancel">Não</button>
        </div>
      </div>
    </div>

    <div id="toastContainer" ref="toastContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGradeSimulator, dias, horarios } from '../composables/useGradeSimulator'

const router = useRouter()
const store = useGradeSimulator()
const { occupiedSlots, darkMode, toggleDarkMode: toggleDarkModeStore, load, addDiscipline, editDiscipline, deleteDiscipline, clearAll, importFromJSON, exportToJSON } = store

const sidebarOpen = ref(true)
const formData = ref({ nome: '', professor: '', codigo: '' })
const editModalOpen = ref(false)
const activityModalOpen = ref(false)
const exportModalOpen = ref(false)
const importModalOpen = ref(false)
const scanModalOpen = ref(false)
const maxModalOpen = ref(false)
const confirmModalOpen = ref(false)

const editData = ref({ nome: '', professor: '', codigo: '', isActivity: false })
const activityData = ref({ type: 'pibic', customName: '', codigo: '' })
const editModalTitle = ref('Editar Disciplina')
const editNameLabel = ref('Nome da Disciplina')
const currentEditKey = ref('')
const confirmMessage = ref('')
const confirmCallback = ref<(() => void) | null>(null)
const pendingAdd = ref<any>(null)

const timetableRef = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const toastContainer = ref<HTMLElement>()

onMounted(() => {
  load()
  adjustScale()
  window.addEventListener('resize', adjustScale)
  // Sync dark mode class on mount
  updateDarkModeClass()
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const updateDarkModeClass = () => {
  if (darkMode.value) {
    document.body.classList.remove('light-mode')
  } else {
    document.body.classList.add('light-mode')
  }
}

const toggleDarkMode = () => {
  toggleDarkModeStore()
  updateDarkModeClass()
}

const abbrev = (str: string, max: number) => {
  return str.length > max ? str.slice(0, max) + '…' : str
}

const getCellClass = (col: number, row: number) => {
  const key = `${col}-${row}`
  const slot = occupiedSlots.value[key]
  if (!slot) return ''
  
  const classes = ['occupied']
  if (slot.isActivity && slot.type) {
    classes.push(slot.type)
  }
  return classes.join(' ')
}

const addDisciplineClick = () => {
  const { nome, professor, codigo } = formData.value
  if (!nome || !professor || !codigo) {
    showToast('Preencha todos os campos.', 'error')
    return
  }

  const result = addDiscipline(nome, professor, codigo, false, null)
  if (result.success) {
    formData.value = { nome: '', professor: '', codigo: '' }
    showToast('Disciplina adicionada!', 'success')
    adjustScale()
  } else {
    showToast(result.error!, 'error')
  }
}

const confirmMax = () => {
  maxModalOpen.value = false
}

const saveActivity = () => {
  const { type, customName, codigo } = activityData.value
  let name = type === 'outro' ? customName : type.toUpperCase()

  if (!name || !codigo) {
    showToast('Preencha todos os campos.', 'error')
    return
  }

  const result = addDiscipline(name, 'Atividade', codigo, true, type)
  if (result.success) {
    activityModalOpen.value = false
    showToast('Atividade adicionada!', 'success')
    adjustScale()
  } else {
    showToast(result.error!, 'error')
  }
}

const openEditModal = (key: string) => {
  const slot = occupiedSlots.value[key]
  if (!slot) return

  currentEditKey.value = key
  editData.value = {
    nome: slot.disciplina,
    professor: slot.professor,
    codigo: slot.codigoHorario,
    isActivity: slot.isActivity
  }

  editModalTitle.value = slot.isActivity ? 'Editar Atividade' : 'Editar Disciplina'
  editNameLabel.value = slot.isActivity ? 'Nome da Atividade' : 'Nome da Disciplina'
  editModalOpen.value = true
}

const saveEdit = () => {
  const { nome, professor, codigo } = editData.value
  const result = editDiscipline(currentEditKey.value, nome, professor, codigo)
  if (result.success) {
    editModalOpen.value = false
    showToast('Atualizado!', 'success')
  } else {
    showToast(result.error!, 'error')
  }
}

const deleteCurrentDiscipline = () => {
  deleteDiscipline(currentEditKey.value)
  editModalOpen.value = false
  showToast('Excluído!', 'info')
}

const clearAllClick = () => {
  showConfirm('Deseja limpar tudo?', () => {
    clearAll()
    showToast('Limpo!', 'info')
  })
}

const saveAsImage = async () => {
  if (!timetableRef.value) return
  
  try {
    // @ts-ignore
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(timetableRef.value, {
      backgroundColor: darkMode.value ? '#1c1c28' : '#f5f5f5'
    })
    
    const link = document.createElement('a')
    link.download = 'grade.png'
    link.href = canvas.toDataURL()
    link.click()
  } catch (e) {
    showToast('Erro ao salvar imagem', 'error')
  }
}

const openExportModal = () => {
  exportModalOpen.value = true
}

const closeExportModal = () => {
  exportModalOpen.value = false
}

const downloadJSON = () => {
  const dataStr = exportToJSON()
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  const link = document.createElement('a')
  link.setAttribute('href', dataUri)
  link.setAttribute('download', 'grade.json')
  link.click()
  closeExportModal()
}

const triggerFileInput = () => {
  importModalOpen.value = false
  fileInput.value?.click()
}

const importFromFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      importFromJSON(data)
      showToast('Importado!', 'success')
    } catch (error) {
      showToast('Arquivo inválido', 'error')
    }
  }
  reader.readAsText(file)
}

const adjustScale = () => {
  nextTick(() => {
    const container = document.querySelector('.timetable-container') as HTMLElement
    const table = timetableRef.value
    if (!container || !table) return

    const scale = Math.min(1, container.clientWidth / table.scrollWidth)
    table.style.transform = `scale(${scale})`
  })
}

const showToast = (message: string, type: 'info' | 'success' | 'error') => {
  if (!toastContainer.value) return
  
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.textContent = message
  toastContainer.value.appendChild(toast)
  
  setTimeout(() => toast.remove(), 3000)
}

const showConfirm = (message: string, callback: () => void) => {
  confirmMessage.value = message
  confirmCallback.value = callback
  confirmModalOpen.value = true
}

const confirmYes = () => {
  if (confirmCallback.value) confirmCallback.value()
  confirmModalOpen.value = false
}

const confirmNo = () => {
  confirmModalOpen.value = false
}
</script>

<style scoped>
.close-button {
  display: none;
}

@media (max-width: 768px) {
  .close-button {
    display: block;
  }
}
</style>
