## Platform-Specific Code Splitting Guide

This document explains how to manage and organize platform-specific code (PWA, Chrome Extension) in our codebase using the `*.platform` convention and the custom `vite-plugin-platform-resolver`.

The goal is to make platform specific code super easy to write as we prepare for new platform addons (also it was fun to learn).

---

### When to Create a Separate Platform File

- **Multiple divergent implementations**: If a component or module contains more than one or two significant platform-specific functions or logic, extract it into its own file:

> Put the platform overrides alongside the `.platform` file.

DO: ✅

```ts
// ~/example/PlatformBridge.pwa.ts
export default class PlatformBridge {
  /* PWA logic */
}

// ~/example/PlatformBridge.ext.ts
export default class PlatformBridge {
  /* Chrome extension logic */
}

// ~/example/PlatformBridge.platform.ts (fallback)
export default class PlatformBridge {
  /* generic or shared logic */
}
```

> Do not forget the `.platform` file, the plugin will not look for `.pwa` if there is not a reason to

DO NOT: ❌

```ts
// ~/example/PlatformBridge.pwa.ts
export default class PlatformBridge {
  /* PWA logic */
}

// ~/example/PlatformBridge.ext.ts
export default class PlatformBridge {
  /* Chrome extension logic */
}

// missing .platform File or platform file in another directory
```

- **Large platform-specific utility**: If a helper or service has platform-only dependencies (e.g., `ipcRenderer`, `chrome.runtime`, or `Comlink`), keep it isolated in its own file to avoid bundling unused code into other targets.

### When _Not_ to Split into a Platform File

- **Single small conditional**: If a file only needs one simple `if (platform === 'electron')` check around a trivial line of code, it’s better to keep it inline to reduce fragmentation.

```ts
// Good: inline conditional
if (platform === 'electron') {
  await ipcRenderer.invoke('do-thing')
} else {
  await broadcastChannel.postMessage('do-thing')
}
```

- **Shared logic with one exception**: If 95% of the code is identical and only a tiny piece differs, consider extracting just that small piece into a helper function rather than splitting the entire file.

### How the Resolver Works

- **Import Pattern**: Use `import Foo from '~/Foo.platform'` in your code.
- **Resolution**: At build time, `vite-plugin-platform-resolver` will look in the same directory for `Foo.<platform>.*`. If found, it uses that file; otherwise it falls back to `Foo.platform.*`.
- **Supported Extensions**: This works for any file type as long as it has `.platform` and its in the `src/` directory (ie the import path starts with `~/`)

### Examples

1. **Full split** (complex logic):

   ```ts
   import PlatformBridge from './PlatformBridge.platform'
   // resolves to PlatformBridge.electron.ts or fallback
   ```

2. **Inline conditional** (simple):

   ```ts
   import { platform } from './env'

   function logEvent(event: string) {
     if (platform === 'pwa') {
       console.log('client side code')
     } else {
       console.log('server side code')
     }
   }
   ```

---

This is meant to be living documentation of llm-x. If you find these examples outdate, incorrect, or confusing please submit a PR to keep this alive!
