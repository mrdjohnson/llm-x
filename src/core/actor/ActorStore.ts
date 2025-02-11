import _ from 'lodash'
import { makeAutoObservable } from 'mobx'

import EntityCache from '~/utils/EntityCache'

import { ActorModel } from '~/core/actor/ActorModel'
import { ActorViewModel } from '~/core/actor/ActorViewModel'
import { actorTable } from '~/core/actor/ActorTable'
import { chatStore } from '~/core/chat/ChatStore'
import { settingStore } from '~/core/setting/SettingStore'

class ActorStore {
  actorViewModelCache = new EntityCache<ActorModel, ActorViewModel>({
    transform: actor => new ActorViewModel(actor),
    schema: ActorModel,
  })

  constructor() {
    makeAutoObservable(this)
  }

  get actors() {
    return actorTable.cache.allValues().map(actor => this.actorViewModelCache.getOrPut(actor))
  }

  get publicActors() {
    return _.filter(this.actors, actor => !actor.source.chatId)
  }

  get systemActor() {
    const id = '__system'
    const setting = settingStore.setting

    const actorModel = actorTable.parse({
      connectionId: setting.selectedConnectionId,
      modelId: setting.selectedModelId,
    })

    return new ActorViewModel({ ...actorModel, id })
  }

  get knowledgeActor() {
    return this.getActorById('knowledge')!
  }

  getActorById = (actorId: string) => {
    const actor = actorTable.findCachedById(actorId)

    if (actor) {
      return this.actorViewModelCache.getOrPut(actor)
    }

    return undefined
  }

  async createActor(input: Partial<ActorModel>) {
    const actor = await actorTable.create(input)

    return this.actorViewModelCache.put(actor)
  }

  async duplicateActor(actor: ActorViewModel) {
    const duplicate = await actorTable.duplicate(actor.source)

    return this.actorViewModelCache.put(duplicate)
  }

  async updateActor(patch: ActorModel) {
    await actorTable.put(patch)
  }

  async destroyActor(actor: ActorViewModel, { skipChatCheck = false } = {}) {
    if (actor === this.knowledgeActor) {
      return this.updateActor({ ...this.knowledgeActor.source, connectionId: null, modelId: null })
    }

    if (!skipChatCheck) {
      if (actor.source.chatId) {
        const chat = chatStore.getChatById(actor.source.chatId)

        if (chat) {
          await chat.removeActorById(actor.id)
        }
      } else {
        // remove actor from any chats
        for (const chat of chatStore.chats) {
          chat.removeActorById(actor.id)
        }
      }
    }

    await actorTable.destroy(actor.source)
  }
}

export const actorStore = new ActorStore()
