[![Deployed to github pages](https://github.com/mrdjohnson/llm-x/actions/workflows/deploy_to_gh_pages.yml/badge.svg)](https://github.com/mrdjohnson/llm-x/actions/workflows/deploy_to_gh_pages.yml)

# LLM X

![LLM X logo](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/public/LLMX.png)

## How to use web client:

- Download and install [Ollama](https://ollama.com/)
- Pull down a model (or a few) from the [library](https://ollama.com/library) Ex: `ollama pull llava`
- Run this in your terminal `OLLAMA_ORIGINS=*.github.io ollama serve`
- (Powershell users: `$env:OLLAMA_ORIGINS="https://%2A.github.io/"; ollama serve`)
- Use your browser to go to [LLM-X](https://mrdjohnson.github.io/llm-x/)
- Start chatting!

## How to use from project:

- Download and install [Ollama](https://ollama.com/)
- Pull down a model (or a few) from the [library](https://ollama.com/library) Ex: `ollama pull llava`
- Run this in your terminal `ollama serve` (no need for special origins command)
- Pull down this project; `yarn install`, `yarn dev`
- Start chatting!

## Screenshots:

| Conversation about logo                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- |
| ![Logo convo screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-logo-convo.png) |

| Showing off omnibar and code                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------- |
| ![Omnibar and code screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-omnibar-code.png) |

| Showing off code and light theme                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- |
| ![Code and light theme screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-code-light.png) |

| Responding about a cat                                                                                    |
| --------------------------------------------------------------------------------------------------------- |
| ![Cat screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-cat.png) |

| Another logo response                                                                                           |
| --------------------------------------------------------------------------------------------------------------- |
| ![Logo 2 screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-logo-1.png) |

**_What is this?_**
Chat GPT style UI for the niche group of folks who run [Ollama](https://ollama.com/) (think of this like an offline chat gpt) locally. Supports sending images and text!
**WORKS OFFLINE** through PWA ([Progressive Web App](https://web.dev/explore/progressive-web-apps)) standards (its not dead!)

**_Why do this?_**
I have been interested in **LLM UI** for a while now and this seemed like a good intro application.
I've been introduced to a lot of modern technologies thanks to this project as well, its been fun!

**_Why so many buzz words?_**
I couldn't help but bee cool 😎

## Tech Stack (thank you's):

**_Logic helpers:_**

- [React](https://react.dev/)
- [Typescript](https://www.typescriptlang.org/)
- [Mobx State Tree](https://mobx-state-tree.js.org/intro/welcome)

**_UI Helpers:_**

- [Tailwind css](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Highlight.js](https://www.npmjs.com/package/highlight.js)
- [React Markdown](https://www.npmjs.com/package/react-markdown)

**_Project setup helpers:_**

- [Vite](https://vitejs.dev/)
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/)

**_Inspiration:_**
[ollama-ui's](https://github.com/ollama-ui/ollama-ui) project. Which allows users to connect to ollama via a [web app](https://ollama-ui.github.io/ollama-ui/)

[Perplexity.ai](https://www.perplexity.ai/) Perpexlity has sone some amazing UI advancements in the LLM UI space and I have been very interested in getting to that point. Hopefully this starter project lets me get closer to doing something similar!

## Getting started

Clone the project, and run `yarn` in the root directory

`yarn dev` starts a local instance and opens up a browser tab under https:// (for PWA reasons)

## Goals

- [x] Text Entry and Response to Ollama
- [x] Conversation history
- [x] Ability to manage multiple chats
- [x] Code highlighting with Highlight.js
- [x] Ability to copy responses from Ollama
- [x] **Image to text** using Ollama's multi modal abilities
- [x] **Offline Support** via PWA technology
- [x] Add Screenshots because no one is going to read these
- [x] Refresh LLM response button
- [x] Re-write user message (triggering LLM refresh)
- [x] Bot "Personas" allow users to override the bot's system message

## MISC

- LangChain.js was attempted while spiking on this app but unfortunately it was not set up correctly for stopping incoming streams, I hope this gets fixed later in the future OR if possible a custom LLM Agent can be utilized in order to use LangChain

- Originally I used create-react-app 👴 while making this project without knowing it is no longer maintained, I am now using Vite. 🤞 This already allows me to use libs like `ollama-js` that I could not use before. Will be testing more with langchain very soon

- This readme was written with [https://stackedit.io/app](https://stackedit.io/app)

- Changes to the main branch trigger an immediate deploy to https://mrdjohnson.github.io/llm-x/
