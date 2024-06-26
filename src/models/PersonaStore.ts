import _ from 'lodash'
import { Instance, cast, destroy, types } from 'mobx-state-tree'
import { persist } from 'mst-persist'

export const PersonaModel = types.model({
  id: types.identifierNumber,
  name: types.string,
  description: types.string,
})

export interface IPersonaModel extends Instance<typeof PersonaModel> {}

const PersonaStore = types
  .model({
    personas: types.array(PersonaModel),
    selectedPersona: types.safeReference(PersonaModel),
    personaToEdit: types.safeReference(PersonaModel),
  })
  .actions(self => {
    return {
      afterCreate() {
        self.personaToEdit = undefined
      },

      createPersona(name: string, description: string) {
        const persona = PersonaModel.create({ id: Date.now(), name, description })
        self.personas.push(persona)
        self.selectedPersona = persona
      },

      deletePersona(persona: IPersonaModel) {
        destroy(persona)
      },

      duplicatePersona(persona: IPersonaModel) {
        const personaToDuplicateIndex = _.indexOf(self.personas, persona)

        const prePersonas = self.personas.slice(0, personaToDuplicateIndex + 1)
        const postPersonas = self.personas.slice(personaToDuplicateIndex + 1)

        const duplicatePersona = PersonaModel.create({
          ...persona,
          name: persona.name + ' Copy',
          id: Date.now(),
        })

        self.personas = cast([...prePersonas, duplicatePersona, ...postPersonas])
        self.selectedPersona = duplicatePersona
        self.personaToEdit = duplicatePersona
      },

      setSelectedPersona(persona?: IPersonaModel) {
        self.selectedPersona = persona
      },

      setPersonaToEdit(persona?: IPersonaModel) {
        self.personaToEdit = persona
      },

      editPersona(name: string, description: string) {
        const personaToEdit = self.personaToEdit
        if (!personaToEdit) return

        personaToEdit.name = name
        personaToEdit.description = description

        self.personaToEdit = undefined
      },
    }
  })

export const personaStore = PersonaStore.create()

persist('personas', personaStore).then(() => {
  console.log('updated persona store')

  personaStore.setPersonaToEdit(undefined)
})
