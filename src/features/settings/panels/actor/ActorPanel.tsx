import { observer } from 'mobx-react-lite'
import { useMemo, MouseEvent } from 'react'
import _ from 'lodash'

import Delete from '~/icons/Delete'

import { IActorModel } from '~/models/actor/ActorModel'
import { actorStore } from '~/models/actor/ActorStore'
import ActorForm from '~/features/settings/panels/actor/ActorForm'

import SettingSection, { SettingSectionItem } from '~/containers/SettingSection'

const ActorPanel = observer(() => {
  const { actors } = actorStore

  const deleteActor = (e: MouseEvent<HTMLButtonElement>, actor: IActorModel) => {
    e.stopPropagation()

    actorStore.deleteActor(actor)
  }

  const actorToSectionItem = (actor: IActorModel): SettingSectionItem<IActorModel> => {
    const subLabels = []

    if (!_.isEmpty(actor.personas[0])) {
      subLabels.push(`Personas: ${_.map(actor.personas, 'name').join(', ')}`)
    }

    if (!_.isEmpty(actor.connections[0])) {
      subLabels.push(`Connections: ${_.map(actor.connections, 'label').join(', ')}`)
    }

    return {
      id: actor.id,
      label: actor.name,
      subLabels,
      data: actor,
    }
  }

  const items: Array<SettingSectionItem<IActorModel>> = useMemo(() => {
    return actors.map(actorToSectionItem)
  }, [actors])

  const itemFilter = (actor: IActorModel, filterText: string) => {
    return actor.name.toLowerCase().includes(filterText)
  }

  return (
    <SettingSection
      items={items}
      filterProps={{
        helpText: 'Filter actors by name...',
        itemFilter,
        emptyLabel: 'No actors found',
      }}
      addButtonProps={{
        label: 'Add New Actor',
        onClick: () => actorStore.createActor(),
      }}
      renderItemSection={actor => <ActorForm actor={actor} />}
      renderActionRow={actor => (
        <>
          <button
            type="button"
            className=" rounded-md text-error opacity-30 hover:scale-125 hover:opacity-90"
            onClick={e => deleteActor(e, actor)}
          >
            <Delete />
          </button>
        </>
      )}
    />
  )
})

export default ActorPanel
