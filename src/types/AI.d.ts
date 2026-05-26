/**
 * TypeScript definitions for the proposed Web Prompt API.
 * Based on: https://github.com/webmachinelearning/prompt-api
 */

declare namespace AI {
  type Role = 'system' | 'user' | 'assistant'

  interface LanguageModelMessage {
    role: Role
    content: string | MultiModalContent[]
    /** * Used to "prefill" an assistant response to guide formatting.
     * Only valid for the trailing "assistant" message.
     */
    prefix?: boolean
  }

  interface MultiModalContent {
    type: 'text' | 'image' | 'audio'
    value?: string
    /** For images/audio, content can be Blob, ImageBitmap, etc. */
    content?: unknown
  }

  interface ExpectedInputOutput {
    type: 'text' | 'image' | 'audio' | 'tool-call' | 'tool-response'
    languages?: string[]
  }

  interface AICreateMonitor extends EventTarget {
    addEventListener(
      type: 'downloadprogress',
      listener: (this: AICreateMonitor, ev: ProgressEvent) => void,
    ): void
  }

  interface LanguageModelCreateOptions {
    signal?: AbortSignal
    monitor?: (m: AICreateMonitor) => void
    initialPrompts?: LanguageModelMessage[]
    expectedInputs?: ExpectedInputOutput[]
    expectedOutputs?: ExpectedInputOutput[]
    temperature?: number
    topK?: number
    tools?: Tool[]
  }

  interface Tool {
    name: string
    description: string
    inputSchema: object
    /** execute takes arguments derived from the inputSchema */
    execute: (args: unknown) => Promise<string>
  }

  interface PromptOptions {
    signal?: AbortSignal
    responseConstraint?: object | RegExp
    omitResponseConstraintInput?: boolean
  }

  /**
   * To support 'for await...of' as seen in the explainer examples,
   * we extend the standard ReadableStream.
   */
  interface LanguageModelResponseStream extends ReadableStream<string> {
    [Symbol.asyncIterator](): AsyncIterableIterator<string>
  }

  type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available'

  interface LanguageModel extends EventTarget {
    readonly contextUsage: number
    readonly contextWindow: number
    readonly temperature: number
    readonly topK: number

    prompt(input: string | LanguageModelMessage[], options?: PromptOptions): Promise<string>

    promptStreaming(
      input: string | LanguageModelMessage[],
      options?: PromptOptions,
    ): LanguageModelResponseStream

    append(input: LanguageModelMessage[], options?: { signal?: AbortSignal }): Promise<void>

    clone(options?: { signal?: AbortSignal }): Promise<LanguageModel>

    measureContextUsage(
      input: string | LanguageModelMessage[],
      options?: { signal?: AbortSignal },
    ): Promise<number>

    destroy(): void

    oncontextoverflow: ((this: LanguageModel, ev: Event) => void) | null
  }
}

interface LanguageModelStatic {
  create(options?: AI.LanguageModelCreateOptions): Promise<AI.LanguageModel>
  availability(options?: { expectedInputs?: AI.ExpectedInputOutput[] }): Promise<AI.Availability>
  params?: () => Promise<{
    defaultTemperature: number
    maxTemperature: number
    defaultTopK: number
    maxTopK: number
  } | null>
}

// Global scope augmentation for Window and Worker

interface Window {
  LanguageModel: LanguageModelStatic
}

interface WorkerGlobalScope {
  LanguageModel: LanguageModelStatic
}
