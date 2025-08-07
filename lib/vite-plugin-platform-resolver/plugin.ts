import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

export default function platformResolver(platform: string): Plugin {
  return {
    name: 'vite-plugin-platform-resolver',
    enforce: 'pre',
    resolveId(source) {
      // if not a project source file and not a platform file
      if (!source.includes('/llm-x/src/')) return null
      if (!source.includes('.platform')) return null

      const fullPath = path.resolve(source)
      const { dir: sourceDirectory, name } = path.parse(fullPath) // llm-x/src/App.platform -> [ llm-x/src, App ]

      const directoryChildNames = fs.existsSync(sourceDirectory)
        ? fs.readdirSync(sourceDirectory)
        : []

      const fileNameToFind = `${name}.${platform}`

      for (const adjacentFile of directoryChildNames) {
        if (adjacentFile.includes(fileNameToFind)) {
          return path.join(sourceDirectory, adjacentFile)
        }
      }

      return null
    },
  }
}
