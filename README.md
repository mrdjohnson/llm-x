# LLM eXplorer

  ![LLM eXplorer logo](https://raw.githubusercontent.com/mrdjohnson/llm-explorer/main/public/LLMX.png)

This project allows users to run Ollama locally from their machine directly in the browser.

I have been interested in **LLM UI** for a while now and this seemed like a good intro application

  

## Getting started

  

clone the project, and run `npm install` in the root directory

  
`npm run dev` starts a local instance and opens up a browser tab

  

## Goals

  

- [x] Text Entry and Response to Ollama

- [x] Conversation history provided to model

- [x] Ability to manage multiple chats

- [x] Code highlighting with Highlight.js

- [x] Ability to copy responses from Ollama

- [x] Image to text using Ollama's multi modal abilities

- [ ] LangChain.js integration, allowing for Open AI conversations as well

  

## MISC

  

- This app was written primarily using React, Typescript, Tailwind, DaisyUI, and Highlight.js

- This project was originally inspired by `ollama-ui`: https://github.com/ollama-ui/ollama-ui


- LangChain.js was attempted while spiking on this app but unfortunately it was not set up correctly for stopping incoming streams, I hope this gets fixed later in the future OR if possible a custom LLM Agent can be utilized in order to use LangChain

  - Originally I used create-react-app 👴 while making this project without knowing it is no longer maintained, I am now using Vite. 🤞 This already allows me to use libs like `ollama-js` that I could not use before. Will be testing more with langchain very soon

- This readme was written with [https://stackedit.io/app](https://stackedit.io/app)

- Changes to the main branch trigger an immediate deploy to https://mrdjohnson.github.io/llm-explorer/