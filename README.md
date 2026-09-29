# Aurora Chat

An open-source, multi-model AI chat app built by **[Nahid Husain Doi](https://portfolio-coral-nu-78.vercel.app)**.
You pick a model (Llama, GPT-OSS, Gemini, free OpenRouter models and more), ask anything, and get the reply streamed back live. Your chats are saved per account.

**Live:** https://ai-chatbot-one-bice-57.vercel.app

## Features

- Chat with models from Groq, Google Gemini and OpenRouter from one place. The model list is fetched live, so models that get retired drop out on their own.
- Replies stream in live, with Markdown, tables and code blocks you can copy.
- You can stop a reply mid-way, retry after an error, and copy or share a whole chat.
- Chat history is saved in Supabase. You can search it, rename chats and delete them.
- Sign in with email or phone and a password, verify with an email code, or use Google sign-in.
- Dark and light "Aurora" themes, and on phones the sidebar opens as a drawer.
- API keys stay on the server. The browser only talks to `/api/chat` and `/api/models`.

## Tech stack

React 19, TypeScript, Vite 8, Supabase (auth and database), and Vercel serverless functions.

## Run locally

```bash
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

`npm run dev` also serves the `/api` functions locally, so you don't need the Vercel CLI.

### Environment variables

| Name | Where it is used |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` | Browser (the Supabase anon key is safe to expose) |
| `GROQ_KEY`, `GEMINI_KEY`, `OPENROUTER_KEY` | Server functions only |

On Vercel, add these under **Project → Settings → Environment Variables**.
The older `VITE_GROQ_KEY`-style names still work for the server functions. Remove them once the new names are set, so the keys can never end up in a client bundle.

### Supabase tables

- `profiles`: `id` (uuid, the user id), `name`, `phone`, `email`
- `conversations`: `id`, `user_id`, `title`, `model_id`, `model_name`, `model_emoji`, `created_at`, `updated_at`
- `messages`: `id`, `conversation_id`, `role`, `content`, `model`, `created_at`

Enable Row Level Security on all three tables, so each user can only read and write their own rows.

## Project structure

```
api/            Vercel functions: chat streaming proxy and live model list
src/components  UI (sidebar, model picker, messages, composer, login)
src/hooks       Chat, history, models and theme logic
src/context     Supabase auth provider
server/         Legacy Express/MongoDB backend (not used by the app)
```
