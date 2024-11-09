[![Deployed to github pages](https://github.com/mrdjohnson/llm-x/actions/workflows/deploy_to_gh_pages.yml/badge.svg)](https://github.com/mrdjohnson/llm-x/actions/workflows/deploy_to_gh_pages.yml)

# LLM X

![LLM X logo](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/public/LLMX.png)

# Privacy statement:

LLM X does not make any external api calls. (go ahead, check your network tab and see the Fetch section). Your chats and image generations are 100% private. This site / app works completely offline.

# Issues:

LLM X (web app) will not connect to a server that is not secure. This means that you can use LLM X on localhost (considered a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)) but if you're trying to use llm-x over a network the server needs to be from https or else it will not work.

# Recent additions:

- Gemini Nano support!
- IndexedDB support! All text is now saved in IndexedDB instead of local storage
- Auto-connect on load. If there is a server thats visible and ready to connect, we connect to it for you
- LaTex support!
- Users can connect to open ai compatible servers
- Users can connect to multiple of the same server at the same time

# How To Use:

### Prerequisites for application

- Ollama: Download and install [Ollama](https://ollama.com/)
  - Pull down a model (or a few) from the [library](https://ollama.com/library) Ex: `ollama pull llava` (or use the app)
- LM Studio: Download and install [LM Studio](https://lmstudio.ai/)
- AUTOMATIC1111: Git clone [AUTOMATIC1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui?tab=readme-ov-file#installation-and-running) (for image generation)
- Gemini Nano: Download and install [Chrome Canary](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0#heading=h.witohboigk0o)
  - Enable   [On Device Model](chrome://flags/#optimization-guide-on-device-model) by selecting `BypassPerfRequirement`
  - Enable [Api Gemini for nano](chrome://flags/#prompt-api-for-gemini-nano)
  - Relaunch Chrome (may need to wait for it to download)

## How to use web client (no install):

### Prerequisites for web client

- Ollama Options:
  - Use [Ollama's FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server) to set `OLLAMA_ORIGINS` = `https://mrdjohnson.github.io`
  - Run this in your terminal `OLLAMA_ORIGINS=https://mrdjohnson.github.io ollama serve`
    - (Powershell users: `$env:OLLAMA_ORIGINS="https://mrdjohnson.github.io"; ollama serve`)
- LM Studio:
  - Run this in your terminal: `lms server start --cors=true`
- A1111:
  - Run this in the a1111 project folder: `./webui.sh --api --listen --cors-allow-origins "*"`
- Gemini Nano: works automatically

---

- Use your browser to go to [LLM-X](https://mrdjohnson.github.io/llm-x/)
- Go offline! (optional)
- Start chatting!


### Prerequisites for chrome extension
- Download and install [Chrome Extension](https://chromewebstore.google.com/detail/llm-x/iodcdhcpahifeligoegcmcdibdkffclk)
- Ollama Options:
  - Use [Ollama's FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server) to set `OLLAMA_ORIGINS` = `chrome-extension://iodcdhcpahifeligoegcmcdibdkffclk`
  - Run this in your terminal `OLLAMA_ORIGINS=chrome-extension://iodcdhcpahifeligoegcmcdibdkffclk ollama serve`
    - (Powershell users: `$env:OLLAMA_ORIGINS="chrome-extension://iodcdhcpahifeligoegcmcdibdkffclk"; ollama serve`)
- LM Studio:
  - Run this in your terminal: `lms server start --cors=true`
- A1111:
  - Run this in the a1111 project folder: `./webui.sh --api --listen --cors-allow-origins "*"`

## How to use offline:

- Follow instructions for "How to use web client"
- In your browser search bar, there should be a download/install button, press that.
- Go offline! (optional)
- Start chatting!

## How to use from project source:

### Prerequisites for project source

- Ollama: Run this in your terminal `ollama serve`
- LM Studio: Run this in your terminal: `lms server start`
- A1111: Run this in the a1111 project folder: `./webui.sh --api --listen`

---

### Vite preview mode

- Pull down this project; `yarn install`, `yarn preview`
- Go offline! (optional)
- Start chatting!

### Docker

- Run this in your terminal: `docker compose up -d`
- Open http://localhost:3030
- Go offline! (optional)
- Start chatting!

### Chrome Extension

- Pull down this project; `yarn chrome:build`
- Navigate to `chrome://extensions/`
- Load unpacked (developer mode option) from path: `llm-x/extensions/chrome/dist`

## Goals / Features

- [x] **COMPLETELY PRIVATE WORKS COMPLETELY OFFLINE** via PWA technology
- [x] **Ollama integration!**
- [x] **LM Studio integration!**
- [x] **Open AI server integration!**
- [x] **Gemini Nano integration!**
- [x] **AUTOMATIC1111 integration!**
- [x] **Text to Image generation** through AUTOMATIC1111
- [x] **Image to Text** using Ollama's multi modal abilities
- [x] **Code highlighting** with Highlight.js (only handles common languages for now)
- [x] **Search/Command bar** provides quick access to app features through kbar
- [x] **LaTex support**
- [x] Allow users to have as many connections as they want!
- [x] Auto saved Chat history
- [x] Manage multiple chats
- [x] Copy/Edit/Delete messages sent or received
- [x] Re-write user message (triggering response refresh)
- [x] System Prompt customization through "Personas" feature
- [x] Theme changing through DaisyUI
- [x] Chat image Modal previews through Yet another react lightbox
- [x] Import / Export chat(s)
- [x] **Continuous Deployment!** Merging to the master branch triggers a new github page build/deploy automatically

## Screenshots:

| Showing Chrome extension mode with Google's on-device Gemini Nano                                                                |
| -------------------------------------------------------------------------------------------------------------------------------- |
| ![Logo convo screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-gemini-in-extension.png) |

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

| LaTex support!                                                                                                |
| ------------------------------------------------------------------------------------------------------------- |
| ![Latex screenshot](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/screenshots/Screenshot-latex.png) |

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

[Perplexity.ai](https://www.perplexity.ai/) Perplexity has some amazing UI advancements in the LLM UI space and I have been very interested in getting to that point. Hopefully this starter project lets me get closer to doing something similar!

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
