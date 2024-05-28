import { lazy } from 'react'
import { SnapshotIn } from 'mobx-state-tree'
import { SortType as SelectionPanelSortType } from '~/components/SelectionTablePanel'
import camelcaseKeys from 'camelcase-keys'
import { IObservableArray, makeObservable, observable } from 'mobx'
import axios from 'axios'

import ServerConnection, {
  ServerConnectionMobxMappings,
} from '~/features/connections/servers/ServerConnection'
import a1111Api from '~/features/connections/api/A1111Api'

import LanguageModel, { LanguageModelType } from '~/models/LanguageModel'
import { A1111LanguageModel, IA1111Model, IConnectionDataModel } from '~/models/types'

const LazyA1111ModelPanel = lazy(() => import('~/features/settings/panels/model/A1111ModelPanel'))

const DefaultHost = 'http://127.0.0.1:7860'

class A1111ServerConnection extends ServerConnection<IA1111Model> {
  DefaultHost: string = DefaultHost

  api = a1111Api
  ModelPanel = LazyA1111ModelPanel

  modelTableHeaders: SelectionPanelSortType<LanguageModelType<IA1111Model>>[] = [
    { label: 'Title', value: 'title' },
    { label: 'Name', value: 'modelName' },
  ]

  models: IObservableArray<A1111LanguageModel> = observable.array()

  type = 'A1111' as const

  constructor(public connectionModel: IConnectionDataModel) {
    super(connectionModel)

    makeObservable(this, ServerConnectionMobxMappings)
  }

  readonly hostLabel = 'AUTOMATIC1111 Host:'
  readonly enabledLabel = 'Image generation through AUTOMATIC1111:'

  static getSnapshot = (): SnapshotIn<IConnectionDataModel> => ({
    label: 'A1111',
    type: 'A1111',

    host: DefaultHost,
    enabled: true,

    parameters: [
      { field: 'width', types: ['system'], isJson: true, defaultValue: '512' },
      { field: 'height', types: ['system'], isJson: true, defaultValue: '512' },
      { field: 'steps', types: ['system'], isJson: true, defaultValue: '25' },
      {
        field: 'batch_size',
        label: 'batch size',
        types: ['system'],
        isJson: true,
        defaultValue: '1',
      },
    ],
  })

  async _fetchLmModels(host: string): Promise<A1111LanguageModel[]> {
    const response = await axios.get(`${host}/sdapi/v1/sd-models`)

    return camelcaseKeys<IA1111Model[]>(response.data).map(LanguageModel.fromIA1111Model)
  }
}

export default A1111ServerConnection
