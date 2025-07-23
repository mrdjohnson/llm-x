import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import _ from 'lodash'

import { MessageModelFactory } from '~/core/message/MessageModel.factory'
import { MessageViewModel } from '~/core/message/MessageViewModel'
import { MessageModel } from '~/core/message/MessageModel'
import { ChatModelFactory } from '~/core/chat/ChatModel.factory'
import { messageTable } from '~/core/message/MessageTable'

import * as FormatMessageDetailsFile from '~/utils/formatMessageDetails'

describe('MessageViewModel', () => {
  let viewModel: MessageViewModel
  let messageModel: MessageModel

  const resetViewModel = async () => {
    const chat = await ChatModelFactory.create()

    viewModel = await chat.createAndPushIncomingMessage()
    messageModel = (await messageTable.findById(viewModel.id))!
  }

  beforeEach(async () => {
    vi.useFakeTimers()

    await resetViewModel()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('constructs with a MessageModel and exposes properties', () => {
    expect(viewModel.content).toBe('')
    expect(viewModel.variations).toEqual([])
    expect(viewModel.selectedVariation).toBe(viewModel)
    expect(viewModel.rootMessage).toBe(viewModel)
  })

  test('setShowVariations updates showVariations', () => {
    viewModel.setShowVariations(true)
    expect(viewModel.showVariations).toBe(true)
  })

  test('updateContent appends and updates content', async () => {
    viewModel.updateContent('Hello')
    viewModel.updateContent(' world')

    expect(viewModel.content).toEqual('Hello world')

    // has not updated the db yet
    expect(messageModel?.content).toBe('')

    // fast forward time
    await vi.runAllTimersAsync()

    expect(messageModel?.content).toEqual('Hello world')
  })

  test('isBlank returns false for non-empty content or image urls', async () => {
    expect(viewModel.isBlank()).toBe(true)

    viewModel.updateContent('anything')

    // fast forward time
    await vi.runAllTimersAsync()

    expect(viewModel.isBlank()).toBe(false)

    await resetViewModel()

    await viewModel.addImages(['example image'])

    expect(viewModel.isBlank()).toBe(false)

    // TODO: fix isBlank for error messages
    // await resetViewModel()

    // await viewModel.setError(new Error('anything'))

    // expect(viewModel.isBlank()).toBe(false)
  })

  test('setError updates extras with error', async () => {
    await viewModel.setError(new Error('custom message'))
    expect(messageModel.extras?.error?.message).toBe('custom message')
  })

  test('setExtraDetails updates extras with details', async () => {
    vi.spyOn(FormatMessageDetailsFile, 'formatMessageDetails')

    await viewModel.setExtraDetails({ foo: 'bar' })

    expect(JSON.parse(messageModel.extras?.details || '')).toMatchObject({ foo: 'bar' })

    expect(FormatMessageDetailsFile.formatMessageDetails).toHaveBeenCalledWith({ foo: 'bar' })
  })

  test('addImages updates imageUrls with message based url', async () => {
    await viewModel.addImages(['example image'])

    expect(messageModel.imageUrls[0]?.startsWith(`/llm-x/message/${viewModel.id}/`)).toBe(true)
  })

  test('addVariation and removeVariation update variations', async () => {
    expect(viewModel.variations.length).toBe(0)

    const variation = MessageModelFactory.build({ content: 'Variation', fromBot: false })
    const variationViewModel = await viewModel.addVariation(variation)
    expect(viewModel.variations.map(v => v.id)).toContain(variation.id)
    await viewModel.removeVariation(variationViewModel)
    expect(viewModel.variations.map(v => v.id)).not.toContain(variation.id)
  })

  test('setVariation and selectNextVariation/PreviousVariation', async () => {
    const selectedVariationHandler = viewModel.selectedVariationHandler

    // helper for less repeated test code
    const expectVariationsToBe = (
      previous: MessageViewModel | undefined,
      current: MessageViewModel | undefined,
      next: MessageViewModel | undefined,
    ) => {
      expect(selectedVariationHandler.previousVariation).toBe(previous)
      expect(viewModel.selectedVariation).toBe(current)
      expect(selectedVariationHandler.nextVariation).toBe(next)
    }

    // prepare messages
    const variationModel1 = await MessageModelFactory.create()
    const variationModel2 = await MessageModelFactory.create()

    expectVariationsToBe(undefined, viewModel, undefined)

    // add a new variation
    const variation1 = await viewModel.addVariation(variationModel1)
    expectVariationsToBe(viewModel, variation1, undefined)

    // go back to original message
    await viewModel.selectPreviousVariation()
    expectVariationsToBe(undefined, viewModel, variation1)

    // add another variation
    const variation2 = await viewModel.addVariation(variationModel2)
    expectVariationsToBe(variation1, variation2, undefined)

    // go back to variation 1
    await viewModel.selectPreviousVariation()
    expectVariationsToBe(viewModel, variation1, variation2)

    // go back to original message
    await viewModel.selectPreviousVariation()
    expectVariationsToBe(undefined, viewModel, variation1)

    // sanity check
    expect(variation1).not.toBe(variation2)
  })
})
