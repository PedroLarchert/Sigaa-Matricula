import { ref } from 'vue'

export interface Discipline {
  disciplina: string
  professor: string
  codigoHorario: string
  isActivity: boolean
  type: string | null
}

export interface OccupiedSlot {
  [key: string]: Discipline
}

export interface ParseResult {
  success?: boolean
  error?: string
  slots?: string[]
}

export const dias = [null, 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const
export const horarios = [
  '07:30 - 08:15', '08:15 - 09:00', '09:15 - 10:00', '10:00 - 10:45',
  '11:00 - 11:45', '11:45 - 12:30', '13:30 - 14:15', '14:15 - 15:00',
  '15:15 - 16:00', '16:00 - 16:45', '17:00 - 17:45', '17:45 - 18:30',
  '19:00 - 19:45', '19:45 - 20:30', '20:45 - 21:30', '21:30 - 22:15'
] as const

export function useGradeSimulator() {
  const occupiedSlots = ref<OccupiedSlot>({})
  const darkMode = ref(true)
  const currentEditKey = ref<string | null>(null)

  const persist = () => {
    localStorage.setItem('occupiedSlots', JSON.stringify(occupiedSlots.value))
    localStorage.setItem('darkMode', JSON.stringify(darkMode.value))
  }

  const load = () => {
    const stored = localStorage.getItem('occupiedSlots')
    if (stored) {
      occupiedSlots.value = JSON.parse(stored)
    }
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      darkMode.value = JSON.parse(savedDarkMode)
    }
  }

  const parseAndValidateCode = (cod: string, slotsToIgnore: string[] = [], isActivity = false): ParseResult => {
    const parts = cod.split(/\s+/)
    const resultSlots: string[] = []
    
    for (const part of parts) {
      const match = part.match(/^([2-7]+)([MTN])([0-9]+)$/)
      if (!match) return { error: `Código inválido: "${part}".` }
      
      const [, diasCod, periodo, hrsCod] = match
      const offset = { M: 0, T: 6, N: 12 }[periodo as 'M' | 'T' | 'N']
      
      for (const dia of diasCod.split('')) {
        const col = parseInt(dia, 10) - 2
        for (const hora of hrsCod.split('')) {
          const horaNum = parseInt(hora, 10)
          
          if (isActivity) {
            let finalOffset = offset
            let finalHoraNum = horaNum
            if (periodo === 'M' && finalHoraNum > 6) {
              finalOffset = 6
              finalHoraNum -= 6
            }
            if (periodo === 'T' && finalHoraNum > 6) {
              finalOffset = 12
              finalHoraNum -= 6
            }
            const finalPeriodLimits: Record<number, number> = { 0: 6, 6: 6, 12: 4 }
            if (finalHoraNum <= 0 || finalHoraNum > finalPeriodLimits[finalOffset]) {
              return { error: `Horário '${hora}' inválido para a atividade. Excede o limite do dia.` }
            }
            const row = finalOffset + finalHoraNum - 1
            const key = `${col}-${row}`
            if (occupiedSlots.value[key] && !slotsToIgnore.includes(key)) return { error: 'Conflito de horário detectado!' }
            resultSlots.push(key)
          } else {
            const limits: Record<string, number> = { M: 6, T: 6, N: 4 }
            if (horaNum <= 0 || horaNum > limits[periodo]) {
              return { error: `Horário '${hora}' inválido para o período '${periodo}'. Válidos: 1-${limits[periodo]}` }
            }
            const row = offset + horaNum - 1
            const key = `${col}-${row}`
            if (occupiedSlots.value[key] && !slotsToIgnore.includes(key)) return { error: 'Conflito de horário detectado!' }
            resultSlots.push(key)
          }
        }
      }
    }
    return { success: true, slots: resultSlots }
  }

  const addDiscipline = (nome: string, prof: string, cod: string, isActivity = false, type: string | null = null): ParseResult => {
    const validation = parseAndValidateCode(cod, [], isActivity)
    if (validation.error) {
      return { error: validation.error }
    }
    
    validation.slots!.forEach(key => {
      occupiedSlots.value[key] = {
        disciplina: nome,
        professor: prof,
        codigoHorario: cod,
        isActivity: isActivity,
        type: type
      }
    })
    persist()
    return { success: true }
  }

  const editDiscipline = (originalKey: string, newName: string, newProf: string, newCode: string): ParseResult => {
    const originalSlot = occupiedSlots.value[originalKey]
    if (!originalSlot) return { error: 'Disciplina não encontrada' }

    const oldSlotsKeys = Object.keys(occupiedSlots.value).filter(k => 
      occupiedSlots.value[k].disciplina === originalSlot.disciplina && 
      occupiedSlots.value[k].professor === originalSlot.professor
    )

    const validation = parseAndValidateCode(newCode, oldSlotsKeys, originalSlot.isActivity)
    if (validation.error) {
      return { error: validation.error }
    }

    oldSlotsKeys.forEach(k => delete occupiedSlots.value[k])
    validation.slots!.forEach(key => {
      occupiedSlots.value[key] = {
        disciplina: newName,
        professor: newProf,
        codigoHorario: newCode,
        isActivity: originalSlot.isActivity,
        type: originalSlot.type
      }
    })
    persist()
    return { success: true }
  }

  const deleteDiscipline = (key: string) => {
    const slotToDelete = occupiedSlots.value[key]
    if (!slotToDelete) return

    Object.keys(occupiedSlots.value).forEach(k => {
      const s = occupiedSlots.value[k]
      if (s.disciplina === slotToDelete.disciplina && s.professor === slotToDelete.professor) {
        delete occupiedSlots.value[k]
      }
    })
    persist()
  }

  const clearAll = () => {
    occupiedSlots.value = {}
    localStorage.removeItem('occupiedSlots')
    localStorage.removeItem('skipMax6Warning')
    persist()
  }

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    persist()
  }

  const importFromJSON = (data: OccupiedSlot) => {
    occupiedSlots.value = data
    persist()
  }

  const exportToJSON = () => {
    return JSON.stringify(occupiedSlots.value)
  }

  return {
    occupiedSlots,
    darkMode,
    currentEditKey,
    persist,
    load,
    addDiscipline,
    editDiscipline,
    deleteDiscipline,
    clearAll,
    toggleDarkMode,
    parseAndValidateCode,
    importFromJSON,
    exportToJSON
  }
}
