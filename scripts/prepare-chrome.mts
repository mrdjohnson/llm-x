import fs, { existsSync, mkdirSync, rmSync } from 'fs'
import path, { dirname } from 'path'
import { zip } from 'zip-a-folder'
import { loadJsonFile } from 'load-json-file'
import { fileURLToPath } from 'url'

const { execSync } = await import('child_process')

const __dirname = dirname(fileURLToPath(import.meta.url))

const distRoot = path.join(__dirname, '../environments/chrome/dist')
const manifestPath = path.join(__dirname, '../environments/chrome/chrome.manifest.json')

const manifest = await loadJsonFile<{ version: string }>(manifestPath)

if (!manifest) throw new Error('Manifest file not found or invalid')

// check if we should update manifest
const noUpdate = !process.argv.includes('--no-update')

if (noUpdate) {
  // Read and bump version
  const versionParts = manifest.version.split('.').map(Number)
  versionParts[2] += 1 // bump patch
  manifest.version = versionParts.join('.')

  // Write back changes
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')

  // Commit changes
  try {
    execSync(`git add "${manifestPath}"`)
    execSync(`git commit -m "chore: bump chrome extension version to ${manifest.version}"`)
    console.log(`Committed manifest with version ${manifest.version}`)
  } catch (err) {
    console.error('Git commit failed:', err)
  }
}

console.log(`Preparing Chrome extension version ${manifest.version}...`)

// start the build
try {
  execSync(`yarn chrome:build`)
} catch (err) {
  console.error('Unable to build project:', err)
}

// create manifest specific version
const outputRoot = path.join(__dirname, '..', 'builds', 'chrome')
const outputZip = path.join(outputRoot, `llm-x-${manifest.version}.zip`)

// Remove existing zip file if present
if (existsSync(outputZip)) {
  rmSync(outputZip, { force: true })
}

// create directory
mkdirSync(outputRoot, { recursive: true })

console.log('Zipping project...')

// zip project
await zip(distRoot, outputZip)

console.log('Project zipped to', outputZip)
