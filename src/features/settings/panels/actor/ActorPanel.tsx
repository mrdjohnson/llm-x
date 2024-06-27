import { observer } from 'mobx-react-lite'
import { useCallback, useMemo, useState, MouseEvent } from 'react'
import { Input, ScrollShadow } from '@nextui-org/react'
import { SnapshotIn } from 'mobx-state-tree'
import _ from 'lodash'

import Back from '~/icons/Back'
import Delete from '~/icons/Delete'

import { IActorModel } from '~/models/actor/ActorModel'
import { actorStore } from '~/models/actor/ActorStore'
import ActorForm from '~/features/settings/panels/actor/ActorForm'

export type ActorFormDataType = SnapshotIn<IActorModel>

const ActorPanel = observer(() => {
  const { actors, actorToEdit } = actorStore

  const [filterText, setFilterText] = useState('')

  const filteredActors = useMemo(() => {
    const lowerCaseFilter = filterText.toLowerCase()

    return actors.filter(actor => actor.name.toLowerCase().includes(lowerCaseFilter))
  }, [[...actors], filterText])

  const addActor = () => {
    actorStore.createActor()
  }

  const deleteActor = (e: MouseEvent<HTMLButtonElement>, actor: IActorModel) => {
    e.stopPropagation()

    actorStore.deleteActor(actor)
  }

  const Form = useCallback(() => {
    return actorToEdit && <ActorForm actor={actorToEdit} key={actorToEdit.id} />
  }, [actorToEdit])

  return (
    <div className="flex h-full max-h-full w-full flex-col rounded-md">
      <div className="flex w-full flex-row gap-2 py-2 pb-4 align-middle">
        {actorToEdit && (
          <button type="button" onClick={() => actorStore.setActorToEdit(undefined)}>
            <Back />
          </button>
        )}

        <span className="content-center">Actors:</span>
        <Input
          type="text"
          variant="underlined"
          value={filterText}
          placeholder="Filter actors by name..."
          classNames={{
            input: '!text-base-content',
            innerWrapper: 'pb-0',
            inputWrapper: '!bg-base-transparent border-base-content/30',
          }}
          onChange={e => setFilterText(e.target.value)}
        />
      </div>

      <div className={'flex flex-1 flex-row gap-2 overflow-hidden'}>
        <ScrollShadow className={'flex flex-shrink max-h-full ' + (actorToEdit ? ' w-fit' : ' w-full')}>
          <ul className={'menu rounded-box p-0 pt-1 ' + (actorToEdit ? 'w-fit' : 'w-full')}>
            {filteredActors.map(actor => (
              <li
                key={actor.id}
                onClick={() => actorStore.setActorToEdit(actor)}
                className={
                  'rounded-md ' +
                  (actor.id === actorToEdit?.id ? 'bg-base-content/10' : 'bg-base-300')
                }
              >
                {actorToEdit ? (
                  <span className="max-w-[15ch] justify-center">{actor.name}</span>
                ) : (
                  <div className="flex flex-col px-2 *:text-left gap-0">
                    <div className="flex w-full flex-row self-start text-left">
                      <span className="mr-3 content-center">{actor.name}</span>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm ml-auto justify-start pl-3 text-error"
                        onClick={e => deleteActor(e, actor)}
                      >
                        <Delete />
                      </button>
                    </div>

                    {actor.description && (
                      <p className="line-clamp-2 self-start text-base-content/45 text-sm">
                        {actor.description}
                      </p>
                    )}

                    {actor.personas[0] && (
                      <p className="line-clamp-2 self-start text-base-content/45 text-sm">
                        Personas: {_.map(actor.personas, 'name').join(', ')}
                      </p>
                    )}

                    {actor.connections[0] && (
                      <p className="line-clamp-2 self-start text-base-content/45 text-sm">
                        Connections: {_.map(actor.connections, 'label').join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}

            {!filteredActors[0] && (
              <span className="pt-6 text-center font-semibold text-base-content/30">
                {actors[0] ? 'No actors names with this filter' : 'No actors added'}
              </span>
            )}

            <li className="mt-auto pt-4">
              <button
                type="button"
                className="btn btn-primary btn-sm mb-1 whitespace-nowrap"
                onClick={addActor}
              >
                Add New Actor
              </button>
            </li>
          </ul>
        </ScrollShadow>

        <Form />
      </div>
    </div>
  )
})

export default ActorPanel
