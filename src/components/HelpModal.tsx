import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'

import { settingStore } from '../models/SettingStore'

import Copy from '../icons/Copy'
import CopySuccess from '../icons/CopySuccess'

const OLLAMA_CODE = 'OLLAMA_ORIGINS=*.github.io ollama serve'
const POWERSHELL_OLLAMA_CODE = '$env:OLLAMA_ORIGINS="https://%2A.github.io/"; ollama serve'

const HelpModal = observer(() => {
  const modalRef = useRef<HTMLDialogElement>(null)

  const [copied, setCopied] = useState(false)
  const [powershellCopied, setPowershellCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(OLLAMA_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handlePowershellCopy = () => {
    navigator.clipboard.writeText(POWERSHELL_OLLAMA_CODE)
    setPowershellCopied(true)
    setTimeout(() => setPowershellCopied(false), 1500)
  }

  useEffect(() => {
    settingStore.setHelpModalRef(modalRef)
  }, [modalRef])

  return (
    <dialog ref={modalRef} id="help-modal" className="modal">
      <div className="modal-box-container">
        <div className="modal-box-content">
          <h3 className="pb-3 text-xl font-bold">How to connect to Ollama Server:</h3>

          <div className="flex flex-col gap-2">
            <p>By default, Ollama allows cross origin requests from 127.0.0.1 and 0.0.0.0.</p>{' '}
            <p>
              To use custom origins (like this one), you can set
              <span className="prose mx-1">
                <code>OLLAMA_ORIGINS</code>
              </span>
              when starting ollama:
            </p>
          </div>

          <div className="my-4 flex flex-row place-content-center gap-2">
            <div className="prose">
              <code>{OLLAMA_CODE}</code>
            </div>

            <button
              className={'btn swap btn-neutral btn-sm ' + (copied && 'swap-active')}
              onClick={handleCopy}
            >
              <Copy className="swap-off" />
              <CopySuccess className="swap-on" />
            </button>
          </div>

          <div className="my-4 flex flex-row place-content-center gap-2">
            <div className="prose">
              Powershell version: <code>{POWERSHELL_OLLAMA_CODE}</code>
            </div>

            <button
              className={'btn swap btn-neutral btn-sm ' + (powershellCopied && 'swap-active')}
              onClick={handlePowershellCopy}
            >
              <Copy className="swap-off" />
              <CopySuccess className="swap-on" />
            </button>
          </div>

          <div>
            Find out more about Ollama on their website:{' '}
            <a href="https://ollama.com/" className=" link">
              https://ollama.com/
            </a>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost btn-sm absolute right-2 top-2 focus:outline-0">
                ✕
              </button>
            </form>
          </div>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        {/* close button */}
        <button />
      </form>
    </dialog>
  )
})

export default HelpModal
