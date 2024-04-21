[![Deployed to github pages](https://github.com/mrdjohnson/llm-x/actions/workflows/deploy_to_gh_pages.yml/badge.svg)](https://github.com/mrdjohnson/llm-x/actions/workflows/deploy_to_gh_pages.yml)

# LLM X

![LLM X logo](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/public/LLMX.png)

# Privacy statement:

LLM X does not make any external api calls. (go ahead, check your network tab and see the Fetch section). Your chats and image generations are 100% private. This site / app works completely offline.

# Recent additions:

- Ability to pull a model
- Ability to see model information
- Ability to delete a model
- Ability to see generation information on new messages
- Regenerating a message updates the name

# How To Use:

## Install Ollama (and AUTOMATIC1111):

- Download and install [Ollama](https://ollama.com/)
- Pull down a model (or a few) from the [library](https://ollama.com/library) Ex: `ollama pull llava` (or use the app)
- Download and install [AUTOMATIC1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui?tab=readme-ov-file#installation-and-running) (for image generation)

## How to use web client (no install):

- Follow instructions for "Install Ollama"
- Tell Ollama to listen:
  - Use [Ollama's FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server) to set `OLLAMA_ORIGINS` = `*.github.io`
  - Run this in your terminal `OLLAMA_ORIGINS=*.github.io ollama serve`
    - (Powershell users: `$env:OLLAMA_ORIGINS="https://%2A.github.io/"; ollama serve`)
- Use your browser to go to [LLM-X](https://mrdjohnson.github.io/llm-x/)
- Go offline! (optional)
- Start chatting!

## How to use offline:

- Follow instructions for "How to use web client"
- In your browser search bar, there should be a download/install button, press that.
- Go offline! (optional)
- Start chatting!

## How to use from project:

- Follow instructions for "Install Ollama"
- Run this in your terminal `ollama serve` (no need for special origins command)
- Pull down this project; `yarn install`, `yarn dev`
- Go offline! (optional)
- Start chatting!

## Goals / Features

- [x] **Text to Image generation** through AUTOMATIC1111
- [x] **Image to Text** using Ollama's multi modal abilities
- [x] **Offline Support** via PWA technology
- [x] **Code highlighting** with Highlight.js (only handles common languages for now)
- [x] **Search/Command bar** provides quick access to app features through kbar
- [x] Text Entry and Response to Ollama
- [x] Auto saved Chat history
- [x] Manage multiple chats
- [x] Copy/Edit/Detele messages sent or recieved
- [x] Re-write user message (triggering response refresh)
- [x] System Prompt customization through "Personas" feature
- [x] Theme changing through DaisyUI
- [x] Chat image Modal previews through Yet another react lightbox
- [x] Import / Export chat(s)
- [x] **Continuous Deployment!** Merging to the master branch triggers a new github page build/deploy automatically

## Screenshots:

| Conversation about logo                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- |
| ![Logo convo screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-logo-convo.png) |

| Image generation example!                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------- |
| ![Image generation screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-image-generation-1.png) |

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
ChatGPT style UI for the niche group of folks who run [Ollama](https://ollama.com/) (think of this like an offline chat gpt server) locally. Supports sending and receiving images and text!
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
- [Lodash](https://lodash.com/docs/4.17.15)
- [Mobx State Tree](https://mobx-state-tree.js.org/intro/welcome)

**_UI Helpers:_**

- [Tailwind css](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [NextUI](https://nextui.org/)
- [Highlight.js](https://www.npmjs.com/package/highlight.js)
- [React Markdown](https://www.npmjs.com/package/react-markdown)
- [kbar](https://www.npmjs.com/package/kbar)
- [Yet Another React Lightbox](https://yet-another-react-lightbox.com/)

**_Project setup helpers:_**

- [Vite](https://vitejs.dev/)
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/)

**_Inspiration:_**
[ollama-ui's](https://github.com/ollama-ui/ollama-ui) project. Which allows users to connect to ollama via a [web app](https://ollama-ui.github.io/ollama-ui/)

[Perplexity.ai](https://www.perplexity.ai/) Perpexlity has some amazing UI advancements in the LLM UI space and I have been very interested in getting to that point. Hopefully this starter project lets me get closer to doing something similar!

## Getting started

(please note the minimum engine requirements in the package json)

Clone the project, and run `yarn` in the root directory

`yarn dev` starts a local instance and opens up a browser tab under https:// (for PWA reasons)

## MISC

- LangChain.js was attempted while spiking on this app but unfortunately it was not set up correctly for stopping incoming streams, I hope this gets fixed later in the future OR if possible a custom LLM Agent can be utilized in order to use LangChain

  - edit: Langchain is working and added to the app now!

- Originally I used create-react-app 👴 while making this project without knowing it is no longer maintained, I am now using Vite. 🤞 This already allows me to use libs like `ollama-js` that I could not use before. Will be testing more with langchain very soon

- This readme was written with [https://stackedit.io/app](https://stackedit.io/app)

- Changes to the main branch trigger an immediate deploy to https://mrdjohnson.github.io/llm-x/
