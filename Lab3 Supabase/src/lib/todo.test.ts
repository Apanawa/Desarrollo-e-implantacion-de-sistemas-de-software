import { describe, expect, it } from 'vitest'
import { normalizeTodo } from './todo'

describe('normalizeTodo', () => {
  it('recorta los textos y conserva la prioridad', () => {
    expect(normalizeTodo({ title: '  Entregar lab  ', description: '  Revisar código  ', priority: 'high' })).toEqual({
      title: 'Entregar lab',
      description: 'Revisar código',
      priority: 'high',
    })
  })

  it('rechaza títulos vacíos o demasiado largos', () => {
    expect(() => normalizeTodo({ title: ' ', description: '', priority: 'low' })).toThrow(/título/)
    expect(() => normalizeTodo({ title: 'a'.repeat(121), description: '', priority: 'low' })).toThrow(/título/)
  })

  it('rechaza descripciones largas y prioridades desconocidas', () => {
    expect(() => normalizeTodo({ title: 'Tarea', description: 'a'.repeat(501), priority: 'medium' })).toThrow(/descripción/)
    expect(() => normalizeTodo({ title: 'Tarea', description: '', priority: 'urgent' as 'high' })).toThrow(/prioridad/)
  })
})
