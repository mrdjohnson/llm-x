import _ from 'lodash'
import { Instance, SnapshotIn, destroy, getSnapshot, types } from 'mobx-state-tree'
import { persist } from 'mst-persist'

export const FunctionParameterModel = types.model({
  description: types.optional(types.string, ''),
  type: types.union(
    types.literal('number'),
    types.literal('string'),
    types.literal('boolean'),
    types.literal('bigint'),
    types.literal('symbol'),
    types.literal('object'),
    types.undefined,
  ),
  required: types.optional(types.boolean, false),
})

export interface IFunctionParameterModel extends Instance<typeof FunctionParameterModel> {}

export const CustomFunctionModel = types
  .model({
    id: types.identifierNumber,
    name: types.string,
    description: types.optional(types.string, ''),
    parameters: types.map(FunctionParameterModel),
    enabled: types.optional(types.boolean, true),
    requiredPhrases: types.array(types.string),
    code: types.optional(types.string, ''),
  })
  .views(self => ({
    get hasUnnamedCustomParameter() {
      return !!self.parameters.get('newParam')
    },
  }))
  .actions(self => ({
    addParameter(name: string, parameter: SnapshotIn<IFunctionParameterModel>) {
      self.parameters.set(name, { ...parameter })
    },

    deleteParameter(parameter: IFunctionParameterModel) {
      destroy(parameter)
    },

    editParameter(
      parameter: IFunctionParameterModel,
      nextName: string,
      oldName: string,
      values: IFunctionParameterModel,
    ) {
      if (nextName !== oldName) {
        this.deleteParameter(parameter)
        this.addParameter(nextName, values)

        return
      }

      _.merge(parameter, values)

      parameter.type = values.type
    },
  }))

export interface ICustomFunctionModel extends Instance<typeof CustomFunctionModel> {}

const CustomFunctionStore = types
  .model({
    customFunctions: types.array(CustomFunctionModel),
    selectedCustomFunction: types.safeReference(CustomFunctionModel),
    customFunctionToEdit: types.safeReference(CustomFunctionModel),
  })
  .views(self => ({
    get hasUnnamedCustomFunction() {
      return !!_.find(self.customFunctions, { name: 'newFunction' })
    },
  }))
  .actions(self => {
    return {
      createCustomFunction(parameters: Omit<SnapshotIn<ICustomFunctionModel>, 'id' | 'name'>) {
        const customFunction = CustomFunctionModel.create({
          name: 'newFunction',
          ...parameters,
          id: Date.now(),
        })

        self.customFunctions.push(customFunction)

        return customFunction
      },

      deleteCustomFunction(customFunction?: ICustomFunctionModel) {
        if (customFunction === self.selectedCustomFunction) {
          this.setSelectedCustomFunction(self.customFunctions[0])
        }

        destroy(customFunction)
      },

      duplicateCustomFunction(customFunction: ICustomFunctionModel) {
        const duplicateCustomFunction = this.createCustomFunction(getSnapshot(customFunction))

        self.customFunctionToEdit = duplicateCustomFunction
      },

      setSelectedCustomFunction(customFunction?: ICustomFunctionModel) {
        self.selectedCustomFunction = customFunction
      },

      setCustomFunctionToEdit(customFunction?: ICustomFunctionModel) {
        self.customFunctionToEdit = customFunction
      },

      editCustomFunction(
        customFunction: ICustomFunctionModel,
        values: Partial<SnapshotIn<ICustomFunctionModel>>,
      ) {
        _.merge(customFunction, values)

        self.customFunctionToEdit = undefined
      },
    }
  })

export const customFunctionStore = CustomFunctionStore.create()

persist('customFunctionStore', customFunctionStore).then(() => {
  console.log('updated customFunction store')

  if (!customFunctionStore.selectedCustomFunction) {
    customFunctionStore.setSelectedCustomFunction(customFunctionStore.customFunctions[0])
  }
})
