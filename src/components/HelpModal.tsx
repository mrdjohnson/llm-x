import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'

import { settingStore } from '../models/SettingStore'

import Copy from '../icons/Copy'
import CopySuccess from '../icons/CopySuccess'

const OLLAMA_CODE = 'OLLAMA_ORIGINS=*.github.io ollama serve'

const HelpModal = observer(() => {
  const modalRef = useRef<HTMLDialogElement>(null)

  const selectedModel = settingStore.selectedModel

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(OLLAMA_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    if (selectedModel) return

    let timeout = setTimeout(() => {
      modalRef.current?.showModal()
    }, 1500)

    return () => clearTimeout(timeout)
  }, [selectedModel])

  return (
    <dialog ref={modalRef} id="help-modal" className="modal modal-top">
      <div className="modal-box w-9/12 rounded place-self-center max-w-[1000px]">
        <h3 className="font-bold text-xl pb-3">How to connect to Ollama Server:</h3>

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

        <div className="flex flex-row place-content-center gap-2 my-4">
          <div className="prose">
            <code>{OLLAMA_CODE}</code>
          </div>

          <label
            className={'swap btn btn-neutral btn-sm ' + (copied && 'swap-active')}
            onClick={handleCopy}
          >
            <Copy className="swap-off" />
            <CopySuccess className="swap-on" />
          </label>
        </div>

        <div>
          Find out more about <u>Ollama</u> on their website:{' '}
          <a href="https://ollama.com/" className=" link">
            https://ollama.com/
          </a>
        </div>

        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-sm btn-ghost focus:outline-0 absolute right-2 top-2">
              ✕
            </button>
          </form>
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
