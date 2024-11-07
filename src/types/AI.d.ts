// ai namespace for TypeScript : Mostly generated through chatgpt ironically

// Types
type AICapabilityAvailability = 'readily' | 'after-download' | 'no'

type AILanguageModelPromptRole = 'system' | 'user' | 'assistant'

// Interfaces

interface AICreateMonitor extends EventTarget {
  ondownloadprogress: Event
}

type AICreateMonitorCallback = (monitor: AICreateMonitor) => void

interface AILanguageModelFactory {
  create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>
  capabilities(): Promise<AILanguageModelCapabilities>
}

interface AILanguageModel extends EventTarget {
  prompt(input: string, options?: AILanguageModelPromptOptions): Promise<string>
  promptStreaming(input: string, options?: AILanguageModelPromptOptions): IterableReadableStream
  countPromptTokens(input: string, options?: AILanguageModelPromptOptions): Promise<number>

  readonly maxTokens: number
  readonly tokensSoFar: number
  readonly tokensLeft: number
  readonly topK: number
  readonly temperature: number

  clone(): Promise<AILanguageModel>
  destroy(): void
}

interface AILanguageModelCapabilities {
  readonly available: AICapabilityAvailability
  readonly defaultTopK?: number | null
  readonly maxTopK?: number | null
  readonly defaultTemperature?: number | null
}

// Dictionaries (Converted to TypeScript interfaces)

interface AILanguageModelCreateOptions {
  signal?: AbortSignal
  monitor?: AICreateMonitorCallback
  systemPrompt?: string
  initialPrompts?: AILanguageModelPrompt[]
  topK?: number
  temperature?: number
}

interface AILanguageModelPrompt {
  role: AILanguageModelPromptRole
  content: string
}

interface AILanguageModelPromptOptions {
  signal?: AbortSignal
}

// AI main interface

interface AI {
  readonly languageModel: AILanguageModelFactory
}

// Global scope augmentation for Window and Worker

interface Window {
  readonly ai: AI
}

interface WorkerGlobalScope {
  readonly ai: AI
}
