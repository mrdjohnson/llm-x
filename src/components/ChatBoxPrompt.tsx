import { type To } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import _ from 'lodash'

import AttachmentWrapper from '~/components/AttachmentWrapper'
import FunTitle from '~/components/FunTitle'
import { NavButton } from '~/components/NavButton'

type PromptButtonProps = { title: string; link?: To }

const direction = _.sample([
  'bg-gradient-to-br',
  'bg-gradient-to-tr',

  'bg-gradient-to-bl',
  'bg-gradient-to-tl',
])

const PromptButton = ({ title, link }: PromptButtonProps) => (
  <div
    className={twMerge(
      'group m-[2px] rounded-full from-primary/30 to-secondary/60 p-[1px] transition-all duration-200 hover:m-[0px] hover:p-[3px]',
      direction,
    )}
  >
    <NavButton
      to={link}
      className="btn btn-ghost rounded-full bg-base-100 text-base-content/60 transition-all duration-200 group-hover:!bg-base-100 group-hover:text-base-content"
    >
      <p className="first-letter:text-semibold">{title}</p>
    </NavButton>
  </div>
)

const ChatBoxPrompt = () => {
  return (
    <div className="hero my-auto">
      <div className="hero-content w-fit text-center">
        <div>
          <h1 className="text-2xl font-bold md:text-4xl">
            {'Getting started with '}

            <FunTitle className="text-2xl font-bold md:text-4xl" />
          </h1>

          <div className="mt-8 flex flex-row flex-wrap justify-center gap-2 text-2xl">
            <PromptButton title="Select a model" link="/models" />

            <PromptButton title="Create a system prompt" link="/personas" />

            <AttachmentWrapper>
              <PromptButton title="Attach images" />
            </AttachmentWrapper>

            <AttachmentWrapper accept=".json">
              <PromptButton title="Import previous chat" />
            </AttachmentWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBoxPrompt
