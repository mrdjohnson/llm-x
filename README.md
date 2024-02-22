# LLM X

![LLM X logo](https://raw.githubusercontent.com/mrdjohnson/llm-X/main/public/LLMX.png)

***What is this?***
Chat GPT style UI for the niche group of folks who run [Ollama](https://ollama.com/) (think of this like an offline chat gpt) locally. Supports sending images and text!
**WORKS OFFLINE** through PWA ([Progressive Web App](https://web.dev/explore/progressive-web-apps)) standards (its not dead!)

***Why do this?***
I have been interested in **LLM UI** for a while now and this seemed like a good intro application.
I've been introduced to a lot of modern technologies thanks to this project as well, its been fun! 

***Why so many buzz words?***
I couldn't help but bee cool 😎 

  
  ## Tech Stack (thank you's):
***Logic helpers:***
- [React](https://react.dev/)
- [Typescript](https://www.typescriptlang.org/)
- [Mobx State Tree](https://mobx-state-tree.js.org/intro/welcome)

***UI Helpers:***
- [Tailwind css](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Highlight.js](https://www.npmjs.com/package/highlight.js)
- [React Markdown](https://www.npmjs.com/package/react-markdown)

***Project setup helpers:***
- [Vite](https://vitejs.dev/)
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/)


***Inspiration:***
 [ollama-ui's](https://github.com/ollama-ui/ollama-ui) project. Which allows users to connect to ollama via a [web app](https://ollama-ui.github.io/ollama-ui/)

[Perplexity.ai](https://www.perplexity.ai/) Perpexlity has sone some amazing UI advancements in the LLM UI space and I have been very interested in getting to that point. Hopefully this starter project lets me get closer to doing something similar!


## Getting started

Clone the project, and run `npm install` in the root directory

`npm run dev` starts a local instance and opens up a browser tab under https:// (for PWA reasons)

## Goals

- [x] Text Entry and Response to Ollama
- [x] Conversation history
- [x] Ability to manage multiple chats
- [x] Code highlighting with Highlight.js
- [x] Ability to copy responses from Ollama
- [x] **Image to text** using Ollama's multi modal abilities
- [x] **Offline Support** via PWA technology
- [ ] Add Screenshots because no one is going to read these
- [ ] Refresh LLM response button
- [ ] Re-write user message (triggering LLM refresh)
- [ ] LangChain.js integration?
- [ ] OpenAI Integration

## MISC

- LangChain.js was attempted while spiking on this app but unfortunately it was not set up correctly for stopping incoming streams, I hope this gets fixed later in the future OR if possible a custom LLM Agent can be utilized in order to use LangChain

- Originally I used create-react-app 👴 while making this project without knowing it is no longer maintained, I am now using Vite. 🤞 This already allows me to use libs like `ollama-js` that I could not use before. Will be testing more with langchain very soon

- This readme was written with [https://stackedit.io/app](https://stackedit.io/app)

- Changes to the main branch trigger an immediate deploy to https://mrdjohnson.github.io/llm-x/