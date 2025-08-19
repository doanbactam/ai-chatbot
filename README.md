<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chat SDK</h1>
</a>

<p align="center">
    Chat SDK is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://sdk.vercel.ai/docs)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports xAI (default), OpenAI, Fireworks, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for saving chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

## Model Providers

This template now supports **multiple AI providers** through the [AI SDK](https://sdk.vercel.ai/docs), giving you access to the latest and most capable language models:

### 🤖 **XAI (xAI)** - Default Provider
- **Grok-2 Vision**: Primary model with vision capabilities
- **Grok-3 Mini Beta**: Advanced reasoning model

### ⚡ **OpenAI**
- **GPT-4**: Most capable model for complex tasks
- **GPT-3.5 Turbo**: Fast and efficient for most tasks

### 🔮 **Anthropic**
- **Claude 3.5 Sonnet**: Balanced performance and speed
- **Claude 3 Haiku**: Fastest Claude model for quick responses

### 🔍 **Google**
- **Gemini Pro**: Google's most capable AI model

### 🌪️ **Mistral**
- **Mixtral 8x7B**: High-performance open-source model
- **Mistral 7B**: Efficient and fast open-source model

### 🎯 **Cohere**
- **Command R+**: Cohere's most advanced model

### Easy Provider Switching
You can switch between providers with just a few lines of code. Each provider is optimized with appropriate configurations for temperature, token limits, and other parameters.

### 🎯 **Auto Model Selection**
The system now includes intelligent **Auto Model Selection** that automatically chooses the best AI model based on your needs:

- **💰 Cost Efficient**: Best value for money (Mistral 7B, Claude 3 Haiku)
- **⚡ Speed Optimized**: Fastest response time (Mistral 7B, Claude 3 Haiku)
- **⭐ Quality Optimized**: Highest quality output (GPT-4, Claude 3.5 Sonnet)
- **⚖️ Balanced**: Good balance of all factors (GPT-3.5 Turbo, Mixtral 8x7B)

Perfect for AI Agents where you can set the strategy and let the system automatically select the optimal model!

📖 **See [AI_PROVIDERS_README.md](AI_PROVIDERS_README.md) for detailed setup instructions.**
📖 **See [AUTO_MODEL_SELECTION_README.md](AUTO_MODEL_SELECTION_README.md) for auto-selection guide.**

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET&envDescription=Learn+more+about+how+to+get+the+API+Keys+for+the+application&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot%2Fblob%2Fmain%2F.env.example&demo-title=AI+Chatbot&demo-description=An+Open-Source+AI+Chatbot+Template+Built+With+Next.js+and+the+AI+SDK+by+Vercel.&demo-url=https%3A%2F%2Fchat.vercel.ai&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22ai%22%2C%22productSlug%22%3A%22grok%22%2C%22integrationSlug%22%3A%22xai%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22upstash-kv%22%2C%22integrationSlug%22%3A%22upstash%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).
